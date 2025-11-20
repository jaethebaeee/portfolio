import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { use3DStore } from '@/stores/use3DStore';

export function PerformanceMonitor() {
  const { scene } = useThree();
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [triangleCount, setTriangleCount] = useState(0);
  const [showStats, setShowStats] = useState(false);

  const { activeOverlay } = use3DStore();

  useFrame((state) => {
    // Calculate FPS
    setFps(Math.round(1 / state.clock.getDelta()));

    // Count triangles (rough estimate)
    let triangles = 0;
    scene.traverse((object: any) => {
      if (object.isMesh && object.geometry) {
        if (object.geometry.index) {
          triangles += object.geometry.index.count / 3;
        } else if (object.geometry.attributes.position) {
          triangles += object.geometry.attributes.position.count / 3;
        }
      }
    });
    setTriangleCount(Math.round(triangles));

    // Memory usage (if available)
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      setMemoryUsage(Math.round(memInfo.usedJSHeapSize / 1024 / 1024));
    }
  });

  // Toggle stats with Shift+P
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'P') {
        setShowStats(!showStats);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showStats]);

  // Don't show during overlays
  if (activeOverlay || !showStats) return null;

  const getPerformanceColor = (fps: number) => {
    if (fps >= 50) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed top-4 right-4 pixel-panel p-3 bg-gray-800 bg-opacity-90 z-40">
      <div className="pixel-font text-xs text-white space-y-1">
        <div className="flex justify-between gap-4">
          <span>FPS:</span>
          <span className={getPerformanceColor(fps)}>{fps}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Triangles:</span>
          <span className="text-cyan-400">{triangleCount.toLocaleString()}</span>
        </div>
        {memoryUsage > 0 && (
          <div className="flex justify-between gap-4">
            <span>Memory:</span>
            <span className="text-purple-400">{memoryUsage}MB</span>
          </div>
        )}
        <div className="text-gray-400 text-xs mt-2">
          Shift+P to toggle
        </div>
      </div>
    </div>
  );
}
