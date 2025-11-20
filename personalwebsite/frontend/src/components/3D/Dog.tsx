import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Voxel } from './models/VoxelBuilder';

// Simple dog body parts
const createDogBody = () => [
  // Body (main torso) - brown fur with white belly
  { pos: [0, 0.25, 0] as [number, number, number], color: "#8B4513", size: 0.7 }, // Brown body
  { pos: [0, 0.5, 0] as [number, number, number], color: "#8B4513", size: 0.7 },
  { pos: [0, 0.25, 0.1] as [number, number, number], color: "#FFFFFF", size: 0.3 }, // White belly spot

  // Head - bigger for puppy cuteness, golden brown
  { pos: [0, 0.85, 0.3] as [number, number, number], color: "#D2691E", size: 0.75 },

  // Snout - cute button nose
  { pos: [0, 0.65, 0.6] as [number, number, number], color: "#F4A460", size: 0.45 },

  // Ears - extra floppy and cute!
  { pos: [-0.35, 1.0, 0.1] as [number, number, number], color: "#8B4513", size: 0.25 }, // Left ear (floppier)
  { pos: [0.35, 1.0, 0.1] as [number, number, number], color: "#8B4513", size: 0.25 }, // Right ear (floppier)

  // Big cute eyes with white sclera
  { pos: [-0.18, 0.9, 0.45] as [number, number, number], color: "#FFFFFF", size: 0.12 }, // Left eye white
  { pos: [0.18, 0.9, 0.45] as [number, number, number], color: "#FFFFFF", size: 0.12 }, // Right eye white
  { pos: [-0.18, 0.9, 0.5] as [number, number, number], color: "#000000", size: 0.06 }, // Left pupil
  { pos: [0.18, 0.9, 0.5] as [number, number, number], color: "#000000", size: 0.06 }, // Right pupil

  // Cute button nose
  { pos: [0, 0.7, 0.75] as [number, number, number], color: "#000000", size: 0.06 },

  // Legs - shorter and stubbier for puppy look
  { pos: [-0.25, 0.0, 0.15] as [number, number, number], color: "#8B4513", size: 0.25 }, // Front left
  { pos: [0.25, 0.0, 0.15] as [number, number, number], color: "#8B4513", size: 0.25 }, // Front right
  { pos: [-0.25, 0.0, -0.15] as [number, number, number], color: "#8B4513", size: 0.25 }, // Back left
  { pos: [0.25, 0.0, -0.15] as [number, number, number], color: "#8B4513", size: 0.25 }, // Back right

  // Tail - bushy and waggy!
  { pos: [0, 0.6, -0.35] as [number, number, number], color: "#8B4513", size: 0.18 },
  { pos: [0, 0.7, -0.45] as [number, number, number], color: "#A0522D", size: 0.12 },

  // Cute red bow tie!
  { pos: [0, 0.6, 0.3] as [number, number, number], color: "#FF1493", size: 0.15 }, // Bow center
  { pos: [-0.15, 0.6, 0.25] as [number, number, number], color: "#FF1493", size: 0.1 }, // Left bow loop
  { pos: [0.15, 0.6, 0.25] as [number, number, number], color: "#FF1493", size: 0.1 }, // Right bow loop

  // White spots for extra cuteness
  { pos: [0.1, 0.4, 0.2] as [number, number, number], color: "#FFFFFF", size: 0.15 }, // Spot on back
  { pos: [-0.1, 0.35, -0.1] as [number, number, number], color: "#FFFFFF", size: 0.12 }, // Spot on side
];

export function Dog() {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const earLeftRef = useRef<THREE.Group>(null);
  const earRightRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const tongueRef = useRef<THREE.Group>(null);
  const heartRef = useRef<THREE.Group>(null);

  // Animation parameters for cute movements
  const wagCycle = useRef(0);
  const bounceCycle = useRef(0);
  const earTwitchCycle = useRef(0);
  const pantCycle = useRef(0);
  const tongueCycle = useRef(0);
  const heartCycle = useRef(0);

  // Create dog body voxels
  const dogBody = useMemo(() => createDogBody(), []);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    // Update animation cycles
    wagCycle.current += delta * 8;
    bounceCycle.current += delta * 6;
    earTwitchCycle.current += delta * 4;
    pantCycle.current += delta * 3;
    tongueCycle.current += delta * 5;
    heartCycle.current += delta * 2;

    // Pre-calculate expensive trigonometric operations for better performance
    const wagSin = Math.sin(wagCycle.current);
    const wagSinHalf = Math.sin(wagCycle.current * 0.5);
    const earTwitchSin = Math.sin(earTwitchCycle.current);
    const earTwitchSinOffset = Math.sin(earTwitchCycle.current + Math.PI * 0.5);
    const pantSin = Math.sin(pantCycle.current);

    // Apply animations to different parts using pre-calculated values
    if (tailRef.current) {
      tailRef.current.rotation.y = wagSin * 0.8;
      tailRef.current.rotation.z = wagSinHalf * 0.3;
    }

    if (earLeftRef.current) {
      earLeftRef.current.rotation.z = earTwitchSin * 0.2;
    }

    if (earRightRef.current) {
      earRightRef.current.rotation.z = earTwitchSinOffset * 0.2;
    }

    if (headRef.current) {
      headRef.current.rotation.z = pantSin * 0.1;
    }

    if (tongueRef.current) {
      const tongueSin = Math.sin(tongueCycle.current);
      const tongueOut = tongueSin > 0.7;
      tongueRef.current.position.z = tongueOut ? 0.9 : 0.8;
      tongueRef.current.visible = tongueOut;
    }

    if (heartRef.current) {
      const heartSin = Math.sin(heartCycle.current);
      const showHeart = heartSin > 0.8;
      heartRef.current.visible = showHeart;
      if (showHeart) {
        const heartSinFast = Math.sin(heartCycle.current * 5);
        const heartSinMed = Math.sin(heartCycle.current * 4);
        const pulseScale = 1 + heartSinFast * 0.1;
        heartRef.current.scale.setScalar(pulseScale);
        heartRef.current.rotation.y = heartSinMed * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef} position={[-1.3, 0.4, -0.2]}>
      {/* Render dog body voxels */}
      {dogBody.map((voxel, index) => (
        <Voxel
          key={index}
          position={voxel.pos}
          color={voxel.color}
          size={voxel.size}
        />
      ))}

      {/* Tail group for wagging */}
      <group ref={tailRef} position={[0, 0.6, -0.35]}>
        <Voxel position={[0, 0.1, -0.1]} color="#A0522D" size={0.12} />
      </group>

      {/* Ear groups for twitching */}
      <group ref={earLeftRef} position={[-0.35, 1.0, 0.1]}>
        <Voxel position={[0, 0, 0]} color="#8B4513" size={0.25} />
      </group>
      <group ref={earRightRef} position={[0.35, 1.0, 0.1]}>
        <Voxel position={[0, 0, 0]} color="#8B4513" size={0.25} />
      </group>

      {/* Head group for panting */}
      <group ref={headRef} position={[0, 0.85, 0.3]}>
        <Voxel position={[0, 0, 0]} color="#D2691E" size={0.75} />
        <Voxel position={[0, -0.2, 0.3]} color="#F4A460" size={0.45} />
        {/* Eyes */}
        <Voxel position={[-0.18, 0.05, 0.15]} color="#FFFFFF" size={0.12} />
        <Voxel position={[0.18, 0.05, 0.15]} color="#FFFFFF" size={0.12} />
        <Voxel position={[-0.18, 0.05, 0.2]} color="#000000" size={0.06} />
        <Voxel position={[0.18, 0.05, 0.2]} color="#000000" size={0.06} />
        {/* Nose */}
        <Voxel position={[0, -0.05, 0.45]} color="#000000" size={0.06} />
      </group>

      {/* Tongue */}
      <group ref={tongueRef} position={[0, 0.65, 0.8]}>
        <Voxel position={[0, 0, 0]} color="#FF69B4" size={0.08} />
      </group>

      {/* Floating hearts */}
      <group ref={heartRef} position={[0.2, 1.3, 0.2]}>
        <Voxel position={[0, 0, 0]} color="#FF1493" size={0.1} />
        <Voxel position={[0.1, 0.1, 0]} color="#FF1493" size={0.08} />
        <Voxel position={[-0.1, 0.1, 0]} color="#FF1493" size={0.08} />
        <Voxel position={[0, 0.2, 0]} color="#FF1493" size={0.06} />
      </group>
    </group>
  );
}
