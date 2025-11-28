import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';

interface LoadingStep {
  name: string;
  weight: number;
  completed: boolean;
  startTime?: number;
  endTime?: number;
}

interface LoadingMetrics {
  startTime: number;
  estimatedTotalTime: number;
  currentSpeed: number;
}

interface PerformanceConfig {
  enableParticles: boolean;
  enableComplexAnimations: boolean;
  particleCount: number;
  animationQuality: 'low' | 'medium' | 'high';
}

interface LoadingScreenProps {
  onSkip?: () => void;
  progressOverride?: number;
  forceVisible?: boolean;
}

export function LoadingScreen({ onSkip, progressOverride, forceVisible: _forceVisible }: LoadingScreenProps) {
  const { progress: realProgress, loaded: realLoaded, total: realTotal, errors } = useProgress();
  const progress = progressOverride ?? realProgress;

  // Use overridden values for simulated loading, fallback to real values
  const loaded = progressOverride !== undefined ? Math.floor((progress / 100) * 100) : realLoaded;
  const total = progressOverride !== undefined ? 100 : realTotal;
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { name: "Building Jae's Digital Realm", weight: 20, completed: false },
    { name: "Crafting Voxel Terrain", weight: 15, completed: false },
    { name: "Lighting up the Scene", weight: 20, completed: false },
    { name: "Spawning Portfolio Zones", weight: 25, completed: false },
    { name: "Calibrating Camera Magic", weight: 20, completed: false }
  ]);

  const [metrics, setMetrics] = useState<LoadingMetrics>({
    startTime: Date.now(),
    estimatedTotalTime: 0,
    currentSpeed: 0
  });

  const [performanceConfig, setPerformanceConfig] = useState<PerformanceConfig>({
    enableParticles: true,
    enableComplexAnimations: true,
    particleCount: 6,
    animationQuality: 'high'
  });

  const [canSkip, setCanSkip] = useState(false);

  // Performance detection with safe browser compatibility
  useEffect(() => {
    const detectPerformance = () => {
      let quality: 'low' | 'medium' | 'high' = 'high';

      try {
        // Check connection speed (Network Information API)
        const connection = (navigator as any).connection ||
                          (navigator as any).mozConnection ||
                          (navigator as any).webkitConnection;

        if (connection?.effectiveType) {
          const effectiveType = connection.effectiveType;
          if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            quality = 'low';
          } else if (effectiveType === '3g') {
            quality = 'medium';
          }
        }

        // Check device memory (Device Memory API)
        const deviceMemory = (navigator as any).deviceMemory;
        if (deviceMemory && typeof deviceMemory === 'number') {
          if (deviceMemory < 2) {
            quality = 'low';
          } else if (deviceMemory < 4) {
            // Downgrade from high to medium, keep others as is
            quality = quality === 'high' ? 'medium' : quality;
          }
        }

        // Check hardware concurrency
        const hardwareConcurrency = navigator.hardwareConcurrency;
        if (hardwareConcurrency && typeof hardwareConcurrency === 'number') {
          if (hardwareConcurrency <= 2) {
            quality = 'low';
          } else if (hardwareConcurrency <= 4) {
            // Downgrade from high to medium, keep others as is
            quality = quality === 'high' ? 'medium' : quality;
          }
        }

        // Check if it's a mobile device (reduce animations)
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                        window.innerWidth < 768;

        if (isMobile && quality === 'high') {
          quality = 'medium';
        }

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
          quality = 'low';
        }

      } catch (error) {
        // Fallback to medium quality if detection fails
        console.warn('Performance detection failed, using medium quality:', error);
        quality = 'medium';
      }

      setPerformanceConfig({
        enableParticles: quality !== 'low',
        enableComplexAnimations: quality === 'high',
        particleCount: quality === 'low' ? 2 : quality === 'medium' ? 3 : 5,
        animationQuality: quality
      });
    };

    detectPerformance();
  }, []);

  // Real-time loading progress tracking with improved accuracy
  useEffect(() => {
    const now = Date.now();
    const elapsed = now - metrics.startTime;

    // Calculate loading speed more accurately
    let currentSpeed = 0;
    let estimatedTotalTime = 0;

    if (loaded > 0 && elapsed > 100) { // Wait for some data before calculating
      currentSpeed = (loaded / elapsed) * 1000; // assets per second

      // Estimate remaining time based on current speed
      const remainingAssets = Math.max(0, total - loaded);
      estimatedTotalTime = currentSpeed > 0 ? (remainingAssets / currentSpeed) * 1000 : 0;

      // Cap estimation to reasonable bounds (max 30 seconds)
      estimatedTotalTime = Math.min(estimatedTotalTime, 30000);
    }

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      currentSpeed,
      estimatedTotalTime
    }));

    // Mark steps as completed based on real progress with hysteresis
    setLoadingSteps((steps) => {
      const newSteps = [...steps];
      const progressRatio = loaded / Math.max(total, 1);
      const targetCompletedSteps = Math.floor(progressRatio * steps.length);

      newSteps.forEach((step, index) => {
        if (index < targetCompletedSteps && !step.completed) {
          step.completed = true;
          step.endTime = now;
          step.startTime = step.startTime || now;
        }
      });

      return newSteps;
    });

    // Update current step based on completion
    const completedCount = loadingSteps.filter(step => step.completed).length;
    setCurrentStep(Math.min(completedCount, loadingSteps.length - 1));

    // Allow skipping after minimum loading time (1.5 seconds) or if mostly loaded
    if (elapsed > 1500 || progress > 80) {
      setCanSkip(true);
    }
  }, [loaded, total, metrics.startTime]);

  // Hide loading screen when actually complete
  useEffect(() => {
    if (progress >= 100 && !errors.length && !_forceVisible) {
      // Minimum loading time for UX (1 second), but can be skipped by user
      const minLoadingTime = Math.max(1000 - (Date.now() - metrics.startTime), 0);
      const timer = setTimeout(() => setIsLoading(false), minLoadingTime);
      return () => clearTimeout(timer);
    }
  }, [progress, errors, metrics.startTime, _forceVisible]);

  // Calculate real progress with better weighting and smoothing
  const completedWeight = loadingSteps.reduce((acc, step) => {
    return acc + (step.completed ? step.weight : 0);
  }, 0);

  const displayProgress = Math.min(completedWeight + (progress / 100) * 15, 100);
  const timeRemaining = Math.max(0, metrics.estimatedTotalTime - (Date.now() - metrics.startTime));

  // More user-friendly time remaining text
  const getTimeRemainingText = () => {
    if (timeRemaining <= 0) return 'Almost ready!';
    if (timeRemaining < 1000) return 'Less than 1s';
    if (timeRemaining < 5000) return 'Just a moment...';
    const seconds = Math.ceil(timeRemaining / 1000);
    return `${seconds}s remaining`;
  };

  const timeRemainingText = getTimeRemainingText();

  return (
    <AnimatePresence>
      {(isLoading || _forceVisible) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.8, ease: 'easeOut' }
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 pixel-panel"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            border: '4px solid #ffffff',
            boxShadow: 'inset 0 0 50px rgba(0, 255, 255, 0.1)'
          }}
          role="status"
          aria-live="polite"
          aria-label={`Loading Jae's Portfolio: ${Math.round(displayProgress)}% complete`}
          aria-describedby="loading-description"
          aria-valuenow={Math.round(displayProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${Math.round(displayProgress)}% complete, ${timeRemainingText}`}
        >
          {/* Background floating particles */}
          {performanceConfig.enableParticles && Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`bg-${i}`}
              className="absolute w-1 h-1 bg-white opacity-20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0
              }}
              animate={{
                y: [null, '-=100px', '+=100px'],
                x: [null, `+=${Math.random() * 50 - 25}px`],
                scale: [0, 1, 0],
                opacity: [0, 0.3, 0]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'easeInOut'
              }}
            />
          ))}

          <div className="text-center max-w-md relative z-10">
            <motion.h1
              className="pixel-font text-3xl md:text-4xl text-white mb-6 relative"
              animate={{
                scale: [1, 1.08, 1],
                rotate: [0, 1, -1, 0],
                textShadow: [
                  '0 0 20px rgba(255,255,255,0.5)',
                  '0 0 40px rgba(255,255,255,0.8)',
                  '0 0 20px rgba(255,255,255,0.5)'
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                textShadow: { duration: 2, repeat: Infinity }
              }}
            >
              <motion.span
                animate={{
                  color: ['#ffffff', '#00ffff', '#ff6b6b', '#4ecdc4', '#ffffff'],
                  textShadow: [
                    '0 0 10px rgba(255,255,255,0.5)',
                    '0 0 20px rgba(0,255,255,0.8)',
                    '0 0 20px rgba(255,107,107,0.8)',
                    '0 0 20px rgba(78,205,196,0.8)',
                    '0 0 10px rgba(255,255,255,0.5)'
                  ]
                }}
                transition={{
                  color: { duration: 3, repeat: Infinity },
                  textShadow: { duration: 3, repeat: Infinity }
                }}
              >
                LOADING JAE'S WORLD
              </motion.span>
              <motion.span
                animate={{
                  opacity: [1, 0, 1],
                  scale: [1, 0.8, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.5
                }}
              >
                ...
              </motion.span>
            </motion.h1>

            {/* Loading steps */}
            <div className="mb-6 space-y-2">
              {loadingSteps.map((step, index) => (
                <motion.div
                  key={step.name}
                  initial={{ opacity: 0, x: -30, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    y: step.completed ? [0, -2, 0] : 0
                  }}
                  transition={{
                    delay: index * 0.3,
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    y: step.completed ? { duration: 0.5, delay: 0.2 } : {}
                  }}
                  className={`flex items-center gap-3 text-left ${
                    step.completed ? 'text-green-400' : index === currentStep ? 'text-yellow-400' : 'text-gray-400'
                  }`}
                >
                  <motion.div
                    className={`w-4 h-4 pixel-border ${
                      step.completed ? 'bg-green-400' : index === currentStep ? 'bg-yellow-400' : 'bg-gray-600'
                    }`}
                    animate={index === currentStep && !step.completed ? {
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        '0 0 0 0px rgba(250, 204, 21, 0.4)',
                        '0 0 0 8px rgba(250, 204, 21, 0)',
                        '0 0 0 0px rgba(250, 204, 21, 0.4)'
                      ]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.span
                    className="pixel-font text-sm"
                    animate={step.completed ? {
                      textShadow: [
                        '0 0 0px rgba(34, 197, 94, 0)',
                        '0 0 10px rgba(34, 197, 94, 0.8)',
                        '0 0 0px rgba(34, 197, 94, 0)'
                      ]
                    } : {}}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    {step.name}
                  </motion.span>
                  {step.completed && (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{
                        scale: [0, 1.3, 1],
                        rotate: [-180, 10, 0]
                      }}
                      transition={{
                        duration: 0.8,
                        ease: [0.68, -0.55, 0.265, 1.55]
                      }}
                      className="text-green-400"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Pixel art loading bar */}
            <motion.div
              className="w-full max-w-sm h-8 bg-gray-800 border-4 border-white pixel-border mb-4 relative overflow-hidden"
              animate={{
                borderColor: displayProgress > 80 ? ['#ffffff', '#00ffff', '#ffffff'] : '#ffffff'
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-yellow-400 to-pink-400 relative"
                initial={{ width: 0 }}
                animate={{
                  width: `${displayProgress}%`,
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  width: { duration: 0.8, ease: 'easeOut' },
                  backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' }
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>

              {/* Progress glow effect */}
              {displayProgress > 0 && (
                <motion.div
                  className="absolute inset-0 bg-cyan-400 opacity-20 blur-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${displayProgress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              )}
            </motion.div>

            <div className="flex justify-between items-center mb-6">
              <div className="text-center">
                <p className="pixel-font text-white text-lg font-bold">{Math.round(displayProgress)}%</p>
                <p className="pixel-font text-cyan-400 text-xs mt-1">
                  {displayProgress < 25 ? "Starting the journey..." :
                   displayProgress < 50 ? "Building the foundation..." :
                   displayProgress < 75 ? "Adding the magic..." :
                   displayProgress < 100 ? "Almost ready!" : "Welcome to Jae's World! ✨"}
                </p>
              </div>
              <p className="pixel-font text-gray-300 text-sm">
                {loaded}/{total} assets loaded
              </p>
            </div>

            {/* Skip button for better UX */}
            {canSkip && progress < 100 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onSkip?.();
                }}
                className="w-full mb-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 pixel-border text-black pixel-font text-sm transition-colors"
              >
                Skip Ahead 🚀
              </motion.button>
            )}

            {/* Animated character */}
            <div className="relative">
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  rotate: loadingSteps.find(s => s.completed)?.completed ? [0, 8, -8, 0] : [0, 2, -2, 0],
                  scale: [1, 1.05, 1],
                  filter: [
                    'hue-rotate(0deg)',
                    'hue-rotate(10deg)',
                    'hue-rotate(0deg)'
                  ]
                }}
                transition={{
                  y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                  filter: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
                }}
                className="w-20 h-20 mx-auto bg-gradient-to-b from-cyan-400 to-cyan-600 pixel-border relative"
                style={{
                  background: 'linear-gradient(135deg, #00ffff 0%, #0891b2 50%, #00ffff 100%)',
                  backgroundSize: '200% 200%'
                }}
              >
                {/* Character head with blinking animation */}
                <motion.div
                  className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yellow-400 pixel-border"
                  animate={{
                    backgroundColor: ['#ffff00', '#ffd700', '#ffff00'],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <motion.div
                    className="flex gap-0.5 p-1"
                    animate={{
                      opacity: [1, 0, 1]
                    }}
                    transition={{
                      duration: 0.15,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  >
                    <div className="w-1 h-1 bg-black rounded-full"></div>
                    <div className="w-1 h-1 bg-black rounded-full"></div>
                  </motion.div>
                </motion.div>

                {/* Character body with dynamic colors */}
                <motion.div
                  className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-cyan-500 pixel-border"
                  animate={{
                    backgroundColor: ['#0891b2', '#06b6d4', '#0891b2'],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    backgroundColor: { duration: 4, repeat: Infinity },
                    rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  }}
                />

                {/* Energy aura effect */}
                <motion.div
                  className="absolute inset-0 bg-cyan-400 rounded opacity-20 blur-sm"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </motion.div>

              {/* Enhanced loading particles */}
              {performanceConfig.enableParticles && Array.from({ length: 8 }).map((_, i) => {
                const colors = ['#ffff00', '#ffd700', '#d97706', '#00ffff', '#0891b2', '#06b6d4'];
                const sizes = ['w-2 h-2', 'w-1.5 h-1.5', 'w-1 h-1', 'w-3 h-3'];
                const shapes = ['rounded-full', 'rounded-sm', 'rounded-lg'];

                return (
                  <motion.div
                    key={i}
                    className={`absolute ${sizes[i % sizes.length]} ${shapes[i % shapes.length]}`}
                    style={{
                      backgroundColor: colors[i % colors.length],
                      boxShadow: `0 0 ${4 + i}px ${colors[i % colors.length]}40`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                    initial={{
                      x: 0,
                      y: 0,
                      scale: 0,
                      opacity: 0
                    }}
                    animate={{
                      x: [
                        0,
                        Math.sin(i * 45 * Math.PI / 180) * (30 + i * 5),
                        Math.cos(i * 45 * Math.PI / 180) * (40 + i * 3),
                        0
                      ],
                      y: [
                        0,
                        Math.cos(i * 45 * Math.PI / 180) * (30 + i * 5),
                        -Math.sin(i * 45 * Math.PI / 180) * (40 + i * 3),
                        0
                      ],
                      scale: [0, 1, 0.8, 1, 0],
                      opacity: [0, 1, 0.7, 1, 0],
                      rotate: [0, 360, 720]
                    }}
                    transition={{
                      duration: 6 + i * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.3
                    }}
                  />
                );
              })}

              {/* Central energy orb */}
              <motion.div
                className="absolute w-4 h-4 bg-gradient-to-r from-cyan-400 to-yellow-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 1, 0.8],
                  boxShadow: [
                    '0 0 20px rgba(0, 255, 255, 0.5)',
                    '0 0 40px rgba(0, 255, 255, 0.8)',
                    '0 0 20px rgba(0, 255, 255, 0.5)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>

            {/* Error handling */}
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-600 pixel-panel"
              >
                <p className="pixel-font text-white text-sm mb-2">⚠️ Oops! Loading Glitch</p>
                <p className="pixel-font text-gray-200 text-xs">
                  Some parts of Jae's world couldn't load. The experience might feel a bit different, but the magic is still there! ✨
                </p>
              </motion.div>
            )}

            {/* Enhanced Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                background: [
                  'rgba(31, 41, 55, 0.5)',
                  'rgba(0, 255, 255, 0.1)',
                  'rgba(31, 41, 55, 0.5)'
                ]
              }}
              transition={{
                delay: 4,
                duration: 1,
                ease: [0.25, 0.46, 0.45, 0.94],
                background: { duration: 3, repeat: Infinity }
              }}
              className="mt-6 p-3 pixel-panel relative overflow-hidden"
            >
              {/* Animated background effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-10"
                animate={{ x: ['-150%', '150%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />

              <motion.p
                className="pixel-font text-gray-300 text-xs relative z-10"
                animate={{
                  textShadow: [
                    '0 0 0px rgba(255,255,255,0)',
                    '0 0 8px rgba(255,255,255,0.5)',
                    '0 0 0px rgba(255,255,255,0)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                💡 Pro Tip: Drag to explore, scroll to zoom, right-click to pan around Jae's digital universe! 🚀
              </motion.p>

              {/* Pulsing icon */}
              <motion.span
                className="absolute -top-1 -right-1 text-lg"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                ✨
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}