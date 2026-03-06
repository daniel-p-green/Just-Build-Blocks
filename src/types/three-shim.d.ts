declare module 'three';

declare module 'three/examples/jsm/controls/OrbitControls.js' {
  export class OrbitControls {
    constructor(object: any, domElement?: any);
    target: any;
    enablePan: boolean;
    enableDamping: boolean;
    maxDistance: number;
    minDistance: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    update(): void;
    dispose(): void;
  }
}
