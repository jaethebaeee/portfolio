import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RainProps {
  count?: number;
  position?: [number, number, number];
  spread?: number;
}

export function Rain({ count = 200, position = [0, 10, 0], spread = 50 }: RainProps) {
  const rainRef = useRef<THREE.Points>(null);

  const raindrops = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Random positions within spread
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = Math.random() * 20 + 5; // Height
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

      // Random fall speeds
      velocities[i] = Math.random() * 0.5 + 0.5;
    }

    return { positions, velocities };
  }, [count, spread]);

  useFrame((_state, delta) => {
    if (!rainRef.current) return;

    const positions = rainRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Update raindrop positions
      positions[i * 3 + 1] -= raindrops.velocities[i] * delta * 10;

      // Reset raindrop when it hits ground
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 20;
        // Add some randomness to reset position
        positions[i * 3] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      }
    }

    rainRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={rainRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[raindrops.positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#4ecdc4"
        size={0.05}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface CloudProps {
  position?: [number, number, number];
  scale?: number;
  density?: number;
}

export function Cloud({ position = [0, 15, 0], scale = 1, density = 20 }: CloudProps) {
  const cloudRef = useRef<THREE.Points>(null);

  const cloudParticles = useMemo(() => {
    const positions = new Float32Array(density * 3);

    for (let i = 0; i < density; i++) {
      // Create cloud-like distribution
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 3;
      const height = (Math.random() - 0.5) * 2;

      positions[i * 3] = Math.cos(angle) * radius * scale;
      positions[i * 3 + 1] = height * scale;
      positions[i * 3 + 2] = Math.sin(angle) * radius * scale;
    }

    return positions;
  }, [density, scale]);

  useFrame((state) => {
    if (cloudRef.current) {
      const time = state.clock.getElapsedTime();
      // Gentle cloud movement
      cloudRef.current.position.x = position[0] + Math.sin(time * 0.1) * 0.5;
      cloudRef.current.position.z = position[2] + Math.cos(time * 0.1) * 0.5;
    }
  });

  return (
    <points ref={cloudRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[cloudParticles, 3]}
          count={density}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.8}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface WindEffectProps {
  strength?: number;
  direction?: [number, number, number];
}

export function WindEffect({ strength: _strength = 1, direction: _direction = [1, 0, 0] }: WindEffectProps) {
  // This component affects other objects in the scene via context
  // For now, it's a placeholder for wind simulation
  return null;
}

export function WeatherSystem() {
  // Randomly choose weather conditions
  const weatherType = useMemo(() => {
    const types = ['clear', 'cloudy', 'rainy'];
    return types[Math.floor(Math.random() * types.length)];
  }, []);

  const renderWeather = () => {
    switch (weatherType) {
      case 'rainy':
        return (
          <>
            <Rain count={300} spread={60} />
            <Cloud position={[-20, 15, -20]} scale={1.5} density={30} />
            <Cloud position={[20, 18, 10]} scale={1.2} density={25} />
            <Cloud position={[0, 20, -30]} scale={1.8} density={35} />
          </>
        );

      case 'cloudy':
        return (
          <>
            <Cloud position={[-25, 15, -25]} scale={2} density={40} />
            <Cloud position={[25, 18, 25]} scale={1.8} density={35} />
            <Cloud position={[0, 22, 0]} scale={2.2} density={45} />
            <Cloud position={[-15, 16, 20]} scale={1.5} density={30} />
            <Cloud position={[20, 19, -15]} scale={1.7} density={32} />
          </>
        );

      default: // clear
        return (
          <>
            <Cloud position={[-30, 20, -30]} scale={1.2} density={20} />
            <Cloud position={[30, 18, 30]} scale={1} density={15} />
          </>
        );
    }
  };

  return <>{renderWeather()}</>;
}
