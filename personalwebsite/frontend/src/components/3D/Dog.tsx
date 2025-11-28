import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { Voxel } from './models/VoxelBuilder';
import { use3DStore } from '@/stores/use3DStore';

export function Dog() {
  const groupRef = useRef<THREE.Group>(null);

  const { character } = use3DStore();

  // Create a simple dog body using voxels
  const createDogBody = () => [
    // Body (brown)
    { pos: [0, 0.25, 0] as [number, number, number], color: "#8B4513", size: 0.7 },
    { pos: [0, 0.5, 0] as [number, number, number], color: "#8B4513", size: 0.7 },

    // Head (golden brown)
    { pos: [0, 0.85, 0.3] as [number, number, number], color: "#D2691E", size: 0.75 },

    // Snout
    { pos: [0, 0.65, 0.6] as [number, number, number], color: "#F4A460", size: 0.45 },

    // Eyes (white sclera + black pupil)
    { pos: [-0.18, 0.9, 0.45] as [number, number, number], color: "#FFFFFF", size: 0.12 },
    { pos: [0.18, 0.9, 0.45] as [number, number, number], color: "#FFFFFF", size: 0.12 },
    { pos: [-0.18, 0.9, 0.5] as [number, number, number], color: "#000000", size: 0.06 },
    { pos: [0.18, 0.9, 0.5] as [number, number, number], color: "#000000", size: 0.06 },

    // Nose
    { pos: [0, 0.7, 0.75] as [number, number, number], color: "#000000", size: 0.06 },

    // Legs
    { pos: [-0.25, 0.0, 0.15] as [number, number, number], color: "#8B4513", size: 0.25 },
    { pos: [0.25, 0.0, 0.15] as [number, number, number], color: "#8B4513", size: 0.25 },
    { pos: [-0.25, 0.0, -0.15] as [number, number, number], color: "#8B4513", size: 0.25 },
    { pos: [0.25, 0.0, -0.15] as [number, number, number], color: "#8B4513", size: 0.25 },

    // Tail
    { pos: [0, 0.6, -0.35] as [number, number, number], color: "#8B4513", size: 0.18 },
    { pos: [0, 0.7, -0.45] as [number, number, number], color: "#A0522D", size: 0.12 },

    // Red bow tie
    { pos: [0, 0.6, 0.3] as [number, number, number], color: "#FF1493", size: 0.15 },
    { pos: [-0.15, 0.6, 0.25] as [number, number, number], color: "#FF1493", size: 0.1 },
    { pos: [0.15, 0.6, 0.25] as [number, number, number], color: "#FF1493", size: 0.1 },
  ];

  const dogBody = createDogBody();

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    // Follow character with smooth movement
    const characterPos = new THREE.Vector3(character.position.x, character.position.y, character.position.z);
    const dogPos = groupRef.current.position;

    // Check if character is active (moving)
    const isCharacterActive = character.isMoving ||
      (character.position.x !== 0 || character.position.y !== 0.5 || character.position.z !== 0);

    let targetPos: THREE.Vector3;
    if (isCharacterActive) {
      // Follow character with offset
      const followOffset = new THREE.Vector3(-1.5, 0.3, -0.5);
      targetPos = characterPos.clone().add(followOffset);
    } else {
      // Default position when not moving
      targetPos = new THREE.Vector3(0, 0.5, 3);
    }

    // Smooth interpolation
    dogPos.lerp(targetPos, delta * 2.5);

    // Gentle animation space - ready for future tail wagging
    // const wagCycle = Math.sin(state.clock.elapsedTime * 6);
  });

  return (
    <group ref={groupRef} scale={1.5}>
      {/* Helper light for the dog */}
      <pointLight position={[0, 2, 0]} intensity={0.8} distance={6} color="#ffd6a5" />

      {/* Render dog body voxels */}
      {dogBody.map((voxel, index) => (
        <Voxel
          key={index}
          position={voxel.pos}
          color={voxel.color}
          size={voxel.size}
        />
      ))}

      {/* Floating name label */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.3}
        color="#ffe066"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        🐕 Buddy
      </Text>
    </group>
  );
}
