import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HoverEffectProps {
  children: React.ReactNode;
  glowColor?: string;
  glowIntensity?: number;
  scaleMultiplier?: number;
}

export function HoverEffect({
  children,
  glowColor = '#4ecdc4',
  glowIntensity = 0.5,
  scaleMultiplier = 1.05
}: HoverEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((_state) => {
    if (!groupRef.current) return;

    const targetScale = isHovered ? scaleMultiplier : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      {children}

      {/* Glow effect when hovered */}
      {isHovered && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[2, 16, 16]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={glowIntensity}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}
