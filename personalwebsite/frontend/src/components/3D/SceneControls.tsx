import { OrbitControls, ContactShadows } from '@react-three/drei';
import { SHADOW_CONFIG } from './constants/portfolioConstants';
import type { ControlsConfig } from './types/portfolio';

interface SceneControlsProps {
  config: ControlsConfig;
  showShadows: boolean;
}

/**
 * Scene controls component that handles camera controls and optional shadows
 */
export function SceneControls({ config, showShadows }: SceneControlsProps) {
  return (
    <>
      {/* Camera controls */}
      <OrbitControls
        enablePan={config.enablePan}
        enableZoom={config.enableZoom}
        enableRotate={config.enableRotate}
        minDistance={config.minDistance}
        maxDistance={config.maxDistance}
        maxPolarAngle={config.maxPolarAngle}
        autoRotate={config.autoRotate}
        autoRotateSpeed={config.autoRotateSpeed}
        dampingFactor={config.dampingFactor}
        enableDamping={config.enableDamping}
        touches={config.touches}
      />

      {/* Contact shadows - conditionally rendered */}
      {showShadows && (
        <ContactShadows
          position={SHADOW_CONFIG.POSITION}
          opacity={SHADOW_CONFIG.OPACITY}
          scale={SHADOW_CONFIG.SCALE}
          blur={SHADOW_CONFIG.BLUR}
          far={SHADOW_CONFIG.FAR}
        />
      )}
    </>
  );
}
