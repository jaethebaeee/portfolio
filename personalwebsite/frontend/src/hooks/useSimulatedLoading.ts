import { useState, useEffect } from 'react';

interface UseSimulatedLoadingOptions {
  duration?: number;
  easingType?: 'portfolio' | 'world';
}

interface UseSimulatedLoadingReturn {
  progress: number;
  isLoaded: boolean;
  skipLoading: () => void;
}

export function useSimulatedLoading({
  duration = 3000,
  easingType = 'portfolio'
}: UseSimulatedLoadingOptions = {}): UseSimulatedLoadingReturn {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const skipLoading = () => {
    setIsLoaded(true);
  };

  useEffect(() => {
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min((elapsed / duration) * 100, 100);

      // Different easing curves for different components
      let easedProgress: number;
      if (easingType === 'portfolio') {
        // Portfolio easing: slow start, fast middle, slow finish
        easedProgress = rawProgress < 30 ? rawProgress * 0.3 :
                       rawProgress < 70 ? 9 + (rawProgress - 30) * 1.5 :
                       70 + (rawProgress - 70) * 1.0;
      } else {
        // World easing: slow start, fast middle, slow finish (original)
        easedProgress = rawProgress < 20 ? rawProgress * 0.5 :
                       rawProgress < 80 ? 10 + (rawProgress - 20) * 1.25 :
                       80 + (rawProgress - 80) * 0.5;
      }

      setProgress(Math.floor(easedProgress));

      if (rawProgress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        setIsLoaded(true);
      }
    };

    updateProgress();
  }, [duration, easingType]);

  return { progress, isLoaded, skipLoading };
}
