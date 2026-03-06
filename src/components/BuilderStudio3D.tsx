import { useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { BLOCK_PALETTE } from '../lib/block-engine';
import type { ScenePack } from '../lib/scene-pack';

type BuilderStudio3DProps = {
  scenePack: ScenePack;
  activeStepIndex: number;
  autoRotate: boolean;
  canvasRef?: MutableRefObject<HTMLCanvasElement | null>;
  exploded: boolean;
  instructionSync: boolean;
};

const PART_COLORS = Object.values(BLOCK_PALETTE).reduce<Record<string, string>>((colors, color) => {
  colors[color.id] = color.hex;
  return colors;
}, {});

const getBoardColor = (scenePack: ScenePack) => {
  switch (scenePack.builder.boardTheme) {
    case 'night-bench':
      return '#152139';
    case 'playfield':
      return '#d9ebd4';
    default:
      return '#eef3f8';
  }
};

const buildAssemblyStepLookup = (scenePack: ScenePack) =>
  scenePack.instructions.steps.reduce<Record<string, number>>((lookup, step, stepIndex) => {
    step.assemblyIds.forEach((assemblyId) => {
      lookup[assemblyId] = stepIndex;
    });
    return lookup;
  }, {});

export function BuilderStudio3D({
  scenePack,
  activeStepIndex,
  autoRotate,
  canvasRef,
  exploded,
  instructionSync,
}: BuilderStudio3DProps) {
  const localCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const assemblyStepLookup = useMemo(() => buildAssemblyStepLookup(scenePack), [scenePack]);

  useEffect(() => {
    const canvas = canvasRef?.current ?? localCanvasRef.current;

    if (!canvas) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.1, 1000);
    const controls = new OrbitControls(camera, canvas);
    const partGroup = new THREE.Group();
    const boardGroup = new THREE.Group();
    const meshes: Array<{
      assemblyId: string;
      basePosition: THREE.Vector3;
      mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshPhysicalMaterial>;
      stepIndex: number;
    }> = [];

    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene.add(partGroup);
    scene.add(boardGroup);
    scene.add(new THREE.AmbientLight(0xffffff, 0.52));
    scene.add(new THREE.HemisphereLight(0xf7fbff, 0xd7e2ee, 1.15));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.55);
    keyLight.position.set(9, 15, 14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.radius = 8;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf6fbff, 0.8);
    fillLight.position.set(-10, 9, 12);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x8bb6ff, 0.72);
    rimLight.position.set(-8, 10, 18);
    scene.add(rimLight);

    const boardWidth = Math.max(18, scenePack.model.spec.targetStuds.width * 0.6);
    const boardHeight = Math.max(12, scenePack.model.spec.targetStuds.depth * 0.55);
    const backdrop = new THREE.Mesh(
      new THREE.BoxGeometry(boardWidth + 8, boardHeight + 10, 0.8),
      new THREE.MeshStandardMaterial({
        color: 0xf9fbfe,
        metalness: 0.02,
        roughness: 0.98,
      }),
    );
    backdrop.position.set(0, 0.4, -3.8);
    backdrop.receiveShadow = true;
    boardGroup.add(backdrop);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(boardWidth, boardHeight, 0.8),
      new THREE.MeshStandardMaterial({
        color: getBoardColor(scenePack),
        metalness: 0.08,
        roughness: 0.82,
      }),
    );
    board.position.set(0, 0, -1.6);
    board.receiveShadow = true;
    boardGroup.add(board);

    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(boardWidth + 1.6, 1.4, 1),
      new THREE.MeshStandardMaterial({
        color: 0x101828,
        metalness: 0.1,
        roughness: 0.72,
      }),
    );
    trim.position.set(0, -boardHeight / 2 - 0.2, -1.2);
    trim.castShadow = true;
    trim.receiveShadow = true;
    boardGroup.add(trim);

    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(boardWidth * 0.82, 0.9, 2.4),
      new THREE.MeshStandardMaterial({
        color: 0xf4f7fb,
        metalness: 0.04,
        roughness: 0.88,
      }),
    );
    shelf.position.set(0, -boardHeight / 2 + 1.1, 0.4);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    boardGroup.add(shelf);

    const shadowFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(boardWidth + 10, boardHeight * 0.8),
      new THREE.ShadowMaterial({
        opacity: 0.16,
      }),
    );
    shadowFloor.rotation.x = -Math.PI / 2;
    shadowFloor.position.set(0, -boardHeight / 2 + 0.9, 2.4);
    shadowFloor.receiveShadow = true;
    scene.add(shadowFloor);

    scenePack.model.ir.parts.forEach((part) => {
      const width = Math.max(0.6, part.studsX * 0.55);
      const height = Math.max(0.6, part.studsZ * 0.55);
      const depth = Math.max(0.36, part.heightPlates * 0.22);
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshPhysicalMaterial({
        color: PART_COLORS[part.colorId] ?? '#101828',
        metalness: part.colorId === 'white' ? 0.02 : 0.18,
        roughness: part.colorId === 'white' ? 0.52 : 0.34,
        clearcoat: part.colorId === 'white' ? 0.72 : 0.58,
        clearcoatRoughness: part.colorId === 'white' ? 0.36 : 0.24,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const stepIndex = assemblyStepLookup[part.assemblyId] ?? 0;
      const basePosition = new THREE.Vector3(
        part.transform.x / 20,
        -part.transform.z / 20,
        part.transform.y / 20,
      );

      mesh.position.copy(basePosition);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      partGroup.add(mesh);
      meshes.push({
        assemblyId: part.assemblyId,
        basePosition,
        mesh,
        stepIndex,
      });
    });

    const bounds = new THREE.Box3().setFromObject(partGroup);
    const center = bounds.getCenter(new THREE.Vector3());
    partGroup.position.sub(center);
    boardGroup.position.x -= center.x;
    boardGroup.position.y -= center.y;
    shadowFloor.position.x -= center.x;
    shadowFloor.position.y -= center.y;

    camera.position.set(7.6, 4.8, 18);
    controls.target.set(0, 1.7, 0.4);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.maxDistance = 28;
    controls.minDistance = 8;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.4;
    controls.update();

    const resize = () => {
      const width = canvas.clientWidth || scenePack.visual.canvasSize.width;
      const height = canvas.clientHeight || scenePack.visual.canvasSize.height;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    const syncMeshes = () => {
      meshes.forEach(({ mesh, basePosition, stepIndex }) => {
        const visible = instructionSync ? stepIndex <= activeStepIndex : true;
        mesh.visible = visible;

        const explodeOffset = exploded ? stepIndex * 0.9 : 0;
        mesh.position.set(
          basePosition.x + (exploded ? stepIndex * 0.24 : 0),
          basePosition.y + explodeOffset,
          basePosition.z + (exploded ? stepIndex * 0.4 : 0),
        );
      });
    };

    resize();
    syncMeshes();

    let frame = 0;

    const render = () => {
      frame = window.requestAnimationFrame(render);
      controls.autoRotate = autoRotate;
      controls.update();
      syncMeshes();
      renderer.render(scene, camera);
    };

    render();
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      controls.dispose();
      meshes.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      renderer.dispose();
    };
  }, [activeStepIndex, assemblyStepLookup, autoRotate, canvasRef, exploded, instructionSync, scenePack]);

  return (
    <canvas
      className="studio-canvas"
      height={scenePack.visual.canvasSize.height}
      ref={canvasRef ?? localCanvasRef}
      width={scenePack.visual.canvasSize.width}
    />
  );
}
