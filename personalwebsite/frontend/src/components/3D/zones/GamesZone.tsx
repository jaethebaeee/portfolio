import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { VoxelStructure } from '../models/VoxelBuilder';
import { Text } from '@react-three/drei';
import { ParticleField } from '../Effects/ParticleField';
import { InfoWaypoint } from '../InfoWaypoint';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { VoxelAdder } from './voxelHelpers';
import * as THREE from 'three';

export function GamesZone() {
  const performanceMetrics = usePerformanceMonitor();
  const gamesRef = useRef<THREE.Group>(null);
  // eslint-disable-next-line no-unused-vars
  const [_slotMachineSpinning, _setSlotMachineSpinning] = useState(false);

  // Adapt global performance metrics to component needs
  const particleCount = performanceMetrics.fps < 30 ? 30 : performanceMetrics.fps < 50 ? 45 : 60;
  const enableAdvancedEffects = performanceMetrics.fps >= 40;

  // Create voxel arcade games
  const gamesVoxels = useMemo(() => {
    const voxels: Array<{
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
      voxels.push({
        pos: position,
        color,
        materialType,
        emissiveIntensity,
        metalness,
        roughness
      });
    };

    // Color palette
    const arcadeRed = '#ff0040';
    const arcadeBlue = '#00aaff';
    const arcadeYellow = '#ffff00';
    const arcadeGreen = '#00ff00';
    const arcadePurple = '#aa00ff';
    const arcadeOrange = '#ff8800';
    const metallicGray = '#666666';

    // SLOT MACHINE (center piece)
    // Base structure
    for (let x = -3; x <= 3; x++) {
      for (let z = -2; z <= 2; z++) {
        for (let y = 0; y <= 8; y++) {
          if (Math.abs(x) <= 2 && Math.abs(z) <= 1) {
            addVoxel([x, y, z], metallicGray, 'metallic', 0, 0.8, 0.2);
          }
        }
      }
    }

    // Screen area (dark glass)
    for (let x = -2; x <= 2; x++) {
      for (let z = -1; z <= 1; z++) {
        for (let y = 3; y <= 6; y++) {
          addVoxel([x, y, z], '#000033', 'glass', 0, 0, 0);
        }
      }
    }

    // Slot reels (animated colors)
    const reelColors = [arcadeRed, arcadeYellow, arcadeBlue];
    for (let reel = -1; reel <= 1; reel++) {
      const color = reelColors[(reel + 1) % 3];
      for (let y = 4; y <= 5; y++) {
        addVoxel([reel * 1, y, 0], color, 'emissive', 0.3);
      }
    }

    // Control buttons
    addVoxel([-1, 1, -1], arcadeGreen, 'emissive', 0.5); // Spin button
    addVoxel([0, 1, -1], arcadeRed, 'emissive', 0.5); // Stop button
    addVoxel([1, 1, -1], arcadeBlue, 'emissive', 0.5); // Reset button

    // PINBALL MACHINE (left side)
    // Table base
    for (let x = -8; x <= -4; x++) {
      for (let z = -3; z <= 3; z++) {
        for (let y = 0; y <= 2; y++) {
          addVoxel([x, y, z], metallicGray, 'metallic', 0, 0.8, 0.2);
        }
      }
    }

    // Playfield (green felt)
    for (let x = -7; x <= -5; x++) {
      for (let z = -2; z <= 2; z++) {
        addVoxel([x, 4, z], '#006400', 'standard');
      }
    }

    // Flippers
    addVoxel([-6, 2, -1], arcadeOrange, 'emissive', 0.3);
    addVoxel([-6, 2, 1], arcadeOrange, 'emissive', 0.3);

    // Bumpers
    addVoxel([-6, 4, -1], arcadePurple, 'emissive', 0.4);
    addVoxel([-6, 4, 0], arcadeBlue, 'emissive', 0.4);
    addVoxel([-6, 4, 1], arcadeRed, 'emissive', 0.4);

    // TARGET SHOOTING GALLERY (right side)
    // Gallery base
    for (let x = 4; x <= 8; x++) {
      for (let z = -3; z <= 3; z++) {
        for (let y = 0; y <= 2; y++) {
          addVoxel([x, y, z], metallicGray, 'metallic', 0, 0.8, 0.2);
        }
      }
    }

    // Back wall
    for (let x = 5; x <= 7; x++) {
      for (let y = 3; y <= 6; y++) {
        addVoxel([x, y, 2], '#8B4513', 'standard');
      }
    }

    // Targets (various colors and shapes)
    // Round targets
    addVoxel([5, 4, 2], arcadeRed, 'emissive', 0.5);
    addVoxel([6, 5, 2], arcadeYellow, 'emissive', 0.5);
    addVoxel([7, 4, 2], arcadeGreen, 'emissive', 0.5);

    // Square targets
    for (let x = 5; x <= 5; x++) {
      for (let y = 3; y <= 3; y++) {
        addVoxel([x, y, 2], arcadeBlue, 'emissive', 0.3);
      }
    }

    // Neon sign
    for (let x = -2; x <= 2; x++) {
      for (let y = 9; y <= 9; y++) {
        addVoxel([x, y, 0], arcadePurple, 'emissive', 0.8);
      }
    }

    // Ground platform with arcade carpet pattern
    for (let x = -12; x <= 12; x++) {
      for (let z = -12; z <= 12; z++) {
        const distance = Math.sqrt(x * x + z * z);
        if (distance <= 12) {
          // Checkerboard arcade pattern
          const pattern = (Math.abs(x) + Math.abs(z)) % 2;
          if (pattern === 0) {
            addVoxel([x, -1, z], '#2F1B14', 'standard'); // Dark arcade floor
          } else {
            addVoxel([x, -1, z], '#4A2C17', 'standard'); // Lighter arcade floor
          }
        }
      }
    }

    return voxels;
  }, []);

  // Animate arcade elements
  useFrame((state) => {
    if (gamesRef.current) {
      const time = state.clock.getElapsedTime();

      // Gentle floating motion for the whole zone
      gamesRef.current.position.y = Math.sin(time * 0.8) * 0.1;

      // Pulsing neon sign - intensity calculation for future use
      // We'll handle this through emissive intensity changes in the future
    }
  });

  return (
    <group position={[-15, 0, 15]} ref={gamesRef}>
      <VoxelStructure voxels={gamesVoxels} />

      {/* Zone title */}
      <Text
        position={[0, 12, 0]}
        fontSize={1.5}
        color="#ffff00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.08}
        outlineColor="#ff0040"
      >
        ARCADE ZONE
      </Text>

      <Text
        position={[0, 10, 0]}
        fontSize={0.7}
        color="#00aaff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#ffffff"
      >
        Retro Gaming Paradise
      </Text>

      {/* Arcade lighting */}
      <pointLight position={[0, 8, 0]} color="#ffff00" intensity={3} distance={20} />
      <pointLight position={[-8, 6, 0]} color="#ff0040" intensity={2} distance={15} />
      <pointLight position={[8, 6, 0]} color="#00ff00" intensity={2} distance={15} />

      {/* Floating particles for arcade atmosphere */}
      {enableAdvancedEffects && (
        <>
          <ParticleField
            count={Math.floor(particleCount * 1.2)}
            position={[0, 4, 0]}
            color="#ffff00"
            size={0.02}
            speed={0.15}
            spread={12}
          />

          <ParticleField
            count={Math.floor(particleCount * 0.8)}
            position={[-6, 3, 0]}
            color="#ff0040"
            size={0.015}
            speed={0.12}
            spread={8}
          />

          <ParticleField
            count={Math.floor(particleCount * 0.8)}
            position={[6, 3, 0]}
            color="#00ff00"
            size={0.015}
            speed={0.12}
            spread={8}
          />
        </>
      )}

      {/* Interactive waypoints for each game */}
      <InfoWaypoint
        position={[-10, 3, 8]}
        title="Slot Machine"
        content="Try your luck at the digital slot machine! Three spinning reels of color and chance await your spin."
        icon="🎰"
        color="#ff0040"
        zoneType="games"
      />

      <InfoWaypoint
        position={[-18, 3, 12]}
        title="Pinball Wizard"
        content="Classic pinball action! Use the flippers to keep the ball in play and hit those colorful bumpers for points."
        icon="🎳"
        color="#ffff00"
        zoneType="games"
      />

      <InfoWaypoint
        position={[10, 3, 8]}
        title="Target Gallery"
        content="Test your aim at the shooting gallery! Hit the targets and watch them light up with satisfying effects."
        icon="🎯"
        color="#00ff00"
        zoneType="games"
      />

      <InfoWaypoint
        position={[-12, 3, -8]}
        title="Arcade Paradise"
        content="A nostalgic tribute to arcade gaming culture. Each game is built from colorful voxels and ready for interaction!"
        icon="🕹️"
        color="#00aaff"
        zoneType="games"
      />

      <InfoWaypoint
        position={[12, 3, -8]}
        title="Retro Gaming"
        content="Experience the joy of classic arcade games reimagined in 3D voxel form. Simple, colorful, and endlessly entertaining!"
        icon="👾"
        color="#aa00ff"
        zoneType="games"
      />

      {/* Fun sound effects indicators */}
      <Text
        position={[0, -2, 10]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffff00"
      >
        🎮 BEEP! BOOP! ZAP! 🎮
      </Text>
    </group>
  );
}
