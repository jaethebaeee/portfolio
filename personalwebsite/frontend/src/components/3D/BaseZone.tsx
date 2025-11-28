import React from 'react';
import { Text } from '@react-three/drei';
import { RETRO_COLORS } from './constants/colors';

interface ZoneTextContent {
  subtitle?: string;
  description?: string;
}

interface BaseZoneProps {
  position: [number, number, number];
  title: string;
  content?: ZoneTextContent;
  platformColor?: string;
  platformSize?: [number, number, number];
  children?: React.ReactNode;
  titlePosition?: [number, number, number];
  contentPosition?: [number, number, number];
  titleFontSize?: number;
  contentFontSize?: number;
}

/**
 * BaseZone component provides a common structure for all portfolio zones
 * Eliminates repetitive code and ensures consistent styling
 */
export const BaseZone = React.memo(function BaseZone({
  position,
  title,
  content,
  platformColor = RETRO_COLORS.stone,
  platformSize = [8, 1, 6],
  children,
  titlePosition = [0, 2, 0],
  contentPosition = [0, 0.5, 0],
  titleFontSize = 1.2,
  contentFontSize = 0.4,
}: BaseZoneProps) {
  return (
    <group position={position}>
      {/* Platform base */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={platformSize} />
        <meshStandardMaterial color={platformColor} />
      </mesh>

      {/* Title */}
      <Text
        position={titlePosition}
        fontSize={titleFontSize}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        castShadow
      >
        {title}
      </Text>

      {/* Content */}
      {content && (
        <group>
          {/* Subtitle */}
          {content.subtitle && (
            <Text
              position={[contentPosition[0], contentPosition[1] + 0.7, contentPosition[2]]}
              fontSize={contentFontSize + 0.1}
              color="#cccccc"
              anchorX="center"
              anchorY="middle"
            >
              {content.subtitle}
            </Text>
          )}

          {/* Main description */}
          <Text
            position={contentPosition}
            fontSize={contentFontSize}
            color="#cccccc"
            anchorX="center"
            anchorY="middle"
          >
            {content.description}
          </Text>
        </group>
      )}

      {/* Additional custom content */}
      {children}
    </group>
  );
});
