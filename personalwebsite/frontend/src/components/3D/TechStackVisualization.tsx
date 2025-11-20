import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface TechStackVisualizationProps {
  technologies: string[];
  position: [number, number, number];
  radius?: number;
  height?: number;
}

/**
 * 3D Tech Stack Visualization - displays technologies in a spiral or orbital pattern
 */
export function TechStackVisualization({
  technologies,
  position,
  radius = 3,
  height = 2
}: TechStackVisualizationProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Generate positions for tech items in a spiral pattern
  const techPositions = useMemo(() => {
    return technologies.slice(0, 12).map((tech, index) => {
      const angle = (index / technologies.length) * Math.PI * 2;
      const heightOffset = (index / technologies.length) * height;
      const spiralRadius = radius * (0.5 + (index / technologies.length) * 0.5);

      return {
        position: [
          Math.cos(angle) * spiralRadius,
          heightOffset,
          Math.sin(angle) * spiralRadius
        ] as [number, number, number],
        rotation: [0, angle + Math.PI / 2, 0] as [number, number, number],
        tech,
        index
      };
    });
  }, [technologies, radius, height]);

  // Tech category colors
  const getTechColor = (tech: string): string => {
    const lowerTech = tech.toLowerCase();

    if (lowerTech.includes('react') || lowerTech.includes('vue') || lowerTech.includes('angular')) {
      return '#61dafb'; // React blue
    }
    if (lowerTech.includes('node') || lowerTech.includes('javascript') || lowerTech.includes('typescript')) {
      return '#3178c6'; // TypeScript blue
    }
    if (lowerTech.includes('python') || lowerTech.includes('tensorflow') || lowerTech.includes('pytorch')) {
      return '#ff6b35'; // Python orange
    }
    if (lowerTech.includes('docker') || lowerTech.includes('kubernetes')) {
      return '#2496ed'; // Docker blue
    }
    if (lowerTech.includes('aws') || lowerTech.includes('azure') || lowerTech.includes('gcp')) {
      return '#ff9900'; // AWS orange
    }
    if (lowerTech.includes('postgresql') || lowerTech.includes('mongodb') || lowerTech.includes('mysql')) {
      return '#47a248'; // Database green
    }

    // Default colors for other technologies
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a78bfa', '#f87171', '#06b6d4'];
    return colors[tech.length % colors.length];
  };

  // Animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();

      // Gentle overall rotation
      groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;

      // Animate individual tech items
      groupRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Group) {
          // Floating motion
          child.position.y += Math.sin(time * 2 + index) * 0.002;

          // Subtle rotation
          child.rotation.z = Math.sin(time * 1.5 + index * 0.5) * 0.1;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {techPositions.map(({ position: pos, rotation: rot, tech, index }) => {
        const color = getTechColor(tech);

        return (
          <group key={`tech-${index}`} position={pos} rotation={rot}>
            {/* Tech item base */}
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.15, 0.4]} />
              <meshStandardMaterial
                color="#1a1a2e"
                emissive={color}
                emissiveIntensity={0.1}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Glowing border */}
            <mesh position={[0, 0, -0.02]}>
              <boxGeometry args={[0.85, 0.18, 0.02]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.3}
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Tech name */}
            <Text
              position={[0, 0.12, 0.02]}
              fontSize={0.12}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="#000000"
              maxWidth={0.7}
            >
              {tech}
            </Text>

            {/* Connecting lines to center (optional visual effect) */}
            {index % 3 === 0 && (
              <mesh position={[0, -0.1, 0]}>
                <cylinderGeometry args={[0.01, 0.01, radius * 0.8, 8]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.2}
                  transparent
                  opacity={0.3}
                />
              </mesh>
            )}

            {/* Floating particles around each tech item */}
            {Array.from({ length: 3 }).map((_, particleIndex) => (
              <mesh
                key={`particle-${particleIndex}`}
                position={[
                  (Math.random() - 0.5) * 1.2,
                  Math.random() * 0.3,
                  (Math.random() - 0.5) * 0.8
                ]}
              >
                <sphereGeometry args={[0.02, 6, 4]} />
                <meshStandardMaterial
                  color={color}
                  transparent
                  opacity={0.6}
                  emissive={color}
                  emissiveIntensity={0.4}
                />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Central hub */}
      <group position={[0, height / 2, 0]}>
        <mesh>
          <sphereGeometry args={[0.3, 16, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#4ecdc4"
            emissiveIntensity={0.3}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Pulsing ring around center */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.05, 8, 16]} />
          <meshStandardMaterial
            color="#4ecdc4"
            emissive="#4ecdc4"
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>

        <Text
          position={[0, 0.6, 0]}
          fontSize={0.2}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          Tech Stack
        </Text>
      </group>

      {/* Ambient lighting for the tech stack */}
      <pointLight
        position={[0, height / 2, 0]}
        color="#4ecdc4"
        intensity={1}
        distance={8}
        decay={2}
      />
    </group>
  );
}
