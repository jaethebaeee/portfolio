import React, { useMemo, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { VoxelStructure } from '../models/VoxelBuilder';
import { RETRO_COLORS } from '../constants/colors';
import { Text, Html } from '@react-three/drei';
import { InfoWaypoint } from '../InfoWaypoint';
import { HoverEffect } from '../HoverEffect';
import { ParticleField } from '../Effects/ParticleField';
import { generatePlatform, generateWalls, VoxelAdder } from './voxelHelpers';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { PerformanceText } from '../PerformanceText';
import { ZoneLighting } from '../ZoneLighting';

// Cornell University colors
const CORNELL_RED = '#B31B1B';

// Metro color mapping using global RETRO_COLORS palette
const METRO_COLORS = {
  neonPink: RETRO_COLORS.hotPink,
  electricBlue: RETRO_COLORS.neonBlue,
  cyberGreen: RETRO_COLORS.electricGreen,
  hotOrange: RETRO_COLORS.cyberOrange,
  plasmaPurple: RETRO_COLORS.plasmaPurple,
  retroYellow: RETRO_COLORS.cyberYellow,
  coralRed: RETRO_COLORS.coral,
  synthMagenta: RETRO_COLORS.synthwaveMagenta
};

// Type definitions
type VoxelData = {
  pos: [number, number, number];
  color: string;
  materialType?: 'standard' | 'metallic' | 'emissive' | 'glass' | 'animated';
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
};

/**
 * Helper function to create a colorful 1980s metro library structure
 */
function createEducationZoneVoxels(): VoxelData[] {
  const voxels: VoxelData[] = [];

  const addVoxel: VoxelAdder = (pos, color, materialType, emissiveIntensity) =>
    voxels.push({ pos, color, materialType, emissiveIntensity });

  // Generate vibrant metro platform
  generatePlatform(addVoxel, { PLATFORM_SIZE: 14, CENTER_OFFSET: 7 });

  // Generate walls with metro neon accents
  generateWalls(addVoxel, { WALL_HEIGHT: 5, CENTER_OFFSET: 7 });

  // Colorful bookshelf structures - the main feature
  createColorfulBookshelf(addVoxel, -6, 1, -1); // Left bookshelf
  createColorfulBookshelf(addVoxel, 6, 1, -1);  // Right bookshelf
  createColorfulBookshelf(addVoxel, -6, 1, 3);  // Back left
  createColorfulBookshelf(addVoxel, 6, 1, 3);   // Back right

  // Metro-style study pods
  createMetroStudyPod(addVoxel, 0, 1, -3);
  createMetroStudyPod(addVoxel, -2, 1, 1);
  createMetroStudyPod(addVoxel, 2, 1, 1);

  // 1980s metro lighting fixtures
  createMetroLightFixture(addVoxel, -4, 5, -4);
  createMetroLightFixture(addVoxel, 4, 5, -4);
  createMetroLightFixture(addVoxel, -4, 5, 4);
  createMetroLightFixture(addVoxel, 4, 5, 4);

  // Neon accent borders around the platform
  createNeonBorder(addVoxel, 0, 0.1, 0);

  return voxels;
}

/**
 * Create a colorful 1980s metro bookshelf with vibrant books
 */
function createColorfulBookshelf(addVoxel: VoxelAdder, x: number, y: number, z: number) {
  // Bookshelf frame (metallic chrome)
  for (let height = 0; height < 5; height++) {
    addVoxel([x, y + height, z], RETRO_COLORS.silver, 'metallic');
    addVoxel([x, y + height, z-1], RETRO_COLORS.silver, 'metallic');
  }

  // Shelves (horizontal metallic bars)
  const shelves = [y+1, y+2, y+3, y+4];
  shelves.forEach(shelfY => {
    for (let shelfZ = z-2; shelfZ <= z; shelfZ++) {
      addVoxel([x, shelfY, shelfZ], RETRO_COLORS.silver, 'metallic');
    }
  });

  // Vibrant colorful books - multiple rows and colors
  const bookColors = [
    METRO_COLORS.neonPink, METRO_COLORS.electricBlue, METRO_COLORS.cyberGreen,
    METRO_COLORS.hotOrange, METRO_COLORS.plasmaPurple, METRO_COLORS.retroYellow,
    METRO_COLORS.coralRed, METRO_COLORS.synthMagenta,
    RETRO_COLORS.red, RETRO_COLORS.blue, RETRO_COLORS.yellow, RETRO_COLORS.purple
  ];

  // Books on each shelf
  shelves.forEach((shelfY, shelfIndex) => {
    for (let bookX = x-2; bookX <= x+2; bookX++) {
      if (bookX !== x) { // Leave space for shelf frame
        const colorIndex = (shelfIndex * 3 + Math.abs(bookX - x)) % bookColors.length;
        addVoxel([bookX, shelfY + 0.1, z-1], bookColors[colorIndex], 'standard', 0.1);
        addVoxel([bookX, shelfY + 0.1, z-2], bookColors[(colorIndex + 1) % bookColors.length], 'standard', 0.1);
      }
    }
  });

  // Emissive book spines (glowing highlights)
  addVoxel([x-2, y+2, z-1], METRO_COLORS.electricBlue, 'emissive', 0.3);
  addVoxel([x+2, y+3, z-1], METRO_COLORS.neonPink, 'emissive', 0.3);
  addVoxel([x-1, y+4, z-1], METRO_COLORS.cyberGreen, 'emissive', 0.3);
}

/**
 * Create a metro-style study pod with neon accents
 */
function createMetroStudyPod(addVoxel: VoxelAdder, x: number, y: number, z: number) {
  // Pod base (circular metallic structure)
  for (let angle = 0; angle < 360; angle += 45) {
    const rad = angle * Math.PI / 180;
    const px = x + Math.cos(rad) * 1.5;
    const pz = z + Math.sin(rad) * 1.5;
    addVoxel([Math.round(px), y, Math.round(pz)], RETRO_COLORS.silver, 'metallic');
  }

  // Study surface (elevated)
  for (let px = x-1; px <= x+1; px++) {
    for (let pz = z-1; pz <= z+1; pz++) {
      if (Math.abs(px - x) + Math.abs(pz - z) <= 1) {
        addVoxel([px, y+1, pz], RETRO_COLORS.white, 'glass');
      }
    }
  }

  // Neon accent ring
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = angle * Math.PI / 180;
    const px = x + Math.cos(rad) * 1.8;
    const pz = z + Math.sin(rad) * 1.8;
    addVoxel([Math.round(px), y+1.5, Math.round(pz)], METRO_COLORS.electricBlue, 'emissive', 0.4);
  }
}

/**
 * Create 1980s metro hanging light fixture
 */
function createMetroLightFixture(addVoxel: VoxelAdder, x: number, y: number, z: number) {
  // Hanging chain/base
  for (let height = y-1; height <= y; height++) {
    addVoxel([x, height, z], RETRO_COLORS.darkGray);
  }

  // Light fixture body
  addVoxel([x-1, y, z], RETRO_COLORS.silver, 'metallic');
  addVoxel([x+1, y, z], RETRO_COLORS.silver, 'metallic');
  addVoxel([x, y, z-1], RETRO_COLORS.silver, 'metallic');
  addVoxel([x, y, z+1], RETRO_COLORS.silver, 'metallic');

  // Bright emissive light source
  addVoxel([x, y+1, z], METRO_COLORS.retroYellow, 'emissive', 0.8);
  addVoxel([x, y+2, z], METRO_COLORS.electricBlue, 'emissive', 0.6);
}

/**
 * Create neon border around the platform
 */
function createNeonBorder(addVoxel: VoxelAdder, centerX: number, y: number, centerZ: number) {
  const radius = 7.5;
  const neonColors = [METRO_COLORS.neonPink, METRO_COLORS.electricBlue, METRO_COLORS.cyberGreen, METRO_COLORS.hotOrange];

  for (let angle = 0; angle < 360; angle += 15) {
    const rad = angle * Math.PI / 180;
    const x = centerX + Math.cos(rad) * radius;
    const z = centerZ + Math.sin(rad) * radius;
    const colorIndex = Math.floor(angle / 90) % neonColors.length;
    addVoxel([Math.round(x), y, Math.round(z)], neonColors[colorIndex], 'emissive', 0.5);
  }
}

interface TimelineMilestoneProps {
  position: [number, number, number];
  year: string;
  title: string;
  color: string;
  onClick?: () => void;
}

function TimelineMilestone({ position, year, title, color, onClick }: TimelineMilestoneProps) {
  const milestoneRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (milestoneRef.current) {
      const time = state.clock.getElapsedTime();
      milestoneRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      milestoneRef.current.position.y = position[1] + Math.sin(time * 2) * 0.05;
    }
  });

  return (
    <group
      ref={milestoneRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Milestone base */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Milestone pillar */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1.6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Year indicator */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {year}
      </Text>

      {/* Title */}
      <Text
        position={[0, 1.6, 0]}
        fontSize={0.1}
        color={color}
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {title}
      </Text>

      {/* Hover indicator */}
      {hovered && (
        <mesh position={[0, 2.2, 0]}>
          <ringGeometry args={[0.2, 0.3, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Floating particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 1,
            Math.random() * 2 + 0.5,
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

export function EducationZone() {
  const performanceMetrics = usePerformanceMonitor();

  // Adapt global performance metrics to component needs
  const particleCount = performanceMetrics.fps < 30 ? 3 : performanceMetrics.fps < 50 ? 5 : 8;
  const enableAdvancedEffects = performanceMetrics.fps >= 40;
  const renderQuality = performanceMetrics.quality;

  const zoneRef = React.useRef<THREE.Group>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);

  const voxels = useMemo(() => createEducationZoneVoxels(), []);

  // Educational milestones data
  const milestones = [
    {
      year: "2019",
      title: "Began CS Journey",
      description: "Started Computer Science undergraduate program at Seoul National University, building strong foundations in algorithms, data structures, and software engineering.",
      position: [-4, 1, -6] as [number, number, number],
      color: METRO_COLORS.electricBlue
    },
    {
      year: "2021",
      title: "AI Research Start",
      description: "Began research in machine learning applications, focusing on healthcare and medical data analysis. First publications in clinical ML.",
      position: [-2, 1, -6] as [number, number, number],
      color: METRO_COLORS.cyberGreen
    },
    {
      year: "2023",
      title: "Seoul National Grad",
      description: "Graduated with honors from Seoul National University. Strong foundation in CS fundamentals and initial research experience.",
      position: [0, 1, -6] as [number, number, number],
      color: METRO_COLORS.neonPink
    },
    {
      year: "2024",
      title: "Cornell BA/MS Program",
      description: "Started BA/MS in Computer Science at Cornell University. Advanced AI/ML coursework and healthcare research focus.",
      position: [2, 1, -6] as [number, number, number],
      color: METRO_COLORS.hotOrange
    },
    {
      year: "2025",
      title: "Finishing Cornell BA/MS",
      description: "Finishing up BS/MS program at Cornell University with advanced research in healthcare AI, multiple publications, and production ML systems experience.",
      position: [4, 1, -6] as [number, number, number],
      color: METRO_COLORS.plasmaPurple
    }
  ];

  return (
    <HoverEffect glowColor="#B31B1B" glowIntensity={0.4} scaleMultiplier={1.02}>
      <group ref={zoneRef} position={[15, 0, -15]}>
        <VoxelStructure voxels={voxels} />

        {/* Zone lighting */}
        <ZoneLighting
          position={[15, 0, -15]}
          primaryAccentColor={METRO_COLORS.electricBlue}
          secondaryAccentColor={METRO_COLORS.neonPink}
        />

        {/* Academic Journey Title */}
        <PerformanceText
          position={[0, 9, -8]}
          fontSize={1.2}
          renderQuality={renderQuality}
          color={CORNELL_RED}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor={METRO_COLORS.electricBlue}
        >
          EDUCATION
        </PerformanceText>

        <PerformanceText
          position={[0, 7.5, -8]}
          fontSize={0.8}
          renderQuality={renderQuality}
          color={METRO_COLORS.retroYellow}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor={METRO_COLORS.neonPink}
        >
          JOURNEY
        </PerformanceText>

        <PerformanceText
          position={[0, 6, -8]}
          fontSize={0.4}
          renderQuality={renderQuality}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          📚 From Seoul to Cornell
        </PerformanceText>

        {/* Performance-aware particle atmosphere */}
        {enableAdvancedEffects && (
          <>
            <ParticleField
              count={Math.floor(particleCount)}
              position={[0, 3, 0]}
              color={METRO_COLORS.electricBlue}
              size={0.015}
              speed={0.05}
              spread={8}
              physics="floating"
            />

            <ParticleField
              count={Math.floor(particleCount * 0.7)}
              position={[-4, 4, 0]}
              color={METRO_COLORS.cyberGreen}
              size={0.008}
              speed={0.06}
              spread={4}
              physics="floating"
            />

            <ParticleField
              count={Math.floor(particleCount * 0.7)}
              position={[4, 4, 0]}
              color={METRO_COLORS.neonPink}
              size={0.008}
              speed={0.06}
              spread={4}
              physics="floating"
            />
          </>
        )}

        <InfoWaypoint
          position={[18, 2, -18]}
          title="Undergraduate Excellence"
          content="B.S. in Computer Science from Seoul National University (2019-2023). Strong foundation in algorithms, data structures, and software engineering. Graduated with honors, focusing on AI and machine learning fundamentals."
          icon="🎓"
          color={METRO_COLORS.electricBlue}
          zoneType="education"
        />

        <InfoWaypoint
          position={[12, 2, -18]}
          title="Graduate Studies at Cornell"
          content="BA/MS in Artificial Intelligence at Cornell University (2024-2025). Advanced coursework in Deep Learning, Computer Vision, Natural Language Processing, and AI ethics. Research focus on healthcare applications and human-AI interaction."
          icon="🔬"
          color={METRO_COLORS.cyberGreen}
          zoneType="education"
        />

        <InfoWaypoint
          position={[15, 2, -18]}
          title="Healthcare AI Research"
          content="Specializing in medical image analysis, clinical decision support systems, and healthcare ML applications. Research explores the intersection of AI and medicine, focusing on ethical AI deployment and improving patient outcomes."
          icon="🏥"
          color={METRO_COLORS.neonPink}
          zoneType="education"
        />

        <InfoWaypoint
          position={[21, 2, -18]}
          title="Technical Foundation"
          content="Expertise in PyTorch, TensorFlow, OpenCV, and modern ML frameworks. Strong background in statistical analysis, experimental design, and production ML system deployment. Passionate about building AI that solves real healthcare challenges."
          icon="⚡"
          color={METRO_COLORS.hotOrange}
          zoneType="education"
        />

        {/* Interactive Education Timeline */}
        <Text
          position={[0, 0.5, -4]}
          fontSize={0.3}
          color={METRO_COLORS.retroYellow}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          🎓 Educational Journey Timeline
        </Text>

        {/* Timeline base line */}
        <mesh position={[0, 0.8, -6]}>
          <boxGeometry args={[9, 0.05, 0.05]} />
          <meshStandardMaterial
            color={METRO_COLORS.electricBlue}
            emissive={METRO_COLORS.electricBlue}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Timeline milestones */}
        {milestones.map((milestone) => (
          <TimelineMilestone
            key={milestone.year}
            position={milestone.position}
            year={milestone.year}
            title={milestone.title}
            color={milestone.color}
            onClick={() => setSelectedMilestone(milestone)}
          />
        ))}

        {/* Milestone details modal */}
        {selectedMilestone && (
          <Html position={[0, 3, -4]} center>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-md text-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-blue-400">{selectedMilestone.year}</h3>
                  <h4 className="text-md font-semibold text-white">{selectedMilestone.title}</h4>
                </div>
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {selectedMilestone.description}
              </p>
            </div>
          </Html>
        )}

        {/* Performance-aware timeline particles */}
        {enableAdvancedEffects && (
          <ParticleField
            count={Math.floor(particleCount * 1.5)}
            position={[0, 2, -6]}
            color={METRO_COLORS.electricBlue}
            size={0.01}
            speed={0.03}
            spread={10}
          />
        )}
      </group>
    </HoverEffect>
  );
}