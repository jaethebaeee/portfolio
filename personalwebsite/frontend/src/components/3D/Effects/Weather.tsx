import { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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

  return (
    <>
      {renderWeather()}
      {/* Always add some magical sparkles for atmosphere */}
      <Sparkles count={50} spread={40} />
      {/* Advanced particle systems */}
      <ParticleField type="ambient" intensity={0.3} />
    </>
  );
}

interface SparklesProps {
  count?: number;
  spread?: number;
}

export function Sparkles({ count = 30, spread = 30 }: SparklesProps) {
  const sparklesRef = useRef<THREE.Points>(null);

  const sparkles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Random positions around the scene
      positions[i * 3] = (Math.random() - 0.5) * spread * 2;
      positions[i * 3 + 1] = Math.random() * 8 + 3; // Floating height
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 2;

      // Magical colors (purples, blues, golds)
      const colorType = Math.random();
      if (colorType < 0.4) {
        // Purple sparkles
        colors[i * 3] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.4 + Math.random() * 0.3;
        colors[i * 3 + 2] = 1.0;
      } else if (colorType < 0.7) {
        // Blue sparkles
        colors[i * 3] = 0.4 + Math.random() * 0.3;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i * 3 + 2] = 1.0;
      } else {
        // Gold sparkles
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.4 + Math.random() * 0.3;
      }

      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, colors, phases };
  }, [count, spread]);

  useFrame((state, delta) => {
    if (!sparklesRef.current) return;

    const positions = sparklesRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const phase = sparkles.phases[i];
      const time = state.clock.getElapsedTime();

      // Gentle floating motion
      positions[i * 3 + 1] += Math.sin(time * 1.5 + phase) * delta * 0.5;

      // Reset if they float too high or low
      if (positions[i * 3 + 1] > 12 || positions[i * 3 + 1] < 2) {
        positions[i * 3 + 1] = Math.random() * 6 + 4;
      }
    }

    sparklesRef.current.geometry.attributes.position.needsUpdate = true;

    // Slow rotation for magical feel
    sparklesRef.current.rotation.y += delta * 0.2;
  });

  return (
    <points ref={sparklesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[sparkles.positions, 3]}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[sparkles.colors, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface ParticleFieldProps {
  type?: 'ambient' | 'energy' | 'magical' | 'tech';
  intensity?: number;
  position?: [number, number, number];
  spread?: number;
}

export function ParticleField({
  type = 'ambient',
  intensity = 1,
  position = [0, 0, 0],
  spread = 50
}: ParticleFieldProps) {
  const particlesRef = useRef<THREE.Points>(null);

  const particleSystem = useMemo(() => {
    const count = Math.floor(200 * intensity);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute particles in 3D space
      positions[i * 3] = (Math.random() - 0.5) * spread + position[0];
      positions[i * 3 + 1] = Math.random() * spread * 0.6 + position[1];
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread + position[2];

      // Random movement velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      // Particle phases for animation
      phases[i] = Math.random() * Math.PI * 2;

      // Color based on type
      switch (type) {
        case 'energy':
          colors[i * 3] = 0.2 + Math.random() * 0.3; // R
          colors[i * 3 + 1] = 0.8 + Math.random() * 0.2; // G
          colors[i * 3 + 2] = 1.0; // B
          scales[i] = 0.02 + Math.random() * 0.03;
          break;
        case 'magical': {
          const hue = Math.random();
          const rgb = new THREE.Color().setHSL(hue, 0.8, 0.6);
          colors[i * 3] = rgb.r;
          colors[i * 3 + 1] = rgb.g;
          colors[i * 3 + 2] = rgb.b;
          scales[i] = 0.015 + Math.random() * 0.02;
          break;
        }
        case 'tech':
          colors[i * 3] = 0.4 + Math.random() * 0.3; // R
          colors[i * 3 + 1] = 0.9 + Math.random() * 0.1; // G
          colors[i * 3 + 2] = 1.0; // B
          scales[i] = 0.01 + Math.random() * 0.02;
          break;
        default: // ambient
          colors[i * 3] = 0.8 + Math.random() * 0.2;
          colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
          colors[i * 3 + 2] = 1.0;
          scales[i] = 0.005 + Math.random() * 0.01;
      }
    }

    return { positions, colors, scales, velocities, phases, count };
  }, [type, intensity, spread, position]);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < particleSystem.count; i++) {
      const i3 = i * 3;
      const phase = particleSystem.phases[i];

      // Complex movement patterns based on type
      switch (type) {
        case 'energy':
          // Pulsing energy particles
          positions[i3 + 1] += Math.sin(time * 2 + phase) * delta * 0.5;
          break;
        case 'magical':
          // Floating magical particles with circular motion
          positions[i3] += Math.sin(time + phase) * delta * 0.2;
          positions[i3 + 2] += Math.cos(time + phase) * delta * 0.2;
          positions[i3 + 1] += Math.sin(time * 0.5 + phase) * delta * 0.1;
          break;
        case 'tech':
          // Geometric tech particles
          positions[i3] += Math.sin(time * 1.5 + phase) * delta * 0.3;
          positions[i3 + 2] += Math.cos(time * 1.5 + phase) * delta * 0.3;
          break;
        default: // ambient
          // Gentle floating motion
          positions[i3] += particleSystem.velocities[i3] * delta;
          positions[i3 + 1] += particleSystem.velocities[i3 + 1] * delta;
          positions[i3 + 2] += particleSystem.velocities[i3 + 2] * delta;
      }

      // Boundary wrapping
      if (Math.abs(positions[i3]) > spread / 2) positions[i3] *= -0.9;
      if (positions[i3 + 1] > spread * 0.8) positions[i3 + 1] = 0;
      if (positions[i3 + 1] < -5) positions[i3 + 1] = spread * 0.6;
      if (Math.abs(positions[i3 + 2]) > spread / 2) positions[i3 + 2] *= -0.9;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleSystem.count}
          array={particleSystem.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleSystem.count}
          array={particleSystem.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleSystem.count}
          array={particleSystem.scales}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={type === 'energy' || type === 'tech' ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

interface InteractiveElementProps {
  position: [number, number, number];
  type?: 'floating_crystal' | 'energy_orb' | 'magical_rune' | 'hologram';
  onInteract?: () => void;
}

export function InteractiveElement({
  position,
  type = 'floating_crystal',
  onInteract
}: InteractiveElementProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [isHovered, setIsHovered] = useState(false);
  const [interactionCooldown, setInteractionCooldown] = useState(0);

  const elementGeometry = useMemo(() => {
    switch (type) {
      case 'floating_crystal':
        return <octahedronGeometry args={[0.5, 0]} />;
      case 'energy_orb':
        return <sphereGeometry args={[0.3, 16, 16]} />;
      case 'magical_rune':
        return <planeGeometry args={[1, 1]} />;
      case 'hologram':
        return <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />;
      default:
        return <boxGeometry args={[0.5, 0.5, 0.5]} />;
    }
  }, [type]);

  const elementMaterial = useMemo(() => {
    switch (type) {
      case 'floating_crystal':
        return (
          <meshPhysicalMaterial
            color="#00ffff"
            transparent
            opacity={0.8}
            transmission={0.9}
            thickness={0.1}
            roughness={0}
            metalness={0}
            emissive="#003d4d"
            emissiveIntensity={0.2}
          />
        );
      case 'energy_orb':
        return (
          <meshStandardMaterial
            color="#00ff88"
            transparent
            opacity={0.9}
            emissive="#00ff88"
            emissiveIntensity={0.5}
            metalness={0}
            roughness={0.2}
          />
        );
      case 'magical_rune':
        return (
          <meshStandardMaterial
            color="#ff6b6b"
            transparent
            opacity={0.7}
            emissive="#ff6b6b"
            emissiveIntensity={0.3}
            side={THREE.DoubleSide}
            metalness={0}
            roughness={0.35}
          />
        );
      case 'hologram':
        return (
          <meshStandardMaterial
            color="#4ecdc4"
            transparent
            opacity={0.6}
            emissive="#4ecdc4"
            emissiveIntensity={0.4}
            metalness={0}
            roughness={0.25}
          />
        );
      default:
        return <meshStandardMaterial color="#ffffff" />;
    }
  }, [type]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const distance = camera.position.distanceTo(new THREE.Vector3(...position));
    const inRange = distance < 8;

    // Interactive behavior based on proximity
    if (inRange) {
      // Gentle floating motion when player is near
      meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.2;

      // Rotation based on type
      switch (type) {
        case 'floating_crystal':
          meshRef.current.rotation.x = time * 0.5;
          meshRef.current.rotation.y = time * 0.3;
          meshRef.current.rotation.z = time * 0.2;
          break;
        case 'energy_orb': {
          meshRef.current.rotation.y = time * 1.5;
          // Pulsing scale
          const pulseScale = 1 + Math.sin(time * 4) * 0.1;
          meshRef.current.scale.setScalar(pulseScale);
          break;
        }
        case 'magical_rune':
          meshRef.current.rotation.z = time * 0.8;
          break;
        case 'hologram': {
          meshRef.current.rotation.y = time * 2;
          // Scan line effect
          meshRef.current.position.y = position[1] + Math.sin(time * 3) * 0.1;
          break;
        }
      }

      // Interaction cooldown
      if (interactionCooldown > 0) {
        setInteractionCooldown(prev => prev - delta);
      }

      // Auto-interact when very close
      if (distance < 3 && interactionCooldown <= 0) {
        onInteract?.();
        setInteractionCooldown(5); // 5 second cooldown
      }
    } else {
      // Idle state when player is far
      meshRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.05;
      meshRef.current.rotation.y = time * 0.1;
    }

    // Hover effect
    if (isHovered && inRange) {
      meshRef.current.scale.setScalar(1.2);
    } else {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onClick={() => {
        if (interactionCooldown <= 0) {
          onInteract?.();
          setInteractionCooldown(2);
        }
      }}
    >
      <mesh>
        {elementGeometry}
        {elementMaterial}
      </mesh>

      {/* Glow effect */}
      {type !== 'magical_rune' && (
        <mesh>
          {type === 'energy_orb' ? (
            <sphereGeometry args={[0.4, 16, 16]} />
          ) : type === 'floating_crystal' ? (
            <octahedronGeometry args={[0.6, 0]} />
          ) : (
            <boxGeometry args={[0.6, 0.6, 0.6]} />
          )}
          <meshStandardMaterial
            color={type === 'energy_orb' ? '#00ff88' : type === 'floating_crystal' ? '#00ffff' : '#4ecdc4'}
            transparent
            opacity={0.1}
            emissive={type === 'energy_orb' ? '#00ff88' : type === 'floating_crystal' ? '#00ffff' : '#4ecdc4'}
            emissiveIntensity={0.2}
            metalness={0}
            roughness={0.25}
          />
        </mesh>
      )}
    </group>
  );
}
