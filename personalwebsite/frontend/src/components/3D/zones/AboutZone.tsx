import React, { useMemo } from 'react';
import { VoxelStructure, type MaterialType } from '../models/VoxelBuilder';
import { Text } from '@react-three/drei';
import { InfoWaypoint } from '../InfoWaypoint';
import { HoverEffect } from '../HoverEffect';
import { ParticleField } from '../Effects/ParticleField';
import { INFO_WAYPOINTS } from './constants/aboutWaypoints';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { RETRO_COLORS } from '../constants/colors';
import { VoxelAdder } from './voxelHelpers';
import { ZoneLighting } from '../ZoneLighting';
import { PerformanceText } from '../PerformanceText';

// Cyberpunk color mapping using global RETRO_COLORS palette
const CYBERPUNK_COLORS = {
  neonPink: RETRO_COLORS.hotPink,
  electricBlue: RETRO_COLORS.neonBlue,
  cyberGreen: RETRO_COLORS.electricGreen,
  hotOrange: RETRO_COLORS.cyberOrange,
  plasmaPurple: RETRO_COLORS.plasmaPurple,
  retroYellow: RETRO_COLORS.cyberYellow
} as const;



// Configuration constants to avoid magic numbers
const ZONE_CONFIG = {
  MAX_WAYPOINTS: 6,
  PLATFORM_SIZE: 14,
  CENTER_OFFSET: 7,
  WALL_HEIGHT: 6,
  GLOW_INTENSITY: 0.4,
  SCALE_MULTIPLIER: 1.02,
  DEFAULT_PARTICLE_COUNT: 4,
  // Enhanced visual settings
  AMBIENT_LIGHT_INTENSITY: 0.4,
  DIRECTIONAL_LIGHT_INTENSITY: 0.6,
  FOG_NEAR: 35,
  FOG_FAR: 200
} as const;


// Utility function to safely get waypoint colors
const getWaypointColor = (index: number): string => {
  const colors = [
    CYBERPUNK_COLORS.neonPink,
    CYBERPUNK_COLORS.electricBlue,
    CYBERPUNK_COLORS.cyberGreen,
    CYBERPUNK_COLORS.hotOrange,
    CYBERPUNK_COLORS.plasmaPurple,
    CYBERPUNK_COLORS.retroYellow
  ];
  return colors[index] ?? colors[0];
};



/**
 * Helper function to create an optimized voxel structure for the About zone house
 * Enhanced with better error handling and configuration
 */

export const AboutZone = React.memo(function AboutZone() {
  const performanceMetrics = usePerformanceMonitor();

  // Adapt global performance metrics to component needs
  const particleCount = performanceMetrics.fps < 30 ? 2 : performanceMetrics.fps < 50 ? 3 : ZONE_CONFIG.DEFAULT_PARTICLE_COUNT;
  const enableAdvancedEffects = performanceMetrics.fps >= 40;
  const renderQuality = performanceMetrics.quality;

  const performanceConfig = { particleCount, enableAdvancedEffects, renderQuality };

  // Enhanced cyberpunk building generation
  const voxels = useMemo(() => {
    const buildingVoxels: Array<{
      pos: [number, number, number];
      color: string;
      materialType?: MaterialType;
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
      buildingVoxels.push({
        pos: position,
        color,
        materialType,
        emissiveIntensity,
        metalness,
        roughness
      });
    };

    // Building dimensions
    const width = 8;
    const depth = 6;
    const height = 12;

    // Base platform
    for (let x = -width/2; x <= width/2; x++) {
      for (let z = -depth/2; z <= depth/2; z++) {
        const isEdge = Math.abs(x) === Math.floor(width/2) || Math.abs(z) === Math.floor(depth/2);
        if (isEdge) {
          addVoxel([x, 0, z], CYBERPUNK_COLORS.neonPink, 'emissive', 0.3);
        } else {
          addVoxel([x, 0, z], RETRO_COLORS.stone, 'standard', 0.1);
        }
      }
    }

    // Main building walls - cyberpunk style with mixed materials
    for (let y = 1; y <= height; y++) {
      for (let x = -width/2; x <= width/2; x++) {
        for (let z = -depth/2; z <= depth/2; z++) {
          // Only build walls on perimeter
          const isFrontWall = z === -depth/2;
          const isBackWall = z === depth/2;
          const isLeftWall = x === -width/2;
          const isRightWall = x === width/2;

          if (isFrontWall || isBackWall || isLeftWall || isRightWall) {
            // Create windows and panels pattern
            const pattern = (x + z + y) % 4;
            let materialType: 'standard' | 'metallic' | 'emissive' | 'glass' = 'standard';
            let emissiveIntensity = 0.1;

            if (pattern === 0) {
              materialType = 'glass';
            } else if (pattern === 1) {
              materialType = 'metallic';
            } else if (pattern === 2) {
              materialType = 'emissive';
              emissiveIntensity = 0.4;
            }

            addVoxel([x, y, z], CYBERPUNK_COLORS.electricBlue, materialType, emissiveIntensity);
          }
        }
      }
    }

    // Building interior floors every 3 levels
    for (let y = 3; y <= height; y += 3) {
      for (let x = -width/2 + 1; x <= width/2 - 1; x++) {
        for (let z = -depth/2 + 1; z <= depth/2 - 1; z++) {
          if ((x + z) % 2 === 0) {
            addVoxel([x, y, z], RETRO_COLORS.lightGray, 'metallic', 0.2, 0.8, 0.2);
          }
        }
      }
    }

    // Central core/elevator shaft
    for (let y = 1; y <= height; y++) {
      for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
          if (Math.abs(x) + Math.abs(z) === 2) { // Corners only
            addVoxel([x, y, z], CYBERPUNK_COLORS.cyberGreen, 'emissive', 0.6);
          }
        }
      }
    }

    // Roof structure
    for (let x = -width/2; x <= width/2; x++) {
      for (let z = -depth/2; z <= depth/2; z++) {
        const isEdge = Math.abs(x) === Math.floor(width/2) || Math.abs(z) === Math.floor(depth/2);
        if (isEdge) {
          addVoxel([x, height + 1, z], CYBERPUNK_COLORS.plasmaPurple, 'emissive', 0.5);
        }
      }
    }

    // Central antenna/spire
    for (let y = height + 1; y <= height + 4; y++) {
      addVoxel([0, y, 0], CYBERPUNK_COLORS.retroYellow, 'emissive', 0.8);
    }

    // Decorative neon signs on building
    // Front sign: "JAE"
    const signY = height - 2;
    addVoxel([-1, signY, -depth/2], CYBERPUNK_COLORS.neonPink, 'emissive', 1.0);
    addVoxel([0, signY, -depth/2], CYBERPUNK_COLORS.neonPink, 'emissive', 1.0);
    addVoxel([1, signY, -depth/2], CYBERPUNK_COLORS.neonPink, 'emissive', 1.0);

    // Side decorative elements
    for (let y = 2; y <= height; y += 2) {
      addVoxel([-width/2, y, 0], CYBERPUNK_COLORS.hotOrange, 'emissive', 0.4);
      addVoxel([width/2, y, 0], CYBERPUNK_COLORS.hotOrange, 'emissive', 0.4);
    }

    return buildingVoxels;
  }, []);

  // Memoized waypoint processing for better performance
  const waypoints = useMemo(() =>
    INFO_WAYPOINTS.slice(0, ZONE_CONFIG.MAX_WAYPOINTS).map((point, index) => ({
      ...point,
      color: getWaypointColor(index)
    })), []
  );

  return (
    <HoverEffect
      glowColor="#ff1493"
      glowIntensity={ZONE_CONFIG.GLOW_INTENSITY}
      scaleMultiplier={ZONE_CONFIG.SCALE_MULTIPLIER}
    >
      <group position={[-15, 0, -15]}>
        <VoxelStructure voxels={voxels} />

        {/* Performance-aware text rendering */}
        <PerformanceText
          position={[0, 8, -1]}
          fontSize={1.5}
          renderQuality={performanceConfig.renderQuality}
          color={CYBERPUNK_COLORS.neonPink}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor={CYBERPUNK_COLORS.electricBlue}
        >
          ABOUT JAE
        </PerformanceText>

        {/* Subtitle */}
        <Text
          position={[0, 6.5, -1]}
          fontSize={performanceConfig.renderQuality === 'low' ? 0.7 : 0.9}
          color={CYBERPUNK_COLORS.cyberGreen}
          anchorX="center"
          anchorY="middle"
        >
          Learn More About Jae
        </Text>

        {/* Welcome message with cyberpunk flair */}
        <PerformanceText
          position={[0, 5.2, -1]}
          fontSize={0.35}
          renderQuality={performanceConfig.renderQuality}
          color={CYBERPUNK_COLORS.plasmaPurple}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor={CYBERPUNK_COLORS.retroYellow}
        >
          『 AI Engineer • Healthcare ML • Computer Vision 』
        </PerformanceText>

        {/* Personal background story */}
        <PerformanceText
          position={[0, 3.5, -1]}
          fontSize={0.25}
          renderQuality={performanceConfig.renderQuality}
          color={CYBERPUNK_COLORS.neonPink}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor={CYBERPUNK_COLORS.electricBlue}
        >
          Before this I was...
        </PerformanceText>

        <PerformanceText
          position={[0, 2.8, -1]}
          fontSize={0.18}
          renderQuality={performanceConfig.renderQuality}
          color={CYBERPUNK_COLORS.cyberGreen}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor={CYBERPUNK_COLORS.plasmaPurple}
        >
          🍎 building an agentic Siri planner powered by Apple Intelligence
        </PerformanceText>

        <PerformanceText
          position={[0, 2.1, -1]}
          fontSize={0.18}
          renderQuality={performanceConfig.renderQuality}
          color={CYBERPUNK_COLORS.hotOrange}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor={CYBERPUNK_COLORS.retroYellow}
        >
          🎓 finishing my BS/MS at Cornell
        </PerformanceText>

        <PerformanceText
          position={[0, 1.4, -1]}
          fontSize={0.18}
          renderQuality={performanceConfig.renderQuality}
          color={CYBERPUNK_COLORS.plasmaPurple}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor={CYBERPUNK_COLORS.neonPink}
        >
          🐣 being a kid and having fun (I still try to do this)
        </PerformanceText>

        {/* Performance-aware particle effects */}
        {performanceConfig.enableAdvancedEffects && performanceConfig.particleCount > 0 && (
          <ParticleField
            count={performanceConfig.particleCount}
            position={[0, 4, 0]}
            color={CYBERPUNK_COLORS.plasmaPurple}
            size={0.015}
            speed={0.05}
            spread={6}
            physics="floating"
          />
        )}

        {/* Secondary particle effects for higher performance systems */}
        {performanceConfig.enableAdvancedEffects && performanceConfig.renderQuality === 'high' && (
          <>
            <ParticleField
              count={Math.floor(performanceConfig.particleCount * 0.6)}
              position={[-3, 3, -3]}
              color={CYBERPUNK_COLORS.electricBlue}
              size={0.01}
              speed={0.08}
              spread={4}
              physics="floating"
            />

            <ParticleField
              count={Math.floor(performanceConfig.particleCount * 0.4)}
              position={[3, 3, 3]}
              color={CYBERPUNK_COLORS.neonPink}
              size={0.008}
              speed={0.06}
              spread={3}
              physics="floating"
            />
          </>
        )}

        {/* Zone lighting with cyberpunk aesthetic */}
        <ZoneLighting
          position={[-15, 0, -15]}
          primaryAccentColor={CYBERPUNK_COLORS.neonPink}
          secondaryAccentColor={CYBERPUNK_COLORS.cyberGreen}
          enhanced={true}
        />

        {/* Zone-specific atmospheric tint is handled by global fog */}

        {/* Ambient zone illumination for better visibility */}
        <pointLight
          position={[0, 10, 0]}
          color="#ffffff"
          intensity={0.8}
          distance={30}
          decay={2}
        />

        {/* Interactive hover effects for waypoints */}
        {waypoints.map((point, index) => (
          <group key={`waypoint-group-${index}`}>
            <InfoWaypoint
              position={point.position}
              title={point.title}
              content={point.content}
              icon={point.icon}
              color={point.color}
              zoneType="about"
            />

            {/* Subtle waypoint accent lighting */}
            <pointLight
              position={[point.position[0], point.position[1] + 2, point.position[2]]}
              color={point.color}
              intensity={1.0}
              distance={12}
              decay={2}
            />
          </group>
        ))}

        {/* Development debug info */}
        {import.meta.env.DEV && (
          <PerformanceText
            position={[8, 1, 8]}
            fontSize={0.3}
            renderQuality={performanceConfig.renderQuality}
            color="#ffffff"
            anchorX="left"
            anchorY="bottom"
          >
            Quality: {performanceConfig.renderQuality} | Particles: {performanceConfig.particleCount} | FPS: {performanceMetrics.fps}
          </PerformanceText>
        )}
      </group>
    </HoverEffect>
  );
});