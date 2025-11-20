import { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

interface CollectibleProps {
  position: [number, number, number];
  color?: string;
}

export function Collectible({ position, color = '#ffd166' }: CollectibleProps) {
  const ref = useRef<THREE.Group>(null);
  const bobPhase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((_state, delta) => {
    if (!ref.current) return;
    // Spin
    ref.current.rotation.y += delta * 1.2;
    // Bobbing
    const t = _state.clock.getElapsedTime();
    const y = Math.sin(t * 2 + bobPhase) * 0.2 + 0.8;
    ref.current.position.y = y;
  });

  return (
    <group ref={ref} position={position}>
      {/* Crystal shape using two pyramids */}
      <mesh castShadow>
        <coneGeometry args={[0.3, 0.6, 5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI, 0, 0]} position={[0, -0.6, 0]} castShadow>
        <coneGeometry args={[0.3, 0.6, 5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.2} roughness={0.4} />
      </mesh>
      {/* Glow */}
      <pointLight color={color} intensity={0.6} distance={3} />
    </group>
  );
}

