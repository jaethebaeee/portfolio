import { motion, AnimatePresence } from 'framer-motion';
import { use3DStore } from '@/stores/use3DStore';
import { VirtualJoystick } from './VirtualJoystick';
import { MessageCircle, Sun, Moon, Cloud, Zap, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import useStore from '@/stores/useStore';

interface HUDProps {
  onExit?: () => void;
  onOpenResume?: () => void;
}

export function HUD({ onExit, onOpenResume }: HUDProps) {
  const { currentZone, canInteract, showControls, activeOverlay, setActiveOverlay } = use3DStore();
  const { setChatOpen } = useStore();
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night' | 'dawn' | 'dusk'>('day');
  const [energy, setEnergy] = useState(100);
  const [explorationProgress, setExplorationProgress] = useState(0);

  // Track time of day for UI
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const hour = (now / (1000 * 60 * 60)) % 24; // Simulate time progression

      if (hour >= 6 && hour < 8) setTimeOfDay('dawn');
      else if (hour >= 8 && hour < 18) setTimeOfDay('day');
      else if (hour >= 18 && hour < 20) setTimeOfDay('dusk');
      else setTimeOfDay('night');
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate energy drain and exploration progress
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.max(0, prev - 0.1));
      if (currentZone) {
        setExplorationProgress(prev => Math.min(100, prev + 0.5));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentZone]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setChatOpen(true);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (activeOverlay) {
          setActiveOverlay(null);
        }
      }
      if (e.key === 'Q' && e.shiftKey && onExit) {
        e.preventDefault();
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onExit, activeOverlay, setActiveOverlay, setChatOpen]);

  // Don't show HUD when overlay is open
  if (activeOverlay) return null;

  const getZoneName = (zone: string | null) => {
    if (!zone) return null;
    return zone.charAt(0).toUpperCase() + zone.slice(1);
  };

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'dawn': return <Sun className="w-4 h-4 text-orange-400" />;
      case 'day': return <Sun className="w-4 h-4 text-yellow-400" />;
      case 'dusk': return <Sun className="w-4 h-4 text-red-400" />;
      case 'night': return <Moon className="w-4 h-4 text-blue-300" />;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10" role="region" aria-label="Game HUD">
      {/* Time indicator */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 pixel-panel p-3 text-white flex items-center gap-2"
        role="status"
        aria-label={`Time of day: ${timeOfDay}`}
      >
        {getTimeIcon()}
        <span className="pixel-font text-xs capitalize">{timeOfDay}</span>
      </motion.div>

      {/* Energy bar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-20 left-6 pixel-panel p-3 text-white"
        role="status"
        aria-label={`Energy level: ${Math.round(energy)}%`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="pixel-font text-xs">ENERGY</span>
        </div>
        <div className="w-24 h-2 bg-gray-700 rounded">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded"
            initial={{ width: 0 }}
            animate={{ width: `${energy}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Exploration progress */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute top-32 left-6 pixel-panel p-3 text-white"
        role="status"
        aria-label={`Exploration progress: ${Math.round(explorationProgress)}%`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Cloud className="w-4 h-4 text-blue-400" />
          <span className="pixel-font text-xs">EXPLORED</span>
        </div>
        <div className="w-24 h-2 bg-gray-700 rounded">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded"
            initial={{ width: 0 }}
            animate={{ width: `${explorationProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Mini-map placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute top-4 right-4 pixel-panel p-3 text-white"
        role="navigation"
        aria-label="Portfolio zone mini-map"
      >
        <div className="w-20 h-20 bg-gray-800 rounded relative">
          {/* Simple zone indicators */}
          <div className="absolute top-2 left-2 w-3 h-3 bg-blue-400 rounded" title="About Zone" />
          <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded" title="Skills Zone" />
          <div className="absolute bottom-2 left-2 w-3 h-3 bg-purple-400 rounded" title="Projects Zone" />
          <div className="absolute bottom-2 right-2 w-3 h-3 bg-red-400 rounded" title="Contact Zone" />
          {/* Player position indicator */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="pixel-font text-xs text-center mt-1">MAP</p>
      </motion.div>

      {/* Controls hint */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-6 left-6 pixel-panel p-4 text-white"
            role="region"
            aria-label="Game controls information"
          >
            <h3 className="pixel-font text-sm mb-2" id="controls-heading">CONTROLS</h3>
            <div className="pixel-font text-xs space-y-1" role="list" aria-labelledby="controls-heading">
              <p role="listitem">WASD / ARROWS - Move character</p>
              <p role="listitem">E / SPACE - Interact with zones</p>
              <p role="listitem">C - Open AI chat</p>
              <p role="listitem">ESC - Close menus</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current zone indicator */}
      <AnimatePresence>
        {currentZone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-6 right-6 pixel-panel p-4 text-white"
            role="status"
            aria-live="polite"
            aria-label={`Currently in ${getZoneName(currentZone)} zone`}
          >
            <h3 className="pixel-font text-lg">{getZoneName(currentZone)}</h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced interaction prompt */}
      <AnimatePresence>
        {canInteract && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
            role="alert"
            aria-live="assertive"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 0 0 rgba(59, 130, 246, 0.7)',
                  '0 0 0 10px rgba(59, 130, 246, 0)',
                  '0 0 0 0 rgba(59, 130, 246, 0)'
                ]
              }}
              transition={{
                scale: { duration: 1, repeat: Infinity },
                boxShadow: { duration: 2, repeat: Infinity }
              }}
              className="pixel-panel p-4 text-white relative overflow-hidden"
              aria-label="Interactive zone available, press E to open"
            >
              {/* Pulsing background effect */}
              <motion.div
                className="absolute inset-0 bg-blue-500 opacity-20"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              <motion.p
                className="pixel-font text-sm relative z-10"
                animate={{ textShadow: [
                  '0 0 5px rgba(59, 130, 246, 0.5)',
                  '0 0 10px rgba(59, 130, 246, 0.8)',
                  '0 0 5px rgba(59, 130, 246, 0.5)'
                ]}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Press E to Interact
              </motion.p>

              {/* Sparkle effects */}
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.2
                }}
              />
              <motion.div
                className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-300 rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.7
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini info bar + XP */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2">
        <div className="pixel-panel p-3 text-white">
          <p className="pixel-font text-xs">JAE'S PORTFOLIO</p>
        </div>
        <button
          onClick={() => setChatOpen(true)}
          className="pixel-button p-3 bg-purple-600 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 pointer-events-auto"
          aria-label="Open AI chat assistant"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="pixel-font text-xs">CHAT</span>
        </button>
        {onOpenResume && (
          <button
            onClick={onOpenResume}
            className="pixel-button p-3 bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 pointer-events-auto"
            aria-label="Open resume overlay"
          >
            <FileText className="w-4 h-4" />
            <span className="pixel-font text-xs">RESUME</span>
          </button>
        )}

        {onExit && (
          <button
            onClick={onExit}
            className="pixel-button p-3 bg-purple-600 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 pointer-events-auto"
            aria-label="Exit 3D world and return to traditional website"
          >
            <span className="pixel-font text-xs">EXIT 3D</span>
          </button>
        )}
      </div>

      {/* Mobile Virtual Joystick */}
      <VirtualJoystick />
    </div>
);
}
