import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { use3DStore } from '@/stores/use3DStore';

interface Particle {
  id: number;
  position: THREE.Vector3;
  life: number; // 0..1
}

const STEP_DISTANCE = 0.8; // meters per step
const LIFETIME = 0.8; // seconds

export function Footsteps() {
  const { character } = use3DStore();
  const lastPos = useRef(character.position.clone());
  const accum = useRef(0);
  const left = useRef(true);
  const particles = useRef<Particle[]>([]);
  const idCounter = useRef(0);

  useFrame((_state, delta) => {
    const dist = lastPos.current.distanceTo(character.position);
    accum.current += dist;
    lastPos.current.copy(character.position);

    // Spawn particle on step
    if (character.isMoving && accum.current >= STEP_DISTANCE) {
      accum.current = 0;

      // Compute lateral offset (alternate left/right)
      const side = left.current ? -1 : 1;
      left.current = !left.current;
      const offset = new THREE.Vector3(Math.sin(character.rotation), 0, -Math.cos(character.rotation));
      offset.multiplyScalar(0.25 * side);

      const pos = character.position.clone().add(offset);
      pos.y = 0.02;

      particles.current.push({
        id: idCounter.current++,
        position: pos,
        life: 1,
      });
    }

    // Update particles
    const decay = delta / LIFETIME;
    for (let i = particles.current.length - 1; i >= 0; i--) {
      particles.current[i].life -= decay;
      if (particles.current[i].life <= 0) {
        particles.current.splice(i, 1);
      }
    }
  });

  return (
    <group>
      {particles.current.map((p) => (
        <FootstepParticle key={p.id} particle={p} />
      ))}
    </group>
  );
}

function FootstepParticle({ particle }: { particle: Particle }) {
  const lerp = (start: number, end: number, factor: number) =>
    start + (end - start) * Math.min(factor, 1);
  const scale = lerp(0.2, 0.6, 1 - particle.life);
  const opacity = Math.max(0, Math.min(1, particle.life));

  return (
    <mesh position={particle.position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[scale, 12]} />
      <meshStandardMaterial color="#6b7280" transparent opacity={opacity * 0.6} />
    </mesh>
  );
}
