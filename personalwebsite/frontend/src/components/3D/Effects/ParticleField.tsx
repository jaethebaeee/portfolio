import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  position?: [number, number, number];
  color?: string;
  size?: number;
  speed?: number;
  spread?: number;
  physics?: 'floating' | 'trailing' | 'explosive' | 'spiral';
  trailLength?: number;
  gravity?: number;
  attraction?: [number, number, number];
  interactive?: boolean;
  mouseAttraction?: number;
  mouseRepulsion?: number;
}

export function ParticleField({
  count = 50,
  position = [0, 0, 0],
  color = '#4ecdc4',
  size = 0.02,
  speed = 0.5,
  spread = 5,
  physics = 'floating',
  trailLength = 0,
  gravity = 0,
  attraction = [0, 0, 0],
  interactive = true,
  mouseAttraction = 2,
  mouseRepulsion = 1
}: ParticleFieldProps) {
  const meshRef = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  // Mouse interaction setup
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [interactive]);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = Math.random() * spread * 0.5 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

      // Velocity
      velocities[i * 3] = (Math.random() - 0.5) * speed * 0.1;
      velocities[i * 3 + 1] = Math.random() * speed * 0.05;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speed * 0.1;
    }

    return { positions, velocities };
  }, [count, spread, speed]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();
    const deltaTime = state.clock.getDelta();

    // Convert mouse position to 3D world space (approximate)
    const mouse3D = new THREE.Vector3(mouse.current.x * viewport.width / 2, mouse.current.y * viewport.height / 2, 0);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Mouse interaction
      if (interactive) {
        const particlePos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
        const distanceToMouse = particlePos.distanceTo(mouse3D);

        if (distanceToMouse < mouseAttraction) {
          // Attract particles to mouse
          const direction = mouse3D.clone().sub(particlePos).normalize();
          const force = (mouseAttraction - distanceToMouse) / mouseAttraction;
          positions[i3] += direction.x * force * deltaTime * 2;
          positions[i3 + 1] += direction.y * force * deltaTime * 2;
          positions[i3 + 2] += direction.z * force * deltaTime * 2;
        } else if (distanceToMouse < mouseRepulsion) {
          // Repel particles from mouse when too close
          const direction = particlePos.clone().sub(mouse3D).normalize();
          const force = (mouseRepulsion - distanceToMouse) / mouseRepulsion;
          positions[i3] += direction.x * force * deltaTime;
          positions[i3 + 1] += direction.y * force * deltaTime;
          positions[i3 + 2] += direction.z * force * deltaTime;
        }
      }

      switch (physics) {
        case 'floating':
          // Original floating motion
          positions[i3] += particles.velocities[i3] * Math.sin(time * 0.5 + i) * 0.01;
          positions[i3 + 1] += particles.velocities[i3 + 1] * Math.cos(time * 0.3 + i) * 0.01;
          positions[i3 + 2] += particles.velocities[i3 + 2] * Math.sin(time * 0.4 + i) * 0.01;
          break;

        case 'trailing': {
          // Particles follow a trailing pattern
          const trailOffset = (i / count) * trailLength;
          positions[i3] += Math.sin(time * speed + trailOffset) * 0.02;
          positions[i3 + 1] += Math.cos(time * speed * 0.7 + trailOffset) * 0.02;
          positions[i3 + 2] += Math.sin(time * speed * 1.3 + trailOffset) * 0.02;
          break;
        }

        case 'explosive': {
          // Particles explode outward and fall back
          const age = (time + i * 0.1) % 5;
          const explosionForce = Math.min(age * 2, 2);
          positions[i3] += particles.velocities[i3] * explosionForce * deltaTime;
          positions[i3 + 1] += (particles.velocities[i3 + 1] * explosionForce - gravity * age) * deltaTime;
          positions[i3 + 2] += particles.velocities[i3 + 2] * explosionForce * deltaTime;

          // Reset after explosion cycle
          if (age > 4.5) {
            positions[i3] = (Math.random() - 0.5) * spread * 0.1;
            positions[i3 + 1] = 1;
            positions[i3 + 2] = (Math.random() - 0.5) * spread * 0.1;
          }
          break;
        }

        case 'spiral': {
          // Spiral motion around attraction point
          const angle = time * speed + i * 0.1;
          const radius = 2 + Math.sin(time * 0.5 + i) * 1;
          positions[i3] = attraction[0] + Math.cos(angle) * radius;
          positions[i3 + 1] = attraction[1] + Math.sin(time * 0.3 + i) * 0.5;
          positions[i3 + 2] = attraction[2] + Math.sin(angle) * radius;
          break;
        }
      }

      // Apply gravity to all physics modes
      if (physics !== 'spiral') {
        positions[i3 + 1] -= gravity * deltaTime * 0.1;
      }

      // Boundary constraints (relaxed for more dynamic movement)
      if (Math.abs(positions[i3]) > spread) positions[i3] *= 0.9;
      if (positions[i3 + 1] > spread * 1.5) positions[i3 + 1] = spread * 1.5;
      if (positions[i3 + 1] < -spread * 0.5) positions[i3 + 1] = -spread * 0.5;
      if (Math.abs(positions[i3 + 2]) > spread) positions[i3 + 2] *= 0.9;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface VolumetricLightProps {
  position: [number, number, number];
  color?: string;
  intensity?: number;
  radius?: number;
}

export function VolumetricLight({ position, color = '#ffffff', intensity = 0.5, radius = 5 }: VolumetricLightProps) {
  const lightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lightRef.current) {
      const time = state.clock.getElapsedTime();
      // Gentle pulsing effect
      const pulse = Math.sin(time * 2) * 0.1 + 0.9;
      lightRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={lightRef} position={position}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={intensity * 0.3}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
