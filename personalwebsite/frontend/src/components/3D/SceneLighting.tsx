import { LIGHTING_CONFIG } from './constants/portfolioConstants';

/**
 * Scene lighting component that provides ambient, directional, and point lights
 * for the 3D portfolio environment
 */
export function SceneLighting() {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={LIGHTING_CONFIG.AMBIENT.INTENSITY} />

      {/* Main directional light with shadows */}
      <directionalLight
        position={LIGHTING_CONFIG.DIRECTIONAL.POSITION}
        intensity={LIGHTING_CONFIG.DIRECTIONAL.INTENSITY}
        castShadow
        shadow-mapSize-width={LIGHTING_CONFIG.DIRECTIONAL.SHADOW.MAP_SIZE}
        shadow-mapSize-height={LIGHTING_CONFIG.DIRECTIONAL.SHADOW.MAP_SIZE}
        shadow-camera-far={LIGHTING_CONFIG.DIRECTIONAL.SHADOW.FAR}
        shadow-camera-left={LIGHTING_CONFIG.DIRECTIONAL.SHADOW.LEFT}
        shadow-camera-right={LIGHTING_CONFIG.DIRECTIONAL.SHADOW.RIGHT}
        shadow-camera-top={LIGHTING_CONFIG.DIRECTIONAL.SHADOW.TOP}
        shadow-camera-bottom={LIGHTING_CONFIG.DIRECTIONAL.SHADOW.BOTTOM}
      />

      {/* Accent point lights for color and depth */}
      {LIGHTING_CONFIG.POINT_LIGHTS.map((light, index) => (
        <pointLight
          key={index}
          position={light.position}
          intensity={light.intensity}
          color={light.color}
        />
      ))}
    </>
  );
}
