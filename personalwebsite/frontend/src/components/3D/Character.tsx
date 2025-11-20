import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, BackSide } from 'three';
import { useSpring, animated } from '@react-spring/three';
import { use3DStore } from '@/stores/use3DStore';
import { Voxel } from './models/VoxelBuilder';

// Simplified, reliable character - easy to render and always visible
const createCharacterBody = () => [
  // Body (blue shirt) - simplified for better performance
  { pos: [0, 0.5, 0] as [number, number, number], color: "#4a90e2", size: 1.2 },
  { pos: [0, 1.2, 0] as [number, number, number], color: "#4a90e2", size: 1.0 },

  // Head (skin tone)
  { pos: [0, 2.0, 0] as [number, number, number], color: "#fdbcb4", size: 1.0 },

  // Simple eyes (black dots)
  { pos: [-0.2, 2.1, 0.45] as [number, number, number], color: "#000000", size: 0.1 },
  { pos: [0.2, 2.1, 0.45] as [number, number, number], color: "#000000", size: 0.1 },

  // Mouth (simple smile)
  { pos: [-0.1, 1.8, 0.45] as [number, number, number], color: "#000000", size: 0.05 },
  { pos: [0.1, 1.8, 0.45] as [number, number, number], color: "#000000", size: 0.05 },

  // Yankees Hat (improved design)
  // Main hat crown - classic Yankees navy blue
  { pos: [0, 2.45, 0] as [number, number, number], color: "#0c2340", size: 0.9 }, // Main crown
  { pos: [0, 2.4, 0.2] as [number, number, number], color: "#0c2340", size: 0.7 }, // Crown front
  { pos: [0, 2.4, -0.2] as [number, number, number], color: "#0c2340", size: 0.7 }, // Crown back

  // Hat brim - curved baseball cap style
  { pos: [0, 2.35, -0.5] as [number, number, number], color: "#0c2340", size: 0.8 }, // Brim front
  { pos: [-0.4, 2.35, -0.3] as [number, number, number], color: "#0c2340", size: 0.4 }, // Brim left
  { pos: [0.4, 2.35, -0.3] as [number, number, number], color: "#0c2340", size: 0.4 }, // Brim right
  { pos: [-0.2, 2.35, -0.4] as [number, number, number], color: "#0c2340", size: 0.3 }, // Brim curve left
  { pos: [0.2, 2.35, -0.4] as [number, number, number], color: "#0c2340", size: 0.3 }, // Brim curve right

  // Yankees "NY" Logo - more detailed and authentic
  // N - vertical line
  { pos: [-0.25, 2.48, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },
  { pos: [-0.25, 2.43, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },
  { pos: [-0.25, 2.38, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },
  // N - diagonal
  { pos: [-0.2, 2.48, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },
  { pos: [-0.15, 2.43, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },
  { pos: [-0.1, 2.38, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },
  // N - right vertical
  { pos: [-0.05, 2.48, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },
  { pos: [-0.05, 2.43, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },
  { pos: [-0.05, 2.38, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },

  // Y - left diagonal
  { pos: [0.05, 2.48, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },
  { pos: [0.1, 2.43, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },
  // Y - right diagonal
  { pos: [0.15, 2.48, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },
  { pos: [0.2, 2.43, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },
  // Y - stem
  { pos: [0.125, 2.38, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },
  { pos: [0.125, 2.33, 0.35] as [number, number, number], color: "#ffffff", size: 0.05 },

  // Hat button/size tag (authentic baseball cap detail)
  { pos: [0.3, 2.45, 0.2] as [number, number, number], color: "#2c3e50", size: 0.08 },

  // Arms (simple)
  { pos: [-0.6, 1.0, 0] as [number, number, number], color: "#fdbcb4", size: 0.4 },
  { pos: [0.6, 1.0, 0] as [number, number, number], color: "#fdbcb4", size: 0.4 },

  // Legs (jeans)
  { pos: [-0.3, -0.2, 0] as [number, number, number], color: "#1a365d", size: 0.5 },
  { pos: [0.3, -0.2, 0] as [number, number, number], color: "#1a365d", size: 0.5 },

  // Shoes (white sneakers)
  { pos: [-0.3, -0.7, 0] as [number, number, number], color: "#ffffff", size: 0.4 },
  { pos: [0.3, -0.7, 0] as [number, number, number], color: "#ffffff", size: 0.4 },
];

export function Character() {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  const { character } = use3DStore();

  // Smooth animation values
  const walkCycle = useRef(0);
  const idleCycle = useRef(0);

  const characterBody = useMemo(() => createCharacterBody(), []);

  // Spring-based smooth position and rotation
  const { position, rotation } = useSpring({
    position: [character.position.x, character.position.y, character.position.z],
    rotation: [0, character.rotation, 0],
    config: {
      mass: 1,
      tension: 120,
      friction: 14,
      clamp: false
    }
  });

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    // Spring handles position and rotation smoothly now

    // Simple walking animation
    if (character.isMoving) {
      walkCycle.current += delta * 8;

      // Body bobbing - use the spring position as base
      if (groupRef.current) {
        const bobAmount = Math.sin(walkCycle.current) * 0.06;
        groupRef.current.position.y = character.position.y + bobAmount;
      }

      // Subtle head bobbing
      if (headRef.current) {
        headRef.current.position.y = 2.0 + Math.sin(walkCycle.current * 2) * 0.02;
      }
    } else {
      walkCycle.current = 0;

      // Idle animations
      idleCycle.current += delta * 2;

      // Gentle breathing
      if (groupRef.current) {
        const breatheAmount = Math.sin(idleCycle.current) * 0.01;
        groupRef.current.scale.y = 1 + breatheAmount;
      }

      // Subtle head movement
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(idleCycle.current * 0.5) * 0.05;
        headRef.current.position.y = 2.0 + Math.sin(idleCycle.current * 1.5) * 0.01;
      }
    }
  });

  return (
    <animated.group ref={groupRef} position={position.to((x, y, z) => [x, y, z])} rotation-y={rotation}>
      {/* Render character body voxels */}
      {characterBody.map((voxel, index) => (
        <Voxel key={index} position={voxel.pos} color={voxel.color} size={voxel.size} />
      ))}

      {/* Dynamic shadow blob that responds to movement */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[character.isMoving ? 0.9 : 0.8, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={character.isMoving ? 0.2 : 0.3}
        />
      </mesh>

      {/* Additional shadow detail for realism */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.015, 0.1]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.15, 0.012, -0.05]}>
        <circleGeometry args={[0.25, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.12} />
      </mesh>

      {/* Breathing effect overlay */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[1.8, 8, 6]} />
        <meshBasicMaterial
          color="#4a90e2"
          transparent
          opacity={0.02}
          side={BackSide}
        />
      </mesh>
    </animated.group>
  );
}

