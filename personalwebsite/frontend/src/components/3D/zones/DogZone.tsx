import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { VoxelStructure } from '../models/VoxelBuilder';
import { Text } from '@react-three/drei';
import { ParticleField } from '../Effects/ParticleField';
import { InfoWaypoint } from '../InfoWaypoint';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { VoxelAdder } from './voxelHelpers';
import * as THREE from 'three';

export function DogZone() {
  const performanceMetrics = usePerformanceMonitor();
  const dogRef = useRef<THREE.Group>(null);

  // Adapt global performance metrics to component needs
  const particleCount = performanceMetrics.fps < 30 ? 20 : performanceMetrics.fps < 50 ? 30 : 50;
  const enableAdvancedEffects = performanceMetrics.fps >= 40;

  // Create voxel dog model
  const dogVoxels = useMemo(() => {
    const voxels: Array<{
      pos: [number, number, number];
      color: string;
      materialType?: 'standard' | 'metallic' | 'emissive' | 'glass' | 'animated';
      emissiveIntensity?: number;
      metalness?: number;
      roughness?: number;
    }> = [];

    const addVoxel: VoxelAdder = (
      position: [number, number, number],
      color: string,
      materialType?: 'standard' | 'metallic' | 'emissive' | 'glass' | 'animated',
      emissiveIntensity?: number,
      metalness?: number,
      roughness?: number
    ) => {
      voxels.push({
        pos: position,
        color,
        materialType,
        emissiveIntensity,
        metalness,
        roughness
      });
    };

    // Dog body (brown/tan colors)
    const bodyColor = '#8B4513'; // Saddle brown
    const furColor = '#D2B48C'; // Tan
    const noseColor = '#000000'; // Black
    const eyeColor = '#4ecdc4'; // Cyan for glowing eyes

    // Body base - lying down position
    for (let x = -2; x <= 2; x++) {
      for (let z = -3; z <= 1; z++) {
        for (let y = 0; y <= 1; y++) {
          if (Math.abs(x) + Math.abs(z) <= 3) {
            addVoxel([x, y, z], bodyColor);
          }
        }
      }
    }

    // Head
    for (let x = -2; x <= 2; x++) {
      for (let z = 2; z <= 4; z++) {
        for (let y = 0; y <= 2; y++) {
          if (Math.abs(x) <= 2 && Math.abs(z - 3) <= 1) {
            addVoxel([x, y, z], furColor);
          }
        }
      }
    }

    // Snout
    for (let x = -1; x <= 1; x++) {
      for (let z = 4; z <= 5; z++) {
        addVoxel([x, 0, z], furColor);
        if (z === 5 && Math.abs(x) <= 1) {
          addVoxel([x, 1, z], noseColor); // Nose
        }
      }
    }

    // Eyes
    addVoxel([-1, 1, 3], eyeColor, 'emissive', 0.8);
    addVoxel([1, 1, 3], eyeColor, 'emissive', 0.8);

    // Ears
    addVoxel([-2, 2, 2], furColor);
    addVoxel([-2, 3, 2], furColor);
    addVoxel([2, 2, 2], furColor);
    addVoxel([2, 3, 2], furColor);

    // Legs (front)
    for (let i = 0; i < 2; i++) {
      const x = i === 0 ? -1 : 1;
      for (let y = 0; y >= -1; y--) {
        addVoxel([x, y, -1], furColor);
      }
    }

    // Legs (back)
    for (let i = 0; i < 2; i++) {
      const x = i === 0 ? -1 : 1;
      for (let y = 0; y >= -1; y--) {
        addVoxel([x, y, 1], furColor);
      }
    }

    // Tail
    for (let i = 0; i < 3; i++) {
      addVoxel([0, 1, -3 - i], furColor);
    }

    // Ground platform with grass pattern
    for (let x = -8; x <= 8; x++) {
      for (let z = -8; z <= 8; z++) {
        const distance = Math.sqrt(x * x + z * z);
        if (distance <= 8) {
          // Grass pattern
          const pattern = (Math.abs(x) + Math.abs(z)) % 4;
          if (pattern === 0) {
            addVoxel([x, -1, z], '#228B22', 'standard'); // Forest green
          } else if (pattern === 1) {
            addVoxel([x, -1, z], '#32CD32', 'standard'); // Lime green
          } else {
            addVoxel([x, -1, z], '#90EE90', 'standard'); // Light green
          }
        }
      }
    }

    return voxels;
  }, []);

  // Animate the dog (gentle breathing and tail wag)
  useFrame((state) => {
    if (dogRef.current) {
      const time = state.clock.getElapsedTime();

      // Gentle breathing motion
      dogRef.current.position.y = Math.sin(time * 1.5) * 0.05;

      // Tail wag animation would require a separate tail group
    }
  });

  return (
    <group position={[15, 0, 15]} ref={dogRef}>
      <VoxelStructure voxels={dogVoxels} />

      {/* Zone title */}
      <Text
        position={[0, 8, 0]}
        fontSize={1.2}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#ffffff"
      >
        PET ZONE
      </Text>

      <Text
        position={[0, 6, 0]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#4ecdc4"
      >
        Loyal Companion & Friend
      </Text>

      {/* Dog-specific lighting */}
      <pointLight position={[0, 3, 0]} color="#4ecdc4" intensity={2} distance={15} />
      <pointLight position={[3, 2, 3]} color="#ffe66d" intensity={1.5} distance={12} />

      {/* Floating particles around the dog */}
      {enableAdvancedEffects && (
        <>
          <ParticleField
            count={Math.floor(particleCount * 0.8)}
            position={[0, 2, 0]}
            color="#4ecdc4"
            size={0.015}
            speed={0.1}
            spread={8}
          />

          <ParticleField
            count={Math.floor(particleCount * 0.5)}
            position={[0, 3, 0]}
            color="#ffe66d"
            size={0.01}
            speed={0.08}
            spread={6}
          />
        </>
      )}

      {/* Interactive waypoints about the dog */}
      <InfoWaypoint
        position={[18, 2, 12]}
        title="Loyal Companion"
        content="A faithful dog that represents loyalty, friendship, and the joy of simple companionship in our complex digital world."
        icon="🐕"
        color="#8B4513"
        zoneType="pet"
      />

      <InfoWaypoint
        position={[12, 2, 12]}
        title="Digital Pet"
        content="This voxel dog is a reminder that even in a world of AI and technology, the warmth of animal companionship remains timeless."
        icon="💝"
        color="#D2B48C"
        zoneType="pet"
      />

      <InfoWaypoint
        position={[18, 2, 18]}
        title="Interactive Friend"
        content="Click around to interact with this friendly companion. Watch it respond to your presence in the 3D space!"
        icon="🎾"
        color="#4ecdc4"
        zoneType="pet"
      />

      <InfoWaypoint
        position={[12, 2, 18]}
        title="Wellness Reminder"
        content="Studies show that interacting with pets can reduce stress and improve mental health. Take a moment to enjoy this digital companion."
        icon="❤️"
        color="#ff6b6b"
        zoneType="pet"
      />

      {/* Dog sound effects indicator */}
      <Text
        position={[0, -2, 6]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#4ecdc4"
      >
        🐕 Woof! 🐕
      </Text>
    </group>
  );
}
