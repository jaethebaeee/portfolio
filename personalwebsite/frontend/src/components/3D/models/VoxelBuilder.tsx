import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type MaterialType = 'standard' | 'metallic' | 'emissive' | 'glass' | 'animated';

interface VoxelProps {
  position: [number, number, number];
  color: string;
  size?: number;
  materialType?: MaterialType;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
}

export function Voxel({
  position,
  color,
  size = 1,
  materialType = 'standard',
  emissiveIntensity = 0.2,
  metalness = 0.1,
  roughness = 0.8
}: VoxelProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (materialType === 'animated' && meshRef.current) {
      const time = state.clock.getElapsedTime();

      // Slight scale animation
      meshRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.02);
    }
  });

  const getMaterial = () => {
    switch (materialType) {
      case 'metallic':
        return (
          <meshStandardMaterial
            color={color}
            metalness={0.8}
            roughness={0.2}
            envMapIntensity={0.5}
          />
        );

      case 'emissive':
        return (
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            metalness={0.1}
            roughness={0.8}
          />
        );

      case 'glass':
        return (
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.3}
            transmission={0.8}
            thickness={0.1}
            roughness={0}
            metalness={0}
          />
        );

      case 'animated':
        return (
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.1}
            metalness={metalness}
            roughness={roughness}
          />
        );

      default:
        return (
          <meshStandardMaterial
            color={color}
            metalness={metalness}
            roughness={roughness}
          />
        );
    }
  };

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[size, size, size]} />
      {getMaterial()}
    </mesh>
  );
}

interface VoxelStructureProps {
  voxels: Array<{
    pos: [number, number, number];
    color: string;
    materialType?: MaterialType;
    emissiveIntensity?: number;
    metalness?: number;
    roughness?: number;
  }>;
  position?: [number, number, number];
}

export function VoxelStructure({ voxels, position = [0, 0, 0] }: VoxelStructureProps) {
  return (
    <group position={position}>
      {voxels.map((voxel, index) => (
        <Voxel
          key={index}
          position={voxel.pos}
          color={voxel.color}
          materialType={voxel.materialType}
          emissiveIntensity={voxel.emissiveIntensity}
          metalness={voxel.metalness}
          roughness={voxel.roughness}
        />
      ))}
    </group>
  );
}


interface InstancedVoxelsProps {
  positions: Array<[number, number, number]>;
  color: string;
  size?: number;
}

export function InstancedVoxels({ positions, color, size = 1 }: InstancedVoxelsProps) {
  const meshRef = React.useRef<THREE.InstancedMesh>(null);
  
  useMemo(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const tempObject = new THREE.Object3D();
    positions.forEach((position, i) => {
      tempObject.position.set(...position);
      tempObject.updateMatrix();
      mesh.setMatrixAt(i, tempObject.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]} castShadow receiveShadow>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} />
    </instancedMesh>
  );
}


