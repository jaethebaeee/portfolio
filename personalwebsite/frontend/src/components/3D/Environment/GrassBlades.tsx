import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Vector3, Object3D, Color, DoubleSide } from 'three';

/**
 * Procedural grass blades with wind animation
 */
export const GrassBlades = React.memo(function GrassBlades() {
  const grassBladeRef = useRef<InstancedMesh>(null);
  const windTimeRef = useRef(0);

  // Create procedural grass blades with more variation
  const grassBlades = useMemo(() => {
    const blades: { position: Vector3; height: number; color: Color }[] = [];
    const bladeCount = 300; // More blades for denser grass

    for (let i = 0; i < bladeCount; i++) {
      // Random positions within the ground area, avoiding zone platforms
      let x, z;
      do {
        x = (Math.random() - 0.5) * 100;
        z = (Math.random() - 0.5) * 100;
      } while (
        // Avoid zone platform areas
        (Math.abs(x + 15) < 8 && Math.abs(z + 15) < 8) ||
        (Math.abs(x + 15) < 8 && Math.abs(z) < 8) ||
        (Math.abs(x - 15) < 8 && Math.abs(z) < 8) ||
        (Math.abs(x - 15) < 8 && Math.abs(z + 15) < 8)
      );

      const height = 0.8 + Math.random() * 1.2; // Vary blade heights
      const y = height / 2; // Position at base

      // Vary grass colors for more realism
      const colorVariations = [
        new Color('#2d5016'), // Dark green
        new Color('#4ade80'), // Bright green
        new Color('#22c55e'), // Medium green
        new Color('#16a34a'), // Forest green
      ];

      blades.push({
        position: new Vector3(x, y, z),
        height,
        color: colorVariations[Math.floor(Math.random() * colorVariations.length)]
      });
    }

    return blades;
  }, []);

  // Wind animation for grass
  useFrame((state) => {
    windTimeRef.current = state.clock.getElapsedTime();

    if (grassBladeRef.current) {
      const dummy = new Object3D();

      grassBlades.forEach((blade, i) => {
        const windStrength = 0.15;
        const windSpeed = 1 + Math.sin(windTimeRef.current * 2 + i * 0.1) * 0.5;
        const windOffset = Math.sin(windTimeRef.current * windSpeed + blade.position.x * 0.1 + blade.position.z * 0.1) * windStrength;

        dummy.position.set(blade.position.x, blade.position.y, blade.position.z);
        dummy.rotation.z = windOffset;
        dummy.scale.set(0.8 + Math.random() * 0.4, blade.height, 1);
        dummy.updateMatrix();

        grassBladeRef.current!.setMatrixAt(i, dummy.matrix);
        grassBladeRef.current!.setColorAt(i, blade.color);
      });

      grassBladeRef.current.instanceMatrix.needsUpdate = true;
      if (grassBladeRef.current.instanceColor) {
        grassBladeRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <instancedMesh ref={grassBladeRef} args={[undefined, undefined, grassBlades.length]}>
      <planeGeometry args={[0.08, 1]} />
      <meshStandardMaterial
        side={DoubleSide}
        transparent
        alphaTest={0.3}
        roughness={0.9}
        metalness={0.0}
        vertexColors={true}
      />
    </instancedMesh>
  );
});
