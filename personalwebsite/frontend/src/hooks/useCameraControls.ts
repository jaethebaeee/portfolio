import { useMemo } from 'react';
import { CONTROLS_CONFIG } from '../components/3D/constants/portfolioConstants';
import type { ControlsConfig } from '../components/3D/types/portfolio';

/**
 * Custom hook for generating camera controls configuration based on device type
 * @param isMobile - Whether the current device is mobile
 * @returns {ControlsConfig} Configuration object for OrbitControls
 */
export function useCameraControls(isMobile: boolean): ControlsConfig {
  return useMemo(() => ({
    enablePan: isMobile ? CONTROLS_CONFIG.ENABLE_PAN.MOBILE : CONTROLS_CONFIG.ENABLE_PAN.DESKTOP,
    enableZoom: CONTROLS_CONFIG.ENABLE_ZOOM,
    enableRotate: CONTROLS_CONFIG.ENABLE_ROTATE,
    minDistance: isMobile ? CONTROLS_CONFIG.DISTANCE.MIN.MOBILE : CONTROLS_CONFIG.DISTANCE.MIN.DESKTOP,
    maxDistance: isMobile ? CONTROLS_CONFIG.DISTANCE.MAX.MOBILE : CONTROLS_CONFIG.DISTANCE.MAX.DESKTOP,
    maxPolarAngle: isMobile ? CONTROLS_CONFIG.POLAR_ANGLE.MOBILE : CONTROLS_CONFIG.POLAR_ANGLE.DESKTOP,
    autoRotate: CONTROLS_CONFIG.AUTO_ROTATE,
    autoRotateSpeed: CONTROLS_CONFIG.AUTO_ROTATE_SPEED,
    dampingFactor: CONTROLS_CONFIG.DAMPING_FACTOR,
    enableDamping: CONTROLS_CONFIG.ENABLE_DAMPING,
    touches: CONTROLS_CONFIG.TOUCHES,
  }), [isMobile]);
}

