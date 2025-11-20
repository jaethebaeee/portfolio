import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { VoxelStructure } from '../models/VoxelBuilder';
import { RETRO_COLORS } from '../constants/colors';
import { Text, Html } from '@react-three/drei';
import { ParticleField } from '../Effects/ParticleField';
import { InfoWaypoint } from '../InfoWaypoint';
import { HoverEffect } from '../HoverEffect';
import { skillsContent } from './constants/skillsContent';
import { VoxelAdder } from './voxelHelpers';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { PerformanceText } from '../PerformanceText';
import { ZoneLighting } from '../ZoneLighting';

interface SkillOrbData {
  id: string;
  position: [number, number, number];
  skill: string;
  level: number;
  color: string;
  category: string;
}

interface SkillOrbProps {
  position: [number, number, number];
  skill: string;
  level: number;
  color: string;
  onClick?: () => void;
}

function SkillOrb({ position, skill, level, color, onClick }: SkillOrbProps) {
  const orbRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (orbRef.current) {
      const time = state.clock.getElapsedTime();
      // Gentle floating animation
      orbRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1;
      // Subtle rotation
      orbRef.current.rotation.y = time * 0.5;
    }
  });

  const size = 0.3 + (level / 100) * 0.4; // Size based on skill level

  return (
    <group
      ref={orbRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Main skill orb */}
      <mesh>
        <sphereGeometry args={[size, 16, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.2}
          transparent
          opacity={0.8}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Proficiency ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size + 0.1, 0.02, 8, 16, Math.PI * 2 * (level / 100)]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Skill name */}
      <Text
        position={[0, size + 0.3, 0]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {skill}
      </Text>

      {/* Proficiency percentage */}
      <Text
        position={[0, size + 0.1, 0]}
        fontSize={0.08}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {level}%
      </Text>

      {/* Floating particles */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 1,
            (Math.random() - 0.5) * 1,
            (Math.random() - 0.5) * 1
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
}

export function SkillsZone() {
  const performanceMetrics = usePerformanceMonitor();

  // Adapt global performance metrics to component needs
  const particleCount = performanceMetrics.fps < 30 ? 4 : performanceMetrics.fps < 50 ? 6 : 8;
  const enableAdvancedEffects = performanceMetrics.fps >= 40;
  const renderQuality = performanceMetrics.quality;
  const [selectedSkill, setSelectedSkill] = useState<any>(null);

  // Enhanced skills pavilion architecture
  const voxels = useMemo(() => {
    const skillVoxels: Array<{
      pos: [number, number, number];
      color: string;
      materialType?: 'standard' | 'metallic' | 'emissive' | 'glass' | 'animated';
      emissiveIntensity?: number;
      metalness?: number;
      roughness?: number;
    }> = [];

    const addVoxel: VoxelAdder = (
      position: [number, number, number],
      color: string,
      materialType?: 'standard' | 'metallic' | 'emissive' | 'glass' | 'animated',
      emissiveIntensity?: number,
      metalness?: number,
      roughness?: number
    ) => {
      skillVoxels.push({
        pos: position,
        color,
        materialType,
        emissiveIntensity,
        metalness,
        roughness
      });
    };

    // Enhanced circular platform
    for (let x = -12; x <= 12; x++) {
      for (let z = -12; z <= 12; z++) {
        const distance = Math.sqrt(x * x + z * z);
        if (distance <= 12) {
          const isEdge = distance > 10;
          if (isEdge) {
            addVoxel([x, 0, z], RETRO_COLORS.neonBlue, 'emissive', 0.3);
          } else {
            addVoxel([x, 0, z], RETRO_COLORS.lightGray, 'metallic', 0.1, 0.8, 0.2);
          }
        }
      }
    }

    // Central pedestal for main skills display
    for (let y = 1; y <= 5; y++) {
      for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
          if (Math.abs(x) + Math.abs(z) <= 2) {
            const materialType = y === 5 ? 'emissive' : 'metallic';
            const emissiveIntensity = materialType === 'emissive' ? 0.5 : 0.1;
            addVoxel([x, y, z], RETRO_COLORS.white, materialType, emissiveIntensity, 0.9, 0.1);
          }
        }
      }
    }

    // Skill category pillars around the perimeter
    const categories = skillsContent.skillCategories;
    categories.forEach((category, index) => {
      const angle = (index / categories.length) * Math.PI * 2;
      const radius = 8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Pillar base
      for (let y = 1; y <= 4; y++) {
        const materialType = y % 2 === 0 ? 'metallic' : 'emissive';
        const emissiveIntensity = materialType === 'emissive' ? 0.3 : undefined;
        const metalness = materialType === 'metallic' ? 0.8 : undefined;
        addVoxel([Math.round(x), y, Math.round(z)], category.proficiency > 80 ? RETRO_COLORS.electricGreen : RETRO_COLORS.neonBlue, materialType, emissiveIntensity, metalness, 0.2);
      }

      // Pillar cap
      addVoxel([Math.round(x), 5, Math.round(z)], RETRO_COLORS.white, 'emissive', 0.6);
    });

    return skillVoxels;
  }, []);

  // Generate skill orbs for all skills
  const skillOrbs = useMemo(() => {
    const orbs: SkillOrbData[] = [];
    let orbIndex = 0;

    skillsContent.skillCategories.forEach((category, categoryIndex) => {
      const angle = (categoryIndex / skillsContent.skillCategories.length) * Math.PI * 2;
      const radius = 6;
      const centerX = Math.cos(angle) * radius;
      const centerZ = Math.sin(angle) * radius;

      category.skills.forEach((skill, skillIndex) => {
        const skillAngle = (skillIndex / category.skills.length) * Math.PI * 2;
        const skillRadius = 2;
        const x = centerX + Math.cos(skillAngle) * skillRadius;
        const z = centerZ + Math.sin(skillAngle) * skillRadius;
        const y = 2 + Math.sin(skillIndex) * 0.5;

        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a78bfa', '#f87171'];
        const color = colors[orbIndex % colors.length];

        orbs.push({
          id: `skill-${categoryIndex}-${skillIndex}`,
          position: [x, y, z] as [number, number, number],
          skill: skill.name,
          level: skill.level,
          color,
          category: category.title
        });

        orbIndex++;
      });
    });

    return orbs;
  }, []);

  return (
    <HoverEffect glowColor="#a78bfa" glowIntensity={0.3} scaleMultiplier={1.005}>
      <group position={[15, 0, 0]}>
        <VoxelStructure voxels={voxels} />

        {/* Zone lighting */}
        <ZoneLighting
          position={[15, 0, 0]}
          primaryAccentColor="#a78bfa"
          secondaryAccentColor="#34d399"
        />

        {/* Enhanced zone header */}
        <PerformanceText
          position={[0, 9, 0]}
          fontSize={1.0}
          renderQuality={renderQuality}
          color="#a78bfa"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#ffffff"
        >
          SKILLS & EXPERTISE
        </PerformanceText>

        <PerformanceText
          position={[0, 7.5, 0]}
          fontSize={0.5}
          renderQuality={renderQuality}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#a78bfa"
        >
          Technical Proficiency & Core Competencies
        </PerformanceText>

        {/* Central skills display */}
        <group position={[0, 6, 0]}>
          {skillsContent.skillCategories.map((category, index) => {
            const angle = (index / skillsContent.skillCategories.length) * Math.PI * 2;
            const radius = 4;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            return (
              <group key={category.id} position={[x, 0, z]}>
                {/* Category icon */}
                <Text
                  position={[0, 1, 0]}
                  fontSize={0.4}
                  color="#a78bfa"
                  anchorX="center"
                  anchorY="middle"
                >
                  {category.icon}
                </Text>

                {/* Category title */}
                <Text
                  position={[0, 0.3, 0]}
                  fontSize={0.15}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.01}
                  outlineColor="#000000"
                  maxWidth={2}
                >
                  {category.title}
                </Text>

                {/* Proficiency bar */}
                <group position={[0, -0.3, 0]}>
                  <mesh>
                    <planeGeometry args={[2, 0.1]} />
                    <meshStandardMaterial color="#333333" />
                  </mesh>
                  <mesh position={[-(2 - (category.proficiency / 100) * 2) / 2, 0, 0.01]}>
                    <planeGeometry args={[(category.proficiency / 100) * 2, 0.08]} />
                    <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.3} />
                  </mesh>
                  <Text
                    position={[1.2, 0, 0.02]}
                    fontSize={0.08}
                    color="#a78bfa"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {category.proficiency}%
                  </Text>
                </group>
              </group>
            );
          })}
        </group>

        {/* Interactive skill orbs */}
        {skillOrbs.map((orb) => (
          <SkillOrb
            key={orb.id}
            position={orb.position}
            skill={orb.skill}
            level={orb.level}
            color={orb.color}
            onClick={() => setSelectedSkill(orb)}
          />
        ))}

        {/* Performance-aware particle effects */}
        {enableAdvancedEffects && (
          <>
            <ParticleField
              count={Math.floor(particleCount * 2.5)}
              position={[0, 4, 0]}
              color="#a78bfa"
              size={0.015}
              speed={0.08}
              spread={12}
            />

            <ParticleField
              count={Math.floor(particleCount * 1.8)}
              position={[0, 2, 0]}
              color="#4ecdc4"
              size={0.01}
              speed={0.12}
              spread={8}
            />
          </>
        )}

        {/* Lighting for skill zone */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[0, 10, 0]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Skill category information waypoints */}
        {skillsContent.skillCategories.map((category, index) => {
          const angle = (index / skillsContent.skillCategories.length) * Math.PI * 2;
          const radius = 10;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
            <InfoWaypoint
              key={category.id}
              position={[x, 2, z]}
              title={`${category.icon} ${category.title}`}
              content={`${category.description} Proficiency: ${category.proficiency}%`}
              icon={category.icon}
              color="#a78bfa"
              zoneType="skills"
            />
          );
        })}

        {/* Skill details modal */}
        {selectedSkill && (
          <Html position={[0, 2, -8]} center>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-sm text-white">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-blue-400">{selectedSkill.skill}</h3>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-300">
                  Proficiency: <span className="text-green-400 font-semibold">{selectedSkill.level}%</span>
                </p>
                <p className="text-sm text-gray-300">
                  Category: <span className="text-purple-400">{selectedSkill.category}</span>
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${selectedSkill.level}%` }}
                  />
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>
    </HoverEffect>
  );
}


