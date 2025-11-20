import { motion, AnimatePresence } from 'framer-motion';
import { use3DStore } from '@/stores/use3DStore';
import { useGameStore, xpProgress } from '@/stores/useGameStore';
import { VirtualJoystick } from './VirtualJoystick';
import { AchievementPanel } from './AchievementPanel';
import { Trophy, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import useStore from '@/stores/useStore';

interface HUDProps {
  onExit?: () => void;
}

export function HUD({ onExit }: HUDProps) {
  const { currentZone, canInteract, showControls, activeOverlay, setActiveOverlay } = use3DStore();
  const { level, xp, coins } = useGameStore();
  const { setChatOpen } = useStore();
  const [showAchievements, setShowAchievements] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setShowAchievements(true);
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setChatOpen(true);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showAchievements) {
          setShowAchievements(false);
        } else if (activeOverlay) {
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
  }, [onExit, showAchievements, activeOverlay, setActiveOverlay, setChatOpen]);

  // Don't show HUD when overlay is open
  if (activeOverlay) return null;

  const getZoneName = (zone: string | null) => {
    if (!zone) return null;
    return zone.charAt(0).toUpperCase() + zone.slice(1);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10" role="region" aria-label="Game HUD">
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

      {/* Interaction prompt */}
      <AnimatePresence>
        {canInteract && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
            role="alert"
            aria-live="assertive"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="pixel-panel p-4 text-white"
              aria-label="Interactive zone available, press E to open"
            >
              <p className="pixel-font text-sm">Press E to Interact</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini info bar + XP */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2">
        <div className="pixel-panel p-3 text-white">
          <p className="pixel-font text-xs">JAE'S PORTFOLIO</p>
        </div>
        <div className="pixel-panel p-3 text-white w-[220px]">
          <div className="flex items-center justify-between mb-2">
            <span className="pixel-font text-xs">Level {level}</span>
            <span className="pixel-font text-xs">{xp} XP</span>
          </div>
          <div className="h-2 bg-gray-700 rounded">
            <div
              className="h-2 bg-emerald-400 rounded"
              style={{ width: `${Math.round(xpProgress(level, xp) * 100)}%` }}
            />
          </div>
        </div>
        <div className="pixel-panel p-3 text-white w-[220px] flex items-center justify-between">
          <span className="pixel-font text-xs">Coins</span>
          <span className="pixel-font text-xs">{coins}</span>
        </div>
        <button
          onClick={() => setShowAchievements(true)}
          className="pixel-button p-3 bg-yellow-600 hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
          aria-label="View achievements and challenges"
        >
          <Trophy className="w-4 h-4" />
          <span className="pixel-font text-xs">ACHIEVEMENTS</span>
        </button>
        <button
          onClick={() => setChatOpen(true)}
          className="pixel-button p-3 bg-purple-600 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          aria-label="Open AI chat assistant"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="pixel-font text-xs">CHAT</span>
        </button>
        {onExit && (
          <button
            onClick={onExit}
            className="pixel-button p-3 bg-purple-600 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            aria-label="Exit 3D world and return to traditional website"
          >
            <span className="pixel-font text-xs">EXIT 3D</span>
          </button>
        )}
      </div>

      {/* Mobile Virtual Joystick */}
      <VirtualJoystick />

      {/* Achievement Panel */}
      <AchievementPanel
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />
    </div>
);
}
