import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RETRO_COLORS } from '../constants/colors';

interface BaseBuildingProps {
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  roofColor?: string;
  windows?: boolean;
  style?: 'modern' | 'classic' | 'tech' | 'residential';
  position?: [number, number, number];
}

export const BaseBuilding = React.memo(function BaseBuilding({
  width = 8,
  height = 6,
  depth = 6,
  color = RETRO_COLORS.gray,
  roofColor = RETRO_COLORS.darkGray,
  windows = true,
  style = 'modern',
  position = [0, 0, 0]
}: BaseBuildingProps) {
  const buildingMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.7,
      metalness: 0.1,
    });
  }, [color]);

  const roofMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(roofColor),
      roughness: 0.9,
      metalness: 0.0,
    });
  }, [roofColor]);

  const windowMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#87CEEB'),
      transparent: true,
      opacity: 0.7,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.1,
    });
  }, []);

  const renderWindows = () => {
    if (!windows) return null;

    const windowElements = [];
    const windowRows = Math.floor(height / 2);
    const windowCols = Math.floor(width / 2);

    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowCols; col++) {
        // Front windows
        windowElements.push(
          <mesh
            key={`front-${row}-${col}`}
            position={[
              (col - (windowCols - 1) / 2) * 1.5,
              1 + row * 1.5,
              depth / 2 + 0.01
            ]}
          >
            <boxGeometry args={[0.8, 0.8, 0.02]} />
            <primitive object={windowMaterial} attach="material" />
          </mesh>
        );

        // Back windows
        windowElements.push(
          <mesh
            key={`back-${row}-${col}`}
            position={[
              (col - (windowCols - 1) / 2) * 1.5,
              1 + row * 1.5,
              -depth / 2 - 0.01
            ]}
          >
            <boxGeometry args={[0.8, 0.8, 0.02]} />
            <primitive object={windowMaterial} attach="material" />
          </mesh>
        );

        // Side windows (left and right)
        if (col < windowCols - 1) {
          windowElements.push(
            <mesh
              key={`left-${row}-${col}`}
              position={[
                -width / 2 - 0.01,
                1 + row * 1.5,
                (col - (windowCols - 1) / 2) * 1.5
              ]}
            >
              <boxGeometry args={[0.02, 0.8, 0.8]} />
              <primitive object={windowMaterial} attach="material" />
            </mesh>
          );

          windowElements.push(
            <mesh
              key={`right-${row}-${col}`}
              position={[
                width / 2 + 0.01,
                1 + row * 1.5,
                (col - (windowCols - 1) / 2) * 1.5
              ]}
            >
              <boxGeometry args={[0.02, 0.8, 0.8]} />
              <primitive object={windowMaterial} attach="material" />
            </mesh>
          );
        }
      }
    }

    return windowElements;
  };

  const renderRoof = () => {
    switch (style) {
      case 'classic':
        return (
          <mesh position={[0, height / 2 + 0.5, 0]}>
            <coneGeometry args={[width / 1.8, 1, 4]} />
            <primitive object={roofMaterial} attach="material" />
          </mesh>
        );

      case 'residential':
        return (
          <mesh position={[0, height / 2 + 0.3, 0]}>
            <boxGeometry args={[width + 1, 0.6, depth + 1]} />
            <primitive object={roofMaterial} attach="material" />
          </mesh>
        );

      case 'tech':
        return (
          <>
            <mesh position={[0, height / 2 + 0.2, 0]}>
              <boxGeometry args={[width + 0.5, 0.4, depth + 0.5]} />
              <primitive object={roofMaterial} attach="material" />
            </mesh>
            {/* Tech antenna */}
            <mesh position={[0, height / 2 + 1.2, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1]} />
              <meshStandardMaterial color={RETRO_COLORS.silver} metalness={0.8} />
            </mesh>
            <mesh position={[0, height / 2 + 1.8, 0]}>
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial
                color={RETRO_COLORS.neonBlue}
                emissive={RETRO_COLORS.neonBlue}
                emissiveIntensity={0.3}
              />
            </mesh>
          </>
        );

      default: // modern
        return (
          <mesh position={[0, height / 2 + 0.2, 0]}>
            <boxGeometry args={[width + 0.2, 0.4, depth + 0.2]} />
            <primitive object={roofMaterial} attach="material" />
          </mesh>
        );
    }
  };

  return (
    <group position={position}>
      {/* Main building structure */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={buildingMaterial} attach="material" />
      </mesh>

      {/* Roof */}
      {renderRoof()}

      {/* Windows */}
      {renderWindows()}

      {/* Door */}
      <mesh position={[0, 0.5, depth / 2 + 0.01]}>
        <boxGeometry args={[1.2, 2, 0.1]} />
        <meshStandardMaterial color={RETRO_COLORS.darkGray} />
      </mesh>
    </group>
  );
});

