import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type MaterialType = 'standard' | 'metallic' | 'emissive' | 'glass' | 'animated' | 'rough' | 'plastic' | 'wood' | 'stone';

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
  const lastDistanceRef = useRef<number>(0);

  useFrame((state) => {
    if (!meshRef.current) return;

    const camera = state.camera;
    const distance = camera.position.distanceTo(new THREE.Vector3(...position));

    // LOD: Reduce detail for distant voxels
    if (distance > 30 && meshRef.current.visible) {
      meshRef.current.visible = false;
    } else if (distance <= 30 && !meshRef.current.visible) {
      meshRef.current.visible = true;
    }

    // Only animate nearby voxels
    if (materialType === 'animated' && distance < 20) {
      const time = state.clock.getElapsedTime();
      meshRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.02);
    }

    lastDistanceRef.current = distance;
  });

  const getMaterial = () => {
    switch (materialType) {
      case 'metallic':
        return (
          <meshPhysicalMaterial
            color={color}
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={0.8}
            clearcoat={0.3}
            clearcoatRoughness={0.1}
          />
        );

      case 'emissive':
        return (
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            metalness={0.1}
            roughness={0.9}
          />
        );

      case 'glass':
        return (
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.2}
            transmission={0.9}
            thickness={0.05}
            roughness={0.01}
            metalness={0.0}
            ior={1.5}
            clearcoat={1.0}
          />
        );

      case 'animated':
        return (
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.15}
            metalness={metalness}
            roughness={roughness}
          />
        );

      case 'rough':
        return (
          <meshStandardMaterial
            color={color}
            metalness={0.0}
            roughness={0.9}
            bumpScale={0.02}
          />
        );

      case 'plastic':
        return (
          <meshPhysicalMaterial
            color={color}
            metalness={0.0}
            roughness={0.4}
            clearcoat={0.8}
            clearcoatRoughness={0.2}
          />
        );

      case 'wood':
        return (
          <meshStandardMaterial
            color={color}
            metalness={0.0}
            roughness={0.8}
            bumpScale={0.05}
          />
        );

      case 'stone':
        return (
          <meshStandardMaterial
            color={color}
            metalness={0.0}
            roughness={0.9}
            bumpScale={0.08}
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
