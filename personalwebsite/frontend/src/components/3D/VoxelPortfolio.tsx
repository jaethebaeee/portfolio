import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { useProgress } from '@react-three/drei';

import { AboutZone, SkillsZone, EducationZone, ProjectsZone, ContactZone, DogZone, GamesZone } from './zones';
import { Character } from './Character';
import { CameraController } from './CameraController';
import { Ground } from './Environment';
import { ZoneNavigation } from './ZoneNavigation';
import { LoadingScreen } from '../UI/LoadingScreen';
import { Minimap } from '../UI/Minimap';
import { HUD } from '../UI/HUD';
import { ChatOverlay } from '../UI/ChatOverlay';
import { PerformanceMonitor } from '../UI/PerformanceMonitor';

interface VoxelPortfolioProps {
  onExit?: () => void;
}

function PortfolioScene({ onZoneChange }: { onZoneChange?: (_zoneId: string) => void }) {
  const [currentZone, setCurrentZone] = useState<string>('about');

  const handleZoneChange = (zoneId: string) => {
    setCurrentZone(zoneId);
    onZoneChange?.(zoneId);
  };

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#4ecdc4" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#a78bfa" />

      {/* Ground plane */}
      <Ground />

      {/* Portfolio Zones - arranged in a 3x2 grid */}
      <AboutZone />
      <SkillsZone />
      <EducationZone />
      <ProjectsZone />
      <ContactZone />
      <DogZone />
      <GamesZone />

      {/* Navigation System */}
      <ZoneNavigation currentZone={currentZone} onZoneChange={handleZoneChange} />

      {/* Character controller */}
      <Character />

      {/* Camera controller */}
      <CameraController />

      {/* Environmental effects */}
      {/* <Environment preset="city" /> */}

      {/* Contact shadows for depth */}
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.4}
        scale={50}
        blur={1}
        far={10}
      />

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.9} />
        <ToneMapping adaptive />
      </EffectComposer>

      {/* Performance monitor - must be inside Canvas */}
      <PerformanceMonitor />
    </>
  );
}

export function VoxelPortfolio({ onExit }: VoxelPortfolioProps) {
  const { progress } = useProgress();

  // For procedural 3D content, we simulate loading progress
  // since there are no external assets to load
  const simulatedProgress = Math.min(progress + 100, 100);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Loading Screen */}
      {simulatedProgress < 100 && (
        <LoadingScreen
          onSkip={() => {
            // Force skip loading if stuck
            console.log('Skipping loading screen');
          }}
        />
      )}

      {/* Main 3D Scene */}
      {simulatedProgress >= 100 && (
        <Canvas
          shadows
          camera={{ position: [0, 8, 15], fov: 60 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
          }}
          style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f23 100%)' }}
        >
          <Suspense fallback={null}>
            <PortfolioScene />
          </Suspense>
        </Canvas>
      )}

      {/* UI Overlays */}
      {simulatedProgress >= 100 && (
        <>
          <HUD onExit={onExit} />
          <Minimap />
          <ChatOverlay />
        </>
      )}
    </div>
  );
}
