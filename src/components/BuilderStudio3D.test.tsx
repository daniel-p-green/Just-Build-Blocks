import '../test-support/happy-dom';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ScenePack } from '../lib/scene-pack';

const {
  MockBox3,
  MockColor,
  MockDirectionalLight,
  MockMesh,
  MockObject3D,
  MockPerspectiveCamera,
  MockRenderer,
  MockSpotLight,
  MockVector3,
  rendererConstructor,
} = vi.hoisted(() => {
  const rendererConstructor = vi.fn();

  class MockVector3 {
    x = 0;
    y = 0;
    z = 0;

    constructor(x = 0, y = 0, z = 0) {
      this.set(x, y, z);
    }

    clone() {
      return new MockVector3(this.x, this.y, this.z);
    }

    copy(vector: MockVector3) {
      return this.set(vector.x, vector.y, vector.z);
    }

    set(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }

    sub(vector: MockVector3) {
      this.x -= vector.x;
      this.y -= vector.y;
      this.z -= vector.z;
      return this;
    }
  }

  class MockColor {
    private readonly value: string | number;

    constructor(value: string | number) {
      this.value = value;
    }

    clone() {
      return new MockColor(this.value);
    }

    lerp() {
      return this;
    }

    multiplyScalar() {
      return this;
    }
  }

  class MockObject3D {
    position = new MockVector3();
    rotation = new MockVector3();
    castShadow = false;
    receiveShadow = false;

    add() {}
  }

  class MockMesh extends MockObject3D {
    geometry = {
      dispose() {},
    };

    material = {
      dispose() {},
    };

    visible = true;
  }

  class MockRenderer {
    shadowMap = {
      enabled: false,
      type: null,
    };

    outputColorSpace = '';
    toneMapping = '';
    toneMappingExposure = 0;

    constructor() {
      rendererConstructor();
    }

    dispose() {}

    render() {}

    setClearColor() {}

    setPixelRatio() {}

    setSize() {}
  }

  class MockBox3 {
    setFromObject() {
      return this;
    }

    getCenter(vector: MockVector3) {
      return vector.set(0, 0, 0);
    }
  }

  class MockPerspectiveCamera extends MockObject3D {
    aspect = 1;
    updateProjectionMatrix() {}
  }

  class MockDirectionalLight extends MockObject3D {
    shadow = {
      mapSize: {
        width: 0,
        height: 0,
      },
      radius: 0,
    };
  }

  class MockSpotLight extends MockObject3D {
    target = new MockObject3D();
  }

  return {
    MockBox3,
    MockColor,
    MockDirectionalLight,
    MockMesh,
    MockObject3D,
    MockPerspectiveCamera,
    MockRenderer,
    MockSpotLight,
    MockVector3,
    rendererConstructor,
  };
});

vi.mock('three', () => ({
  ACESFilmicToneMapping: 'aces-filmic',
  AmbientLight: class extends MockObject3D {},
  Box3: MockBox3,
  BoxGeometry: class {},
  Color: MockColor,
  DirectionalLight: MockDirectionalLight,
  FogExp2: class {},
  Group: class extends MockObject3D {},
  HemisphereLight: class extends MockObject3D {},
  Mesh: MockMesh,
  MeshPhysicalMaterial: class {},
  MeshStandardMaterial: class {},
  PCFSoftShadowMap: 'pcf-soft',
  PerspectiveCamera: MockPerspectiveCamera,
  PlaneGeometry: class {},
  Scene: class extends MockObject3D {
    fog: unknown = null;
  },
  ShadowMaterial: class {},
  SpotLight: MockSpotLight,
  SRGBColorSpace: 'srgb',
  Vector3: MockVector3,
  WebGLRenderer: MockRenderer,
}));

vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: class {
    target = new MockVector3();
    enablePan = false;
    enableDamping = false;
    maxDistance = 0;
    minDistance = 0;
    autoRotate = false;
    autoRotateSpeed = 0;

    constructor() {}

    dispose() {}

    update() {}
  },
}));

import { BuilderStudio3D } from './BuilderStudio3D';

const scenePack = {
  builder: {
    accentColor: '#0055BF',
    boardTheme: 'playfield',
  },
  instructions: {
    steps: [
      {
        assemblyIds: ['assembly-1'],
      },
      {
        assemblyIds: ['assembly-2'],
      },
    ],
  },
  model: {
    ir: {
      parts: [
        {
          assemblyId: 'assembly-1',
          colorId: 'red',
          heightPlates: 3,
          studsX: 1,
          studsZ: 1,
          transform: {
            x: 0,
            y: 0,
            z: 0,
          },
        },
      ],
    },
    spec: {
      targetStuds: {
        depth: 8,
        width: 8,
      },
    },
  },
  visual: {
    canvasSize: {
      height: 900,
      width: 1600,
    },
  },
} as unknown as ScenePack;

describe('BuilderStudio3D', () => {
  beforeEach(() => {
    rendererConstructor.mockClear();
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
  });

  it('keeps the Three.js runtime alive across instruction and toggle updates', async () => {
    const { rerender } = render(
      <BuilderStudio3D
        activeStepIndex={0}
        autoRotate={false}
        exploded={false}
        instructionSync={true}
        scenePack={scenePack}
      />,
    );

    await waitFor(() => {
      expect(rendererConstructor).toHaveBeenCalledTimes(1);
    });

    rerender(
      <BuilderStudio3D
        activeStepIndex={1}
        autoRotate={true}
        exploded={true}
        instructionSync={false}
        scenePack={scenePack}
      />,
    );

    await waitFor(() => {
      expect(rendererConstructor).toHaveBeenCalledTimes(1);
    });
  });
});
