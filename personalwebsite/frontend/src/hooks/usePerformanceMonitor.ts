import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  quality: 'high' | 'medium' | 'low';
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    quality: 'high'
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameTimeHistory = useRef<number[]>([]);

  useFrame((_state, _delta) => {
    frameCountRef.current++;

    // Update FPS every second
    const now = performance.now();
    if (now - lastTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
      const avgFrameTime = (now - lastTimeRef.current) / frameCountRef.current;

      frameTimeHistory.current.push(avgFrameTime);
      if (frameTimeHistory.current.length > 10) {
        frameTimeHistory.current.shift();
      }

      const avgFrameTime10 = frameTimeHistory.current.reduce((a, b) => a + b, 0) / frameTimeHistory.current.length;

      // Determine quality level based on performance
      let quality: 'high' | 'medium' | 'low' = 'high';
      if (avgFrameTime10 > 25) quality = 'low'; // Below ~40 FPS
      else if (avgFrameTime10 > 20) quality = 'medium'; // Below ~50 FPS

      setMetrics({
        fps,
        frameTime: avgFrameTime,
        quality
      });

      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
  });

  return metrics;
}
