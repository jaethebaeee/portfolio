import React from 'react';
import * as THREE from 'three';
import { RETRO_COLORS } from '../constants/colors';

/**
 * Decorative elements like grass patches, flowers, and rocks
 */
export const DecorativeElements = React.memo(function DecorativeElements() {
  return (
    <>
      {/* Grass patches for added detail */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 25 + Math.random() * 20;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]}
            position={[x, 0.02, z]}
            receiveShadow
          >
            <circleGeometry args={[2 + Math.random() * 3, 8]} />
            <meshStandardMaterial
              color={new THREE.Color(RETRO_COLORS.grass).multiplyScalar(0.85 + Math.random() * 0.2)}
              roughness={0.9}
              metalness={0.0}
            />
          </mesh>
        );
      })}

      {/* Small flowers scattered around */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 30 + Math.random() * 25;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={`flower-${i}`} position={[x, 0.1, z]}>
            {/* Flower stem */}
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.6]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            {/* Flower petals */}
            {Array.from({ length: 5 }, (_, petal) => (
              <mesh
                key={petal}
                position={[Math.cos(petal * Math.PI * 2 / 5) * 0.15, 0.6, Math.sin(petal * Math.PI * 2 / 5) * 0.15]}
                rotation={[0, 0, petal * Math.PI * 2 / 5]}
              >
                <planeGeometry args={[0.08, 0.12]} />
                <meshStandardMaterial
                  color={['#FF69B4', '#FF1493', '#DC143C', '#FF6347', '#FF4500'][petal % 5]}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
            {/* Flower center */}
            <mesh position={[0, 0.6, 0]}>
              <sphereGeometry args={[0.04]} />
              <meshStandardMaterial color="#FFD700" />
            </mesh>
          </group>
        );
      })}

      {/* Small rocks for added detail */}
      {Array.from({ length: 15 }, (_, i) => {
        const angle = (i / 15) * Math.PI * 2 + Math.random() * 0.5;
        const radius = 35 + Math.random() * 30;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh
            key={`rock-${i}`}
            position={[x, 0.1 + Math.random() * 0.1, z]}
            rotation={[Math.random() * 0.3, Math.random() * Math.PI * 2, Math.random() * 0.3]}
          >
            <dodecahedronGeometry args={[0.15 + Math.random() * 0.2]} />
            <meshStandardMaterial
              color={new THREE.Color(RETRO_COLORS.stone).multiplyScalar(0.7 + Math.random() * 0.5)}
              roughness={0.9}
              metalness={0.0}
            />
          </mesh>
        );
      })}
    </>
  );
});
