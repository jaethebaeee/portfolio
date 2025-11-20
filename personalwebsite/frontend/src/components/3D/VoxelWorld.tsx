import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import { Dog } from './Dog';
import { Ground, Lights, Skybox } from './Environment';
import { LoadingScreen } from '../UI/LoadingScreen';

export function VoxelWorld() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDog, setShowDog] = useState<boolean>(false);
  const [simulatedProgress, setSimulatedProgress] = useState<number>(0);
  const [loadingStartTime] = useState<number>(Date.now());

  // Simulate realistic loading progress since we have no actual async assets
  useEffect(() => {
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const duration = 3000; // 3 seconds total simulated loading

      if (elapsed < duration) {
        // Simulate realistic loading curve: slow start, fast middle, slow finish
        const progress = Math.min(100, (elapsed / duration) * 100);
        const easedProgress = progress < 20 ? progress * 0.5 :
                            progress < 80 ? 10 + (progress - 20) * 1.25 :
                            80 + (progress - 80) * 0.5;

        setSimulatedProgress(Math.floor(easedProgress));
        requestAnimationFrame(updateProgress);
      } else {
        setSimulatedProgress(100);
      }
    };

    updateProgress();
  }, []);

  useEffect(() => {
    // Hide loading screen when simulated progress reaches 100%
    if (simulatedProgress >= 100) {
      const elapsedTime = Date.now() - loadingStartTime;
      const minLoadingTime = 2000; // Minimum 2 seconds to show loading screen
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      const timer = setTimeout(() => {
        setIsLoading(false);
        // Smooth transition to show dog scene
        setTimeout(() => setShowDog(true), 300);
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [simulatedProgress, loadingStartTime]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative'
      }}
    >
      {/* Animated Loading Screen */}
      {isLoading && <LoadingScreen onSkip={() => setIsLoading(false)} progressOverride={simulatedProgress} />}

      {/* Dog Scene with 3D Animation - Only shown after loading */}
      {showDog && (
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

          {/* Super cute animated dog */}
          <Dog />

          {/* Gentle bloom effect */}
          <EffectComposer>
            <Bloom intensity={0.3} luminanceThreshold={0.9} />
          </EffectComposer>
        </Canvas>
      )}
    </div>
  );
}