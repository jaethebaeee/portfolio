import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import { Ground, Lights, Skybox } from './Environment';
import { VintageNavigationButtons } from '../UI/VintageNavButton';

interface VoxelWorldProps {
  onBack?: () => void;
  onForward?: () => void;
}

export function VoxelWorld({ onBack, onForward }: VoxelWorldProps = {}) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative'
      }}
    >
      {/* 3D World Scene */}
      <Canvas
        shadows
        camera={{ position: [0, 5, 8], fov: 60 }}
        style={{
          background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
          position: 'absolute',
          inset: 0
        }}
      >
        <Lights />
        <Ground />
        <Skybox />

        {/* Gentle bloom effect */}
        <EffectComposer>
          <Bloom intensity={0.3} luminanceThreshold={0.9} />
        </EffectComposer>
      </Canvas>

      {/* Vintage Navigation Buttons */}
      <VintageNavigationButtons
        onBack={onBack}
        onForward={onForward}
        canGoBack={!!onBack}
        canGoForward={!!onForward}
        delay={0.5}
      />
    </div>
  );
}