import { Text } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Project, projectCategories } from '@/data/projects';

type FloatingCardProps = {
  position: [number, number, number];
  project: Project;
  orbitRadius?: number;
  orbitSpeed?: number;
  floatHeight?: number;
};

/**
 * A floating holographic-style project card that orbits around a central point
 */
export function FloatingProjectCard({
  position,
  project,
  orbitRadius = 8,
  orbitSpeed = 0.5,
  floatHeight = 2
}: FloatingCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const startTime = useRef(Math.random() * Math.PI * 2); // Random start position

  const categoryColor = project.category === 'ai-ml' ? '#ff6b6b' :
                       project.category === 'web-dev' ? '#4ecdc4' :
                       project.category === 'research' ? '#ffe66d' :
                       project.category === 'mobile' ? '#a78bfa' : '#f87171';

  const accent = hovered ? '#ffffff' : categoryColor;

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime() + startTime.current;

      // Orbital motion around the center
      const angle = time * orbitSpeed;
      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;

      // Floating motion
      const y = floatHeight + Math.sin(time * 2 + startTime.current) * 0.5;

      groupRef.current.position.set(
        position[0] + x,
        position[1] + y,
        position[2] + z
      );

      // Face the center while orbiting
      groupRef.current.lookAt(position[0], position[1] + y, position[2]);

      // Gentle rotation for holographic effect
      groupRef.current.rotation.z = Math.sin(time * 1.5) * 0.1;

      if (hovered) {
        groupRef.current.scale.setScalar(1.2);
      } else {
        groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Holographic card base */}
      <mesh>
        <boxGeometry args={[3, 2, 0.05]} />
        <meshStandardMaterial
          color="#001122"
          transparent
          opacity={0.8}
          emissive={accent}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Glowing border */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[3.2, 2.2, 0.01]} />
        <meshStandardMaterial
          color={accent}
          transparent
          opacity={0.3}
          emissive={accent}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Animated scan lines */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[3, 0.05]} />
        <meshStandardMaterial
          color={accent}
          transparent
          opacity={0.6}
          emissive={accent}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Project title */}
      <Text
        position={[0, 0.6, 0.03]}
        fontSize={0.2}
        color={accent}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {project.title}
      </Text>

      {/* Project subtitle */}
      <Text
        position={[0, 0.2, 0.03]}
        fontSize={0.12}
        color="#e5e7eb"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
        maxWidth={2.5}
      >
        {project.subtitle}
      </Text>

      {/* Tech stack badges */}
      <group position={[0, -0.4, 0.03]}>
        {project.technologies.slice(0, 3).map((tech, index) => (
          <Text
            key={tech}
            position={[0, -index * 0.15, 0]}
            fontSize={0.08}
            color="#a1a1aa"
            anchorX="center"
            anchorY="middle"
          >
            {tech}
          </Text>
        ))}
      </group>

      {/* Status indicator */}
      <Text
        position={[1.2, 0.8, 0.03]}
        fontSize={0.08}
        color={project.status === 'completed' ? '#10b981' : project.status === 'in-progress' ? '#f59e0b' : '#6b7280'}
        anchorX="center"
        anchorY="middle"
      >
        {project.status === 'completed' ? '✓' : project.status === 'in-progress' ? '⟳' : '○'}
      </Text>

      {/* Category icon */}
      <Text
        position={[-1.2, 0.8, 0.03]}
        fontSize={0.12}
        color={categoryColor}
        anchorX="center"
        anchorY="middle"
      >
        {projectCategories[project.category].icon}
      </Text>

      {/* Holographic particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 0.1
        ]}>
          <sphereGeometry args={[0.02, 6, 4]} />
          <meshStandardMaterial
            color={accent}
            transparent
            opacity={0.4}
            emissive={accent}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      {/* Spotlight effect */}
      <pointLight
        position={[0, 0, 1]}
        color={accent}
        intensity={hovered ? 1.5 : 0.8}
        distance={4}
      />
    </group>
  );
}
