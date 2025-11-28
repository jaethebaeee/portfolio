import React from 'react';
import { Text } from '@react-three/drei';

interface PerformanceTextProps {
  /** Text content */
  children: React.ReactNode;
  /** Position in 3D space */
  position: [number, number, number];
  /** Base font size (will be scaled based on performance) */
  fontSize: number;
  /** Performance quality level */
  renderQuality: 'low' | 'medium' | 'high';
  /** Text color */
  color?: string;
  /** Horizontal anchor point */
  anchorX?: 'left' | 'center' | 'right';
  /** Vertical anchor point */
  anchorY?: 'top' | 'middle' | 'bottom';
  /** Font path */
  font?: string;
  /** Outline width */
  outlineWidth?: number;
  /** Outline color */
  outlineColor?: string;
}

/**
 * Performance-aware Text component that scales font size and effects based on render quality
 */
export const PerformanceText: React.FC<PerformanceTextProps> = ({
  children,
  position,
  fontSize,
  renderQuality,
  color = '#ffffff',
  anchorX = 'center',
  anchorY = 'middle',
  font = '/fonts/helvetiker_regular.typeface.json',
  outlineWidth,
  outlineColor
}) => {
  // Scale font size based on performance
  const scaledFontSize = renderQuality === 'low' ? fontSize * 0.8 : fontSize;

  // Scale outline width based on performance
  const scaledOutlineWidth = outlineWidth
    ? (renderQuality === 'low' ? outlineWidth * 0.5 : outlineWidth)
    : undefined;

  return (
    <Text
      position={position}
      fontSize={scaledFontSize}
      color={color}
      anchorX={anchorX}
      anchorY={anchorY}
      font={font}
      outlineWidth={scaledOutlineWidth}
      outlineColor={outlineColor}
    >
      {children}
    </Text>
  );
};


