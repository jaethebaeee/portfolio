import React, { useMemo, useRef, useState } from 'react';
import { VoxelStructure } from '../models/VoxelBuilder';
import { RETRO_COLORS } from '../constants/colors';
import { Text } from '@react-three/drei';
import { ProjectBooth } from '../ProjectBooth';
import { FloatingProjectCard } from '../FloatingProjectCard';
import { TechStackVisualization } from '../TechStackVisualization';
import { ParticleField } from '../Effects/ParticleField';
import { InfoWaypoint } from '../InfoWaypoint';
import { HoverEffect } from '../HoverEffect';
import { ProjectDetailsModal } from '../../UI/ProjectDetailsModal';
import { projects } from '@/data/projects';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { VoxelAdder } from './voxelHelpers';
import { Project } from '@/data/projects';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { PerformanceText } from '../PerformanceText';
import { ZoneLighting } from '../ZoneLighting';

// Type definitions for voxel data
type VoxelData = {
  pos: [number, number, number];
  color: string;
  materialType?: 'standard' | 'metallic' | 'emissive' | 'glass' | 'animated';
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
};

// Pavilion configuration
type PavilionConfig = {
  name: string;
  color: string;
  position: [number, number, number];
  size: [number, number, number]; // width, height, depth
  category: string;
  icon: string;
};

// Pavilion configurations for different project categories
const PAVILION_CONFIGS: PavilionConfig[] = [
  {
    name: 'AI & Healthcare',
    color: '#ff6b6b',
    position: [-12, 0, -8],
    size: [8, 6, 8],
    category: 'ai-ml',
    icon: '🏥'
  },
  {
    name: 'Web Innovation',
    color: '#4ecdc4',
    position: [0, 0, -8],
    size: [8, 6, 8],
    category: 'web-dev',
    icon: '💻'
  },
  {
    name: 'Mobile & Full Stack',
    color: '#a78bfa',
    position: [12, 0, -8],
    size: [8, 6, 8],
    category: 'full-stack',
    icon: '📱'
  },
  {
    name: 'Research & Innovation',
    color: '#ffe66d',
    position: [-6, 0, 8],
    size: [8, 6, 8],
    category: 'research',
    icon: '🔬'
  }
];

/**
 * Create a pavilion structure for a specific category
 */
function createPavilionVoxels(config: PavilionConfig): VoxelData[] {
  const voxels: VoxelData[] = [];
  const [width, height, depth] = config.size;
  const [px, py, pz] = config.position;

  const addVoxel: VoxelAdder = (
    position: [number, number, number],
    color: string,
    materialType?: 'standard' | 'metallic' | 'emissive' | 'glass' | 'animated',
    emissiveIntensity?: number,
    metalness?: number,
    roughness?: number
  ) => {
    voxels.push({
      pos: [position[0] + px, position[1] + py, position[2] + pz],
      color,
      materialType,
      emissiveIntensity,
      metalness,
      roughness
    });
  };

  // Enhanced pavilion platform with gradient colors and patterns
  for (let x = -width/2; x <= width/2; x++) {
    for (let z = -depth/2; z <= depth/2; z++) {
      // Create a pattern on the platform
      const isEdge = Math.abs(x) === Math.floor(width/2) || Math.abs(z) === Math.floor(depth/2);
      const isCorner = Math.abs(x) === Math.floor(width/2) && Math.abs(z) === Math.floor(depth/2);

      if (isCorner) {
        addVoxel([x, 0, z], RETRO_COLORS.white, 'emissive', 0.3);
      } else if (isEdge) {
        addVoxel([x, 0, z], config.color, 'metallic', 0.2, 0.7, 0.3);
      } else {
        // Checkerboard pattern in center
        const pattern = (x + z) % 2 === 0;
        addVoxel([x, 0, z], pattern ? config.color : RETRO_COLORS.lightGray, 'standard', 0.1);
      }
    }
  }

  // Enhanced walls with mixed materials and architectural details
  for (let y = 1; y <= height-1; y++) {
    // Front and back walls with alternating glass and metallic panels
    for (let x = -width/2 + 1; x <= width/2 - 1; x++) {
      const materialType = (x + y) % 3 === 0 ? 'glass' : (x + y) % 3 === 1 ? 'metallic' : 'emissive';
      const emissiveIntensity = materialType === 'emissive' ? 0.2 : undefined;
      const metalness = materialType === 'metallic' ? 0.8 : undefined;
      const roughness = materialType === 'metallic' ? 0.2 : undefined;

      addVoxel([x, y, -depth/2], config.color, materialType, emissiveIntensity, metalness, roughness);
      addVoxel([x, y, depth/2], config.color, materialType, emissiveIntensity, metalness, roughness);
    }

    // Side walls with decorative elements
    for (let z = -depth/2 + 1; z <= depth/2 - 1; z++) {
      const materialType = (z + y) % 2 === 0 ? 'glass' : 'metallic';
      const emissiveIntensity = materialType === 'glass' ? undefined : 0.15;
      const metalness = materialType === 'metallic' ? 0.9 : undefined;
      const roughness = materialType === 'metallic' ? 0.1 : undefined;

      addVoxel([-width/2, y, z], config.color, materialType, emissiveIntensity, metalness, roughness);
      addVoxel([width/2, y, z], config.color, materialType, emissiveIntensity, metalness, roughness);
    }
  }

  // Add decorative roof elements
  for (let x = -width/2; x <= width/2; x++) {
    for (let z = -depth/2; z <= depth/2; z++) {
      if (Math.abs(x) <= 1 && Math.abs(z) <= 1) {
        addVoxel([x, height, z], RETRO_COLORS.white, 'emissive', 0.4);
      }
    }
  }

  // Enhanced corner pillars with mixed materials and decorative elements
  const corners = [
    [-width/2, -depth/2], [width/2, -depth/2],
    [-width/2, depth/2], [width/2, depth/2]
  ];

  corners.forEach(([cx, cz]) => {
    for (let y = 1; y <= height; y++) {
      // Base pillar material alternates
      const baseMaterial = y % 2 === 0 ? 'metallic' : 'emissive';
      const emissiveIntensity = baseMaterial === 'emissive' ? 0.4 : 0.1;
      const metalness = baseMaterial === 'metallic' ? 0.9 : 0.1;
      const roughness = baseMaterial === 'metallic' ? 0.1 : 0.8;

      addVoxel([cx, y, cz], config.color, baseMaterial, emissiveIntensity, metalness, roughness);

      // Add decorative side elements every other level
      if (y % 2 === 0 && y < height) {
        const offsetX = cx > 0 ? 0.5 : -0.5;
        const offsetZ = cz > 0 ? 0.5 : -0.5;
        addVoxel([cx + offsetX, y, cz], RETRO_COLORS.white, 'emissive', 0.6);
        addVoxel([cx, y, cz + offsetZ], RETRO_COLORS.white, 'emissive', 0.6);
      }
    }

    // Pillar cap
    addVoxel([cx, height + 1, cz], RETRO_COLORS.white, 'emissive', 0.8);
  });

  // Enhanced central display pedestal with holographic effect
  for (let y = 1; y <= 4; y++) {
    // Main pedestal structure
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        if (Math.abs(x) + Math.abs(z) <= 1) { // Diamond shape
          const materialType = y === 4 ? 'emissive' : 'metallic';
          const emissiveIntensity = materialType === 'emissive' ? 0.6 : 0.1;
          const metalness = 0.9;
          const roughness = 0.1;

          addVoxel([x, y, z], RETRO_COLORS.white, materialType, emissiveIntensity, metalness, roughness);
        }
      }
    }

    // Add holographic rings around the pedestal
    if (y >= 2 && y <= 3) {
      const ringRadius = y === 2 ? 2 : 2.5;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
        const x = Math.cos(angle) * ringRadius;
        const z = Math.sin(angle) * ringRadius;
        addVoxel([Math.round(x), y, Math.round(z)], config.color, 'emissive', 0.3);
      }
    }
  }

  return voxels;
}

/**
 * Create the central plaza and pathways
 */
function createCampusPlazaVoxels(): VoxelData[] {
  const voxels: VoxelData[] = [];

  const addVoxel: VoxelAdder = (
    position: [number, number, number],
    color: string,
    materialType?: 'standard' | 'metallic' | 'emissive' | 'glass' | 'animated',
    emissiveIntensity?: number,
    metalness?: number,
    roughness?: number
  ) => {
    voxels.push({
      pos: position,
      color,
      materialType,
      emissiveIntensity,
      metalness,
      roughness
    });
  };

  // Central plaza (larger area)
  for (let x = -20; x <= 20; x++) {
    for (let z = -15; z <= 15; z++) {
      addVoxel([x, 0, z], RETRO_COLORS.stone);
    }
  }

  // Pathways connecting pavilions
  const pathways = [
    // Horizontal pathways
    { start: [-20, -8], end: [20, -8], width: 3 },
    { start: [-20, 8], end: [20, 8], width: 3 },
    // Vertical pathways
    { start: [-12, -15], end: [-12, 15], width: 3 },
    { start: [0, -15], end: [0, 15], width: 3 },
    { start: [12, -15], end: [12, 15], width: 3 },
  ];

  pathways.forEach(({ start, end, width }) => {
    const [x1, z1] = start;
    const [x2, z2] = end;

    if (x1 === x2) { // Vertical pathway
      for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) {
        for (let x = x1 - Math.floor(width/2); x <= x1 + Math.floor(width/2); x++) {
          addVoxel([x, 0.1, z], RETRO_COLORS.lightGray, 'standard', 0.05);
        }
      }
    } else { // Horizontal pathway
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        for (let z = z1 - Math.floor(width/2); z <= z1 + Math.floor(width/2); z++) {
          addVoxel([x, 0.1, z], RETRO_COLORS.lightGray, 'standard', 0.05);
        }
      }
    }
  });

  // Central monument/fountain
  for (let y = 1; y <= 4; y++) {
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (Math.abs(x) + Math.abs(z) <= 3) {
          addVoxel([x, y, z], RETRO_COLORS.neonBlue, 'glass');
        }
      }
    }
  }

  return voxels;
}

/**
 * Individual Pavilion component with projects
 */
function ProjectPavilion({ config, onProjectClick }: { config: PavilionConfig; onProjectClick: (_project: Project) => void }) {
  const pavilionRef = useRef<Group>(null);
  const pavilionVoxels = useMemo(() => createPavilionVoxels(config), [config]);

  // Get projects for this category - show more projects with carousel
  const categoryProjects = useMemo(() => {
    return projects.filter(p => p.category === config.category);
  }, [config.category]);

  // State for carousel rotation
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  // Auto-rotate through projects
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (categoryProjects.length > 3) {
      const newIndex = Math.floor(time / 8) % categoryProjects.length; // Change every 8 seconds
      if (newIndex !== currentProjectIndex) {
        setCurrentProjectIndex(newIndex);
      }
    }
  });

  // Get visible projects (up to 3, cycling through all)
  const visibleProjects = useMemo(() => {
    if (categoryProjects.length <= 3) return categoryProjects;
    const start = currentProjectIndex;
    const result = [];
    for (let i = 0; i < 3; i++) {
      result.push(categoryProjects[(start + i) % categoryProjects.length]);
    }
    return result;
  }, [categoryProjects, currentProjectIndex]);

  // Animation
  useFrame((state) => {
    if (pavilionRef.current) {
      const time = state.clock.getElapsedTime();
      pavilionRef.current.position.y = Math.sin(time * 0.5 + config.position[0]) * 0.02;
    }
  });

  return (
    <group ref={pavilionRef}>
      <VoxelStructure voxels={pavilionVoxels} />

      {/* Pavilion name */}
      <Text
        position={[config.position[0], config.position[1] + 8, config.position[2]]}
        fontSize={0.4}
        color={RETRO_COLORS.white}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor={config.color}
      >
        {config.name}
      </Text>

      {/* Category icon */}
      <Text
        position={[config.position[0], config.position[1] + 6.5, config.position[2]]}
        fontSize={0.8}
        color={config.color}
        anchorX="center"
        anchorY="middle"
      >
        {config.icon}
      </Text>

      {/* Project booths in pavilion with carousel */}
      {visibleProjects.map((project, index) => {
        const positions = [
          [config.position[0] - 2.5, config.position[1] + 1, config.position[2] - 2.5],
          [config.position[0] + 2.5, config.position[1] + 1, config.position[2] - 2.5],
          [config.position[0], config.position[1] + 1, config.position[2] + 3],
        ] as [number, number, number][];

        return (
          <ProjectBooth
            key={`${project.id}-${currentProjectIndex}`}
            position={positions[index] || positions[0]}
            project={project}
            onClick={onProjectClick}
          />
        );
      })}

      {/* Project carousel indicator */}
      {categoryProjects.length > 3 && (
        <group position={[config.position[0], config.position[1] + 4.5, config.position[2]]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.15}
            color="#4ecdc4"
            anchorX="center"
            anchorY="middle"
          >
            {currentProjectIndex + 1} / {categoryProjects.length}
          </Text>
          {/* Progress dots */}
          {Array.from({ length: Math.min(categoryProjects.length, 8) }).map((_, i) => (
            <mesh key={i} position={[(i - 3.5) * 0.2, -0.3, 0]}>
              <sphereGeometry args={[0.03, 6, 4]} />
              <meshStandardMaterial
                color={i === (currentProjectIndex % Math.min(categoryProjects.length, 8)) ? "#4ecdc4" : "#666"}
                emissive={i === (currentProjectIndex % Math.min(categoryProjects.length, 8)) ? "#4ecdc4" : "#000"}
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Floating project cards orbiting the pavilion */}
      {categoryProjects.slice(0, 4).map((project, index) => (
        <FloatingProjectCard
          key={`floating-${project.id}`}
          position={[config.position[0], config.position[1] + 3, config.position[2]]}
          project={project}
          orbitRadius={6 + index * 1.5}
          orbitSpeed={0.3 + index * 0.1}
          floatHeight={2 + index * 0.5}
        />
      ))}

      {/* Tech Stack Visualization above pavilion */}
      <TechStackVisualization
        technologies={categoryProjects.flatMap(p => p.technologies)}
        position={[config.position[0], config.position[1] + 6, config.position[2]]}
        radius={2.5}
        height={3}
      />

      {/* Pavilion-specific lighting */}
      <spotLight
        position={[config.position[0], config.position[1] + 10, config.position[2]]}
        target-position={[config.position[0], config.position[1] + 2, config.position[2]]}
        color={config.color}
        intensity={1.5}
        angle={0.8}
        penumbra={0.5}
        distance={15}
      />

      {/* Enhanced pavilion particle effects */}
      <ParticleField
        count={5}
        position={[config.position[0], config.position[1] + 4, config.position[2]]}
        color={config.color}
        size={0.015}
        speed={0.05}
        spread={6}
      />

      {/* Additional atmospheric particles */}
      <ParticleField
        count={8}
        position={[config.position[0], config.position[1] + 2, config.position[2]]}
        color="#ffffff"
        size={0.008}
        speed={0.08}
        spread={8}
        physics="floating"
      />
    </group>
  );
}

/**
 * Tech Innovation Campus - central plaza and pavilions
 */
function TechInnovationCampus({ onProjectClick }: { onProjectClick: (_project: Project) => void }) {
  const plazaVoxels = useMemo(() => createCampusPlazaVoxels(), []);

  return (
    <group>
      {/* Central plaza */}
      <VoxelStructure voxels={plazaVoxels} />

      {/* Category pavilions */}
      {PAVILION_CONFIGS.map((config) => (
        <ProjectPavilion key={config.category} config={config} onProjectClick={onProjectClick} />
      ))}

      {/* Central monument with optimized particle fountain */}
      <group position={[0, 0, 0]}>
        <ParticleField
          count={6}
          position={[0, 6, 0]}
          color="#4ecdc4"
          size={0.018}
          speed={0.06}
          spread={3}
        />

        <ParticleField
          count={10}
          position={[0, 6, 0]}
          color="#ffe66d"
          size={0.01}
          speed={0.12}
          spread={2}
        />
      </group>

      {/* Campus perimeter lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[0, 20, 0]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Additional spotlights for drama */}
      <spotLight
        position={[-15, 15, -10]}
        color="#ff6b6b"
        intensity={1}
        angle={0.6}
        penumbra={0.5}
        distance={25}
      />

      <spotLight
        position={[15, 15, 10]}
        color="#4ecdc4"
        intensity={1}
        angle={0.6}
        penumbra={0.5}
        distance={25}
      />
    </group>
  );
}

export const ProjectsZone = React.memo(function ProjectsZone() {
  const performanceMetrics = usePerformanceMonitor();

  // Adapt global performance metrics to component needs
  const particleCount = performanceMetrics.fps < 30 ? 2 : performanceMetrics.fps < 50 ? 3 : 4;
  const enableAdvancedEffects = performanceMetrics.fps >= 40;
  const renderQuality = performanceMetrics.quality;

  const zoneRef = useRef<Group>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal handlers
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  // Smooth zone-wide animation
  useFrame((state) => {
    if (zoneRef.current) {
      const time = state.clock.getElapsedTime();
      zoneRef.current.position.y = Math.sin(time * 0.2) * 0.03;
      zoneRef.current.rotation.y = Math.sin(time * 0.1) * 0.01;
    }
  });

  const totalProjects = projects.length;

  return (
    <HoverEffect glowColor="#4ecdc4" glowIntensity={0.3} scaleMultiplier={1.005}>
      <group ref={zoneRef} position={[-15, 0, 0]}>
        {/* Tech Innovation Campus */}
        <TechInnovationCampus onProjectClick={handleProjectClick} />

        {/* Zone lighting */}
        <ZoneLighting
          position={[-15, 0, 0]}
          primaryAccentColor="#4ecdc4"
          secondaryAccentColor="#a78bfa"
        />

        {/* Main zone header */}
        <PerformanceText
          position={[0, 12, 0]}
          fontSize={0.9}
          renderQuality={renderQuality}
          color={RETRO_COLORS.white}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#4ecdc4"
        >
          TECH INNOVATION CAMPUS
        </PerformanceText>

        <PerformanceText
          position={[0, 10.5, 0]}
          fontSize={0.3}
          renderQuality={renderQuality}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor={RETRO_COLORS.white}
        >
          Portfolio of Innovation
        </PerformanceText>

        {/* Project statistics */}
        <group position={[0, 1, -18]}>
          <mesh>
            <boxGeometry args={[4, 1.5, 0.3]} />
            <meshStandardMaterial
              color="#1a1a2e"
              transparent
              opacity={0.9}
              metalness={0.1}
              roughness={0.8}
            />
          </mesh>
          <Text
            position={[0, 0.2, 0.2]}
            fontSize={0.3}
            color="#4ecdc4"
            anchorX="center"
            anchorY="middle"
          >
            {totalProjects} Projects
          </Text>
          <Text
            position={[0, -0.3, 0.2]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Across 4 Innovation Hubs
          </Text>
        </group>

        {/* Enhanced navigation waypoints */}
        <InfoWaypoint
          position={[-22, 2, -8]}
          title="🏥 AI & Healthcare Pavilion"
          content="Explore ML solutions for healthcare, clinical decision support, and medical NLP systems. Featured: Healthcare ML Platform, Clinical NLP Engine."
          icon="🏥"
          color="#ff6b6b"
          zoneType="projects"
        />

        <InfoWaypoint
          position={[-8, 2, -8]}
          title="💻 Web Innovation Pavilion"
          content="Cutting-edge web applications and 3D experiences. Featured: This interactive portfolio, advanced web technologies showcase."
          icon="💻"
          color="#4ecdc4"
          zoneType="projects"
        />

        <InfoWaypoint
          position={[8, 2, -8]}
          title="📱 Full Stack & Mobile Pavilion"
          content="Complete product development from mobile apps to enterprise platforms. Featured: E-commerce platform, GroupBuy mobile app."
          icon="📱"
          color="#a78bfa"
          zoneType="projects"
        />

        <InfoWaypoint
          position={[-2, 2, 8]}
          title="🔬 Research & Innovation Pavilion"
          content="Academic research pushing technological boundaries. Featured: Real-time biosensor analytics, wearable device research."
          icon="🔬"
          color="#ffe66d"
          zoneType="projects"
        />

        {/* Campus exploration tips */}
        <InfoWaypoint
          position={[22, 2, 0]}
          title="🎯 Campus Navigation"
          content="Each pavilion showcases 3 featured projects from its category. Walk between pavilions to explore different areas of expertise and innovation."
          icon="🚶"
          color="#4ecdc4"
          zoneType="projects"
        />

        <InfoWaypoint
          position={[-22, 2, 8]}
          title="💡 Interactive Experience"
          content="Projects are displayed as interactive booths with detailed information. Press E near any project to learn more about the technology and impact."
          icon="💡"
          color="#ffe66d"
          zoneType="projects"
        />

        {/* Performance-aware particle atmosphere */}
        {enableAdvancedEffects && particleCount > 0 && (
          <>
            <ParticleField
              count={Math.max(3, Math.floor(particleCount * 0.8))}
              position={[0, 8, 0]}
              color="#4ecdc4"
              size={0.012}
              speed={0.04}
              spread={25}
            />

            <ParticleField
              count={Math.max(2, Math.floor(particleCount * 0.6))}
              position={[0, 6, 0]}
              color="#ffe66d"
              size={0.008}
              speed={0.06}
              spread={20}
            />
          </>
        )}

        {/* Atmospheric fog for depth */}
        <fog attach="fog" args={['#1a1a2e', 15, 60]} />
      </group>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </HoverEffect>
  );
});

/**
 * Create a pavilion structure for a specific category
 */
