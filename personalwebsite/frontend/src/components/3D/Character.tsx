import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, BackSide } from 'three';
import { Text } from '@react-three/drei';
import { use3DStore } from '@/stores/use3DStore';
import { Voxel } from './models/VoxelBuilder';

// Enhanced character with better materials and more detail
const createCharacterBody = () => [
  // Body (blue shirt) - plastic material for fabric
  { pos: [0, 0.5, 0] as [number, number, number], color: "#4a90e2", size: 1.2, materialType: 'plastic' as const },
  { pos: [0, 1.2, 0] as [number, number, number], color: "#4a90e2", size: 1.0, materialType: 'plastic' as const },

  // Head (skin tone) - standard material
  { pos: [0, 2.0, 0] as [number, number, number], color: "#fdbcb4", size: 1.0, materialType: 'standard' as const },

  // Eyes (black dots) - emissive for glow
  { pos: [-0.2, 2.1, 0.45] as [number, number, number], color: "#000000", size: 0.1, materialType: 'emissive' as const, emissiveIntensity: 0.1 },
  { pos: [0.2, 2.1, 0.45] as [number, number, number], color: "#000000", size: 0.1, materialType: 'emissive' as const, emissiveIntensity: 0.1 },

  // Mouth (simple smile) - subtle emissive
  { pos: [0, 1.8, 0.45] as [number, number, number], color: "#000000", size: 0.15, materialType: 'standard' as const },

  // Yankees Hat - metallic crown, plastic logo
  // Main hat crown (felt-like material)
  { pos: [0, 2.45, 0] as [number, number, number], color: "#0c2340", size: 0.9, materialType: 'rough' as const },
  { pos: [0, 2.4, 0] as [number, number, number], color: "#0c2340", size: 0.8, materialType: 'rough' as const },

  // Hat brim - rough fabric
  { pos: [0, 2.35, -0.4] as [number, number, number], color: "#0c2340", size: 0.9, materialType: 'rough' as const },
  { pos: [-0.3, 2.35, -0.2] as [number, number, number], color: "#0c2340", size: 0.4, materialType: 'rough' as const },
  { pos: [0.3, 2.35, -0.2] as [number, number, number], color: "#0c2340", size: 0.4, materialType: 'rough' as const },

  // Yankees "NY" Logo - plastic lettering
  // N shape (3 voxels)
  { pos: [-0.15, 2.45, 0.35] as [number, number, number], color: "#ffffff", size: 0.08, materialType: 'plastic' as const },
  { pos: [-0.15, 2.4, 0.35] as [number, number, number], color: "#ffffff", size: 0.08, materialType: 'plastic' as const },
  { pos: [-0.05, 2.45, 0.35] as [number, number, number], color: "#ffffff", size: 0.08, materialType: 'plastic' as const },

  // Y shape (3 voxels)
  { pos: [0.05, 2.45, 0.35] as [number, number, number], color: "#ffffff", size: 0.08, materialType: 'plastic' as const },
  { pos: [0.15, 2.45, 0.35] as [number, number, number], color: "#ffffff", size: 0.08, materialType: 'plastic' as const },
  { pos: [0.1, 2.4, 0.35] as [number, number, number], color: "#ffffff", size: 0.08, materialType: 'plastic' as const },

  // Arms (skin tone)
  { pos: [-0.6, 1.0, 0] as [number, number, number], color: "#fdbcb4", size: 0.4, materialType: 'standard' as const },
  { pos: [0.6, 1.0, 0] as [number, number, number], color: "#fdbcb4", size: 0.4, materialType: 'standard' as const },

  // Legs (jeans) - rough fabric
  { pos: [-0.3, -0.2, 0] as [number, number, number], color: "#1a365d", size: 0.5, materialType: 'rough' as const },
  { pos: [0.3, -0.2, 0] as [number, number, number], color: "#1a365d", size: 0.5, materialType: 'rough' as const },

  // Shoes - plastic/rubber
  { pos: [-0.3, -0.7, 0] as [number, number, number], color: "#ffffff", size: 0.4, materialType: 'plastic' as const },
  { pos: [0.3, -0.7, 0] as [number, number, number], color: "#ffffff", size: 0.4, materialType: 'plastic' as const },
];

export function Character() {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  const { character } = use3DStore();

  // Smooth animation values
  const walkCycle = useRef(0);
  const idleCycle = useRef(0);

  const characterBody = useMemo(() => createCharacterBody(), []);

  // Debug: Log character position
  useEffect(() => {
    console.log('Character position:', character.position);
    console.log('Character isMoving:', character.isMoving);
  }, [character.position, character.isMoving]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Spring handles position and rotation smoothly now

    // Enhanced walking animation
    if (character.isMoving) {
      walkCycle.current += delta * 10;

      // Dynamic body bobbing with multiple harmonics
      if (groupRef.current) {
        const primaryBob = Math.sin(walkCycle.current) * 0.08;
        const secondaryBob = Math.sin(walkCycle.current * 2) * 0.02;
        const totalBob = primaryBob + secondaryBob;
        groupRef.current.position.y = character.position.y + totalBob;
      }

      // Advanced head bobbing with slight tilt
      if (headRef.current) {
        headRef.current.position.y = 2.0 + Math.sin(walkCycle.current * 2) * 0.03;
        headRef.current.rotation.x = Math.sin(walkCycle.current * 1.5) * 0.02; // Forward/back tilt
        headRef.current.rotation.z = Math.sin(walkCycle.current * 2.5) * 0.01; // Side to side tilt
      }

      // Arm swing animation
      // Left arm (opposite phase from right leg)
      // Right arm (opposite phase from left leg)
      // We'll use rotation for arm swing
    } else {
      walkCycle.current = 0;

      // Enhanced idle animations
      idleCycle.current += delta * 1.5;

      // Sophisticated breathing with inhale/exhale phases
      if (groupRef.current) {
        const breathePhase = Math.sin(idleCycle.current);
        const breatheAmount = (breathePhase > 0 ? breathePhase * 0.015 : breathePhase * 0.008);
        groupRef.current.scale.y = 1 + breatheAmount;
        groupRef.current.scale.x = 1 + breatheAmount * 0.3; // Subtle width change
      }

      // More complex head movement with personality
      if (headRef.current) {
        // Looking around occasionally
        const lookCycle = Math.sin(idleCycle.current * 0.3);
        headRef.current.rotation.y = lookCycle * 0.08;

        // Natural head position variation
        headRef.current.position.y = 2.0 + Math.sin(idleCycle.current * 1.2) * 0.015;

        // Occasional blinks (simulated by scale change)
        const blinkPhase = Math.sin(idleCycle.current * 0.5);
        if (blinkPhase > 0.95) {
          // Simulate blink by temporarily hiding eyes
        }
      }

      // Subtle body sway
      if (groupRef.current) {
        const swayAmount = Math.sin(idleCycle.current * 0.8) * 0.005;
        groupRef.current.rotation.z = swayAmount;
      }
    }

    // Environmental interaction - character responds to weather/time
    const time = state.clock.getElapsedTime();
    if (groupRef.current && !character.isMoving) {
      // Occasional random movements (looking around, adjusting stance)
      const randomMovement = Math.sin(time * 0.5 + Math.PI) * 0.002;
      groupRef.current.position.x += randomMovement * delta;
      groupRef.current.position.z += randomMovement * delta;
    }
  });

  // Use direct position instead of spring for now to debug
  const charPos = [character.position.x, character.position.y, character.position.z] as [number, number, number];
  
  return (
    <group ref={groupRef} position={charPos} rotation-y={character.rotation} scale={1.2}>
      {/* Helper light to make character more visible */}
      <pointLight position={[0, 2, 0]} intensity={1.2} distance={8} color="#ffffff" />
      
      {/* Debug: Large bright red box to verify character position is visible */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.0} />
      </mesh>
      
      {/* Debug: Large bright green box at origin */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1.0} />
      </mesh>
      
      {/* Name label above character */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.4}
        color="#4a90e2"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.08}
        outlineColor="#000000"
      >
        Jae
      </Text>
      
      {/* Render character body voxels */}
      {characterBody.map((voxel, index) => (
        <Voxel
          key={index}
          position={voxel.pos}
          color={voxel.color}
          size={voxel.size}
          materialType={voxel.materialType}
          emissiveIntensity={voxel.emissiveIntensity}
        />
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
    </group>
  );
}
