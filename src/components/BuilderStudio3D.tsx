import { useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  BoxGeometry,
  Color,
  DirectionalLight,
  FogExp2,
  Group,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  SpotLight,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
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
      return '#18233c';
    case 'playfield':
      return '#d9ebd4';
    default:
      return '#dde6f0';
  }
};

const buildAssemblyStepLookup = (scenePack: ScenePack) =>
  scenePack.instructions.steps.reduce<Record<string, number>>((lookup, step, stepIndex) => {
    step.assemblyIds.forEach((assemblyId) => {
      lookup[assemblyId] = stepIndex;
    });
    return lookup;
  }, {});

type BuilderStudioMesh = {
  basePosition: Vector3;
  mesh: Mesh<BoxGeometry, MeshPhysicalMaterial>;
  stepIndex: number;
};

type BuilderStudioDisplayState = {
  activeStepIndex: number;
  autoRotate: boolean;
  exploded: boolean;
  instructionSync: boolean;
};

type BuilderStudioRuntime = {
  controls: OrbitControls;
  meshes: BuilderStudioMesh[];
  renderer: WebGLRenderer;
};

const syncMeshes = (
  meshes: BuilderStudioMesh[],
  { activeStepIndex, exploded, instructionSync }: BuilderStudioDisplayState,
) => {
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
  const runtimeRef = useRef<BuilderStudioRuntime | null>(null);
  const displayStateRef = useRef<BuilderStudioDisplayState>({
    activeStepIndex,
    autoRotate,
    exploded,
    instructionSync,
  });

  useEffect(() => {
    displayStateRef.current = {
      activeStepIndex,
      autoRotate,
      exploded,
      instructionSync,
    };

    const runtime = runtimeRef.current;

    if (!runtime) {
      return;
    }

    runtime.controls.autoRotate = autoRotate;
    syncMeshes(runtime.meshes, displayStateRef.current);
  }, [activeStepIndex, autoRotate, exploded, instructionSync]);

  useEffect(() => {
    const canvas = canvasRef?.current ?? localCanvasRef.current;

    if (!canvas) {
      return;
    }

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    const scene = new Scene();
    const camera = new PerspectiveCamera(32, 16 / 9, 0.1, 1000);
    const controls = new OrbitControls(camera, canvas);
    const partGroup = new Group();
    const boardGroup = new Group();
    const meshes: BuilderStudioMesh[] = [];
    const accentColor = new Color(scenePack.builder.accentColor);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = true;
    scene.fog = new FogExp2(accentColor.clone().lerp(new Color('#ffffff'), 0.94), 0.018);

    scene.add(partGroup);
    scene.add(boardGroup);
    scene.add(new AmbientLight(0xffffff, 0.42));
    scene.add(new HemisphereLight(0xf7fbff, 0xcfd8e6, 1));

    const keyLight = new DirectionalLight(0xffffff, 1.95);
    keyLight.position.set(10, 14, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.radius = 8;
    scene.add(keyLight);

    const fillLight = new DirectionalLight(0xe9f1ff, 0.86);
    fillLight.position.set(-8, 7, 12);
    scene.add(fillLight);

    const rimLight = new DirectionalLight(accentColor, 0.72);
    rimLight.position.set(-6, 8, 16);
    scene.add(rimLight);

    const accentLight = new SpotLight(accentColor, 0.68, 70, Math.PI / 4.5, 0.32, 1.25);
    accentLight.position.set(-5, 8, 12);
    accentLight.target.position.set(0, 0.5, 0);
    scene.add(accentLight);
    scene.add(accentLight.target);

    const boardWidth = Math.max(18, scenePack.model.spec.targetStuds.width * 0.6);
    const boardHeight = Math.max(12, scenePack.model.spec.targetStuds.depth * 0.55);
    const backdrop = new Mesh(
      new BoxGeometry(boardWidth + 8, boardHeight + 10, 0.8),
      new MeshStandardMaterial({
        color: accentColor.clone().lerp(new Color('#d8e3ef'), 0.84),
        metalness: 0.02,
        roughness: 0.92,
      }),
    );
    backdrop.position.set(0, 0.4, -3.8);
    backdrop.receiveShadow = true;
    boardGroup.add(backdrop);

    const board = new Mesh(
      new BoxGeometry(boardWidth, boardHeight, 0.8),
      new MeshStandardMaterial({
        color: getBoardColor(scenePack),
        metalness: 0.08,
        roughness: 0.82,
      }),
    );
    board.position.set(0, 0, -1.6);
    board.receiveShadow = true;
    boardGroup.add(board);

    const trim = new Mesh(
      new BoxGeometry(boardWidth + 1.6, 1.4, 1),
      new MeshStandardMaterial({
        color: accentColor.clone().lerp(new Color('#101828'), 0.7),
        metalness: 0.1,
        roughness: 0.72,
      }),
    );
    trim.position.set(0, -boardHeight / 2 - 0.2, -1.2);
    trim.castShadow = true;
    trim.receiveShadow = true;
    boardGroup.add(trim);

    const accentRail = new Mesh(
      new BoxGeometry(boardWidth * 0.58, 0.3, 1.2),
      new MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor.clone().multiplyScalar(0.15),
        metalness: 0.12,
        roughness: 0.42,
      }),
    );
    accentRail.position.set(0, -boardHeight / 2 + 0.3, -0.15);
    accentRail.castShadow = true;
    accentRail.receiveShadow = true;
    boardGroup.add(accentRail);

    const shelf = new Mesh(
      new BoxGeometry(boardWidth * 0.82, 0.9, 2.4),
      new MeshStandardMaterial({
        color: 0xf4f7fb,
        metalness: 0.04,
        roughness: 0.88,
      }),
    );
    shelf.position.set(0, -boardHeight / 2 + 1.1, 0.4);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    boardGroup.add(shelf);

    const plinth = new Mesh(
      new BoxGeometry(boardWidth * 0.38, 0.7, 4.2),
      new MeshStandardMaterial({
        color: 0xfdfefe,
        metalness: 0.05,
        roughness: 0.6,
      }),
    );
    plinth.position.set(0, -boardHeight / 2 + 1.5, 0.8);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    boardGroup.add(plinth);

    const plinthTrim = new Mesh(
      new BoxGeometry(boardWidth * 0.38, 0.12, 4.24),
      new MeshStandardMaterial({
        color: accentColor,
        metalness: 0.14,
        roughness: 0.34,
      }),
    );
    plinthTrim.position.set(0, -boardHeight / 2 + 1.86, 0.8);
    plinthTrim.castShadow = true;
    plinthTrim.receiveShadow = true;
    boardGroup.add(plinthTrim);

    const shadowFloor = new Mesh(
      new PlaneGeometry(boardWidth + 10, boardHeight * 0.8),
      new ShadowMaterial({
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
      const geometry = new BoxGeometry(width, height, depth);
      const material = new MeshPhysicalMaterial({
        color: PART_COLORS[part.colorId] ?? '#101828',
        emissive: PART_COLORS[part.colorId] ?? '#101828',
        emissiveIntensity: part.colorId === 'white' ? 0 : 0.015,
        metalness: part.colorId === 'white' ? 0.03 : 0.12,
        roughness: part.colorId === 'white' ? 0.32 : 0.24,
        clearcoat: part.colorId === 'white' ? 0.8 : 0.76,
        clearcoatRoughness: part.colorId === 'white' ? 0.16 : 0.14,
      });
      const mesh = new Mesh(geometry, material);
      const stepIndex = assemblyStepLookup[part.assemblyId] ?? 0;
      const basePosition = new Vector3(
        part.transform.x / 20,
        -part.transform.z / 20,
        part.transform.y / 20,
      );

      mesh.position.copy(basePosition);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      partGroup.add(mesh);
      meshes.push({
        basePosition,
        mesh,
        stepIndex,
      });
    });

    partGroup.rotation.y = -Math.PI * 0.22;
    partGroup.rotation.x = Math.PI * 0.05;

    const bounds = new Box3().setFromObject(partGroup);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z, 8);
    partGroup.position.sub(center);
    boardGroup.position.x -= center.x;
    boardGroup.position.y -= center.y;
    shadowFloor.position.x -= center.x;
    shadowFloor.position.y -= center.y;

    camera.position.set(maxDimension * 1.18, maxDimension * 0.82, maxDimension * 1.46);
    controls.target.set(0, Math.max(0.6, size.y * 0.1), 0.4);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.maxDistance = maxDimension * 4.8;
    controls.minDistance = maxDimension * 1.1;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.52;
    controls.autoRotate = displayStateRef.current.autoRotate;
    controls.autoRotateSpeed = 0.85;
    controls.update();

    const resize = () => {
      const width = canvas.clientWidth || scenePack.visual.canvasSize.width;
      const height = canvas.clientHeight || scenePack.visual.canvasSize.height;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    resize();
    syncMeshes(meshes, displayStateRef.current);
    runtimeRef.current = {
      controls,
      meshes,
      renderer,
    };

    let frame = 0;

    const render = () => {
      frame = window.requestAnimationFrame(render);
      controls.autoRotate = displayStateRef.current.autoRotate;
      controls.update();
      syncMeshes(meshes, displayStateRef.current);
      renderer.render(scene, camera);
    };

    render();
    window.addEventListener('resize', resize);

    return () => {
      if (runtimeRef.current?.renderer === renderer) {
        runtimeRef.current = null;
      }
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      controls.dispose();
      meshes.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      renderer.dispose();
    };
  }, [assemblyStepLookup, canvasRef, scenePack]);

  return (
    <canvas
      className="studio-canvas"
      height={scenePack.visual.canvasSize.height}
      ref={canvasRef ?? localCanvasRef}
      width={scenePack.visual.canvasSize.width}
    />
  );
}
