import * as THREE from 'three';

export interface LODConfig {
  highDetailDistance: number;
  mediumDetailDistance: number;
  lowDetailDistance: number;
  hideDistance: number;
}

export class LevelOfDetail {
  private config: LODConfig;
  private camera: THREE.Camera | null = null;

  constructor(config: LODConfig = {
    highDetailDistance: 20,
    mediumDetailDistance: 40,
    lowDetailDistance: 80,
    hideDistance: 120
  }) {
    this.config = config;
  }

  setCamera(camera: THREE.Camera) {
    this.camera = camera;
  }

  getLODLevel(position: THREE.Vector3): 'high' | 'medium' | 'low' | 'hidden' {
    if (!this.camera) return 'high';

    const distance = this.camera.position.distanceTo(position);

    if (distance > this.config.hideDistance) return 'hidden';
    if (distance > this.config.lowDetailDistance) return 'low';
    if (distance > this.config.mediumDetailDistance) return 'medium';
    return 'high';
  }

  // Apply LOD to particle systems
  applyParticleLOD(particleCount: number, position: THREE.Vector3): number {
    const lod = this.getLODLevel(position);

    switch (lod) {
      case 'hidden': return 0;
      case 'low': return Math.floor(particleCount * 0.3);
      case 'medium': return Math.floor(particleCount * 0.6);
      case 'high': return particleCount;
      default: return particleCount;
    }
  }

  // Apply LOD to geometry detail
  applyGeometryLOD(baseDetail: number, position: THREE.Vector3): number {
    const lod = this.getLODLevel(position);

    switch (lod) {
      case 'hidden': return 0;
      case 'low': return Math.max(1, Math.floor(baseDetail * 0.5));
      case 'medium': return Math.floor(baseDetail * 0.75);
      case 'high': return baseDetail;
      default: return baseDetail;
    }
  }

  // Apply LOD to animation complexity
  shouldAnimate(position: THREE.Vector3): boolean {
    const lod = this.getLODLevel(position);
    return lod === 'high' || lod === 'medium';
  }

  // Apply LOD to emissive materials
  applyEmissiveLOD(intensity: number, position: THREE.Vector3): number {
    const lod = this.getLODLevel(position);

    switch (lod) {
      case 'hidden': return 0;
      case 'low': return intensity * 0.3;
      case 'medium': return intensity * 0.7;
      case 'high': return intensity;
      default: return intensity;
    }
  }
}

// Global LOD instance
export const globalLOD = new LevelOfDetail();



