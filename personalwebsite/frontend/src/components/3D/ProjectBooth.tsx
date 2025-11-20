import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Project } from '@/data/projects';

type BoothProps = {
  position?: [number, number, number];
  project: Project;
  onClick?: (_project: Project) => void;
};

/**
 * Enhanced interactive booth showcasing projects with app previews and mini-demos.
 * Features: holographic displays, tech stack visualization, animated effects, and interactive previews.
 */
export function ProjectBooth({ position = [0, 0, 0], project, onClick }: BoothProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Get category color and icon
  const categoryColor = project.category === 'ai-ml' ? '#ff6b6b' :
                       project.category === 'web-dev' ? '#4ecdc4' :
                       project.category === 'research' ? '#ffe66d' :
                       project.category === 'mobile' ? '#a78bfa' : '#f87171';

  const accent = hovered ? '#ffffff' : categoryColor;

  // Enhanced geometry with app preview mockup
  const archPath = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const rx = 1.8;
    const ry = 1.4;
    for (let a = Math.PI; a >= 0; a -= Math.PI / 24) {
      points.push(new THREE.Vector3(Math.cos(a) * rx, Math.sin(a) * ry, 0));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  // Tech stack visualization positions
  const techPositions = useMemo(() => {
    return project.technologies.slice(0, 6).map((_, index) => {
      const angle = (index / 6) * Math.PI * 2;
      const radius = 1.8;
      return [Math.cos(angle) * radius, 1.5 + Math.sin(angle) * 0.3, Math.sin(angle) * radius] as [number, number, number];
    });
  }, [project.technologies]);

  // Animation for hover effect with enhanced interactions
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const baseY = position[1] + Math.sin(time * 2) * 0.03;

      if (hovered) {
        groupRef.current.position.y = baseY + Math.sin(time * 4) * 0.05;
        groupRef.current.rotation.y = Math.sin(time * 3) * 0.08;
        groupRef.current.scale.setScalar(1.05 + Math.sin(time * 5) * 0.02);
      } else {
        groupRef.current.position.y = baseY;
        groupRef.current.rotation.y *= 0.95;
        groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }

      if (clicked) {
        groupRef.current.position.y = baseY + 0.2;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => {
        setClicked(!clicked);
        onClick?.(project);
      }}
    >
      {/* Enhanced base platform with glowing edges */}
      <mesh receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[5, 0.15, 3.5]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive={categoryColor}
          emissiveIntensity={0.1}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Glowing platform border */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[5.2, 0.02, 3.7]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Enhanced pillars with tech details */}
      {[-2.2, 2.2].map((x, index) => (
        <group key={`pillar-${index}`}>
          <mesh castShadow position={[x, 1.2, -1.5]}>
            <boxGeometry args={[0.2, 2.4, 0.2]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Pillar accent lights */}
          <pointLight
            position={[x, 2.2, -1.5]}
            color={accent}
            intensity={0.8}
            distance={4}
          />
        </group>
      ))}

      {/* Enhanced arch with holographic effect */}
      <mesh rotation={[0, 0, 0]} position={[0, 2.6, -1.5]}>
        <tubeGeometry args={[archPath, 32, 0.08, 12, false]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.4}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Main holographic display screen */}
      <group position={[0, 1.4, 0.3]}>
        <mesh castShadow>
          <boxGeometry args={[3.2, 2, 0.2]} />
          <meshStandardMaterial
            color="#0f0f23"
            emissive="#001122"
            emissiveIntensity={0.1}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Screen bezel with glow */}
        <mesh position={[0, 0, -0.12]}>
          <boxGeometry args={[3.4, 2.2, 0.05]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* App preview area - shows mockup of the actual app */}
        <mesh position={[0, 0, -0.11]}>
          <planeGeometry args={[3, 1.8]} />
          <meshStandardMaterial
            color="#e8f4f8"
            emissive={categoryColor}
            emissiveIntensity={0.05}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Animated scan lines */}
        <mesh position={[0, 0, -0.105]}>
          <planeGeometry args={[3, 0.02]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* Floating project title */}
      <Text
        position={[0, 3.2, 0.3]}
        fontSize={0.28}
        color={accent}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
        font="/fonts/inter-bold.woff"
      >
        {project.title}
      </Text>

      {/* Enhanced subtitle with status indicator */}
      <group position={[0, 2.8, 0.3]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.16}
          color="#e5e7eb"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {project.subtitle}
        </Text>
        {/* Status indicator */}
        <Text
          position={[1.8, 0, 0]}
          fontSize={0.12}
          color={
            project.status === 'completed' ? '#10b981' :
            project.status === 'in-progress' ? '#f59e0b' : '#6b7280'
          }
          anchorX="center"
          anchorY="middle"
        >
          {project.status === 'completed' ? '●' : project.status === 'in-progress' ? '◐' : '○'}
        </Text>
      </group>

      {/* Tech stack orbiting visualization */}
      {project.technologies.slice(0, 6).map((tech, index) => (
        <group key={`tech-${index}`} position={techPositions[index]}>
          <mesh>
            <sphereGeometry args={[0.08, 8, 6]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
          <Text
            position={[0, 0.15, 0]}
            fontSize={0.08}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {tech}
          </Text>
        </group>
      ))}

      {/* Category indicator with icon */}
      <group position={[0, 0.6, 2]}>
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.18}
          color={categoryColor}
          anchorX="center"
          anchorY="middle"
        >
          {project.category === 'ai-ml' ? '🤖' :
           project.category === 'web-dev' ? '💻' :
           project.category === 'research' ? '🔬' :
           project.category === 'mobile' ? '📱' : '⚡'}
        </Text>
        <Text
          position={[0, -0.1, 0]}
          fontSize={0.1}
          color={categoryColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {project.category.toUpperCase().replace('-', ' ')}
        </Text>
      </group>

      {/* Impact metric display */}
      {project.impact && (
        <group position={[0, -0.2, 1.8]}>
          <mesh>
            <planeGeometry args={[2, 0.3]} />
            <meshStandardMaterial
              color="#16213e"
              transparent
              opacity={0.8}
              emissive="#0f3460"
              emissiveIntensity={0.1}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.08}
            color="#4ecdc4"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
          >
            {project.impact}
          </Text>
        </group>
      )}

      {/* Enhanced lighting system */}
      <pointLight
        position={[0, 3, -1]}
        color={accent}
        intensity={hovered ? 2 : 1}
        distance={8}
      />
      <spotLight
        position={[0, 4, 0]}
        target-position={[0, 1.5, 0]}
        color={categoryColor}
        intensity={1.5}
        angle={0.6}
        penumbra={0.5}
        distance={10}
      />

      {/* Atmospheric particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`particle-${i}`} position={[
          (Math.random() - 0.5) * 6,
          Math.random() * 3 + 1,
          (Math.random() - 0.5) * 4
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
    </group>
  );
}
