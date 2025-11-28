import React from 'react';

// TypeScript interfaces for VoxelPortfolio components

export interface VoxelPortfolioProps {
  onExit?: () => void;
  onBack?: () => void;
  onForward?: () => void;
}

export interface PortfolioSceneProps {
  isMobile: boolean;
}

export interface LoadingManagerProps {
  children: React.ReactNode;
  onLoaded: () => void;
  progressOverride?: number;
}

export interface ZoneConfig {
  name: string;
  position: [number, number, number];
  component: React.ComponentType;
}

export interface LightingConfig {
  ambient: {
    intensity: number;
  };
  directional: {
    position: [number, number, number];
    intensity: number;
    shadow: {
      mapSize: number;
      far: number;
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
  };
  pointLights: Array<{
    position: [number, number, number];
    intensity: number;
    color: string;
  }>;
}

export interface CameraConfig {
  position: [number, number, number];
  fov: number;
  near: number;
  far: number;
}

export interface ControlsConfig {
  enablePan: boolean;
  enableZoom: boolean;
  enableRotate: boolean;
  minDistance: number;
  maxDistance: number;
  maxPolarAngle: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
  dampingFactor: number;
  enableDamping: boolean;
  touches: {
    ONE: number;
    TWO: number;
  };
}

export interface CanvasConfig {
  shadows: boolean;
  camera: CameraConfig;
  gl: {
    antialias: boolean;
    alpha: boolean;
    powerPreference: string;
    stencil: boolean;
    depth: boolean;
  };
  dpr: number | [number, number];
  style: {
    width: string;
    height: string;
    display: string;
    background: string;
  };
}

export interface ShadowConfig {
  position: [number, number, number];
  opacity: number;
  scale: number;
  blur: number;
  far: number;
}

export interface ZoneInfoItem {
  name: string;
  description: string;
  color: string;
}

export interface UIConfig {
  container: {
    style: {
      width: string;
      height: string;
      position: string;
      overflow: string;
    };
  };
  exitButton: {
    position: {
      top: string;
      padding: string;
    };
    styles: string;
  };
  controlsPanel: {
    position: string;
    padding: string;
    styles: string;
  };
}

// Hook return types
export interface UseMobileReturn {
  isMobile: boolean;
}

export interface UseCameraControlsReturn {
  controlsConfig: ControlsConfig;
}

// Component prop types for sub-components
export interface LightingProps {
  config: LightingConfig;
}

export interface ZonesLayoutProps {
  zones: ZoneConfig[];
}

export interface SceneControlsProps {
  config: ControlsConfig;
  showShadows: boolean;
  shadowConfig: ShadowConfig;
}
