import React from 'react';
import { RETRO_COLORS } from './constants/colors';

interface ZoneLightingProps {
  /** Ambient light intensity multiplier */
  ambientIntensity?: number;
  /** Directional light intensity multiplier */
  directionalIntensity?: number;
  /** Spot light intensity multiplier */
  spotIntensity?: number;
  /** Primary accent color for spot lights */
  primaryAccentColor?: string;
  /** Secondary accent color for spot lights */
  secondaryAccentColor?: string;
  /** Position offset for the zone */
  position?: [number, number, number];
  /** Enable enhanced lighting (brighter, more dramatic) */
  enhanced?: boolean;
}

/**
 * Reusable lighting setup for 3D zones with consistent cyberpunk aesthetic
 */
export const ZoneLighting: React.FC<ZoneLightingProps> = ({
  ambientIntensity = 0.2,
  directionalIntensity = 0.6,
  spotIntensity,
  primaryAccentColor = RETRO_COLORS.neonBlue,
  secondaryAccentColor = RETRO_COLORS.hotPink,
  position = [0, 0, 0],
  enhanced = false
}) => {
  const [px, py, pz] = position;

  // Scale intensities for enhanced mode
  const ambient = enhanced ? ambientIntensity * 5 : ambientIntensity;
  const directional = enhanced ? directionalIntensity * 4 : directionalIntensity;
  const spotDistance = enhanced ? 40 : 25;
  const finalSpotIntensity = spotIntensity ?? (enhanced ? 5.0 : 1.2);

  return (
    <>
      <ambientLight intensity={ambient} />
      <directionalLight
        position={[px, py + 25, pz]}
        intensity={directional}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Cyberpunk accent spotlights */}
      <spotLight
        position={[-15 + px, 15 + py, -15 + pz]}
        target-position={[px, py + 2, pz]}
        color={primaryAccentColor}
        intensity={finalSpotIntensity}
        angle={0.8}
        penumbra={0.5}
        distance={spotDistance}
      />

      <spotLight
        position={[15 + px, 15 + py, 15 + pz]}
        target-position={[px, py + 2, pz]}
        color={secondaryAccentColor}
        intensity={finalSpotIntensity}
        angle={0.8}
        penumbra={0.5}
        distance={spotDistance}
      />
    </>
  );
};
