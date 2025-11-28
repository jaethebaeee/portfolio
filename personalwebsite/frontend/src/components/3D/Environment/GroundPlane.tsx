import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Ground plane with enhanced grass material
 */
export const GroundPlane = React.memo(function GroundPlane() {
  const grassMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2f9e44'), // Saturated fresh grass base color
      roughness: 0.95,
      metalness: 0.0,
    });

    // Create a realistic grass texture with multiple shades and dirt patches
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Create more realistic grass-like texture with organic patterns
    for (let x = 0; x < canvas.width; x += 1) {
      for (let y = 0; y < canvas.height; y += 1) {
        const dirtNoise = Math.random();

        // Create more organic distribution using simplex-like noise
        const organicNoise = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 0.5 + 0.5;

        let color;
        if (dirtNoise < 0.03) {
          // Fewer dirt patches (3% chance) - more subtle
          const dirtColors = ['#5d4037', '#4e342e', '#3e2723'];
          color = dirtColors[Math.floor(Math.random() * dirtColors.length)];
        } else if (organicNoise < 0.2) {
          // Dark grass in clusters
          const darkGrass = ['#1b5e20', '#2e7d32', '#388e3c'];
          color = darkGrass[Math.floor(Math.random() * darkGrass.length)];
        } else if (organicNoise < 0.6) {
          // Medium grass - most common
          const mediumGrass = ['#4caf50', '#66bb6a', '#81c784'];
          color = mediumGrass[Math.floor(Math.random() * mediumGrass.length)];
        } else {
          // Light grass - fresh growth
          const lightGrass = ['#8bc34a', '#9ccc65', '#aed581'];
          color = lightGrass[Math.floor(Math.random() * lightGrass.length)];
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);

        // Add more realistic grass blade-like details
        if (Math.random() < 0.04) {
          ctx.fillStyle = '#1b5e20';
          const bladeLength = Math.random() * 4 + 2;
          ctx.fillRect(x, y, 1, bladeLength);
        }

        // Add subtle grass blade shadows
        if (Math.random() < 0.02) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(x, y, 1, Math.random() * 2 + 1);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    texture.anisotropy = 16;

    material.map = texture;
    material.needsUpdate = true;

    return material;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[120, 120, 32, 32]} />
      <primitive object={grassMaterial} attach="material" />
    </mesh>
  );
});
