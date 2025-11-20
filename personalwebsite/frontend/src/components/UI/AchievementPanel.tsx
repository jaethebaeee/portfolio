import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Star, Calendar, Target } from 'lucide-react';
import { useGameStore, DailyChallenge } from '@/stores/useGameStore';
import { useEffect } from 'react';

interface AchievementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementPanel({ isOpen, onClose }: AchievementPanelProps) {
  const { achievements, dailyChallenges, streakDays } = useGameStore();

  const unlockedAchievements = Object.values(achievements).filter(a => a.unlockedAt);
  const lockedAchievements = Object.values(achievements).filter(a => !a.unlockedAt);

  // Handle ESC key to close panel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getChallengeIcon = (type: DailyChallenge['type']) => {
    switch (type) {
      case 'collect': return '💰';
      case 'visit': return '🗺️';
      case 'interact': return '🎯';
      case 'chat': return '💬';
      default: return '🎯';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="pixel-panel max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 pixel-button p-2 hover:bg-red-600 transition-colors"
            aria-label="Close achievement panel"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block mb-4"
            >
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
            </motion.div>
            <h1 className="pixel-font text-3xl mb-2 text-yellow-400">ACHIEVEMENTS</h1>
            <div className="flex items-center justify-center gap-4 text-white">
              <div className="pixel-panel px-4 py-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="pixel-font text-sm">{streakDays} Day Streak</span>
              </div>
            </div>
          </div>

          {/* Daily Challenges */}
          {dailyChallenges.length > 0 && (
            <div className="mb-8">
              <h2 className="pixel-font text-xl mb-4 text-cyan-400 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Daily Challenges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailyChallenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pixel-panel p-4 bg-gray-800"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getChallengeIcon(challenge.type)}</span>
                      <div className="flex-1">
                        <h3 className="pixel-font text-sm text-cyan-400 font-bold mb-1">
                          {challenge.title}
                        </h3>
                        <p className="pixel-font text-xs text-gray-300 mb-3">
                          {challenge.description}
                        </p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="pixel-font text-xs text-white">
                            Progress: {challenge.current}/{challenge.target}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="pixel-font text-xs text-yellow-400">
                              +{challenge.reward.xp} XP
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-700 rounded overflow-hidden">
                          <motion.div
                            className="h-full bg-cyan-400 rounded"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min((challenge.current / challenge.target) * 100, 100)}%`
                            }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-8">
              <h2 className="pixel-font text-xl mb-4 text-green-400 flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Unlocked Achievements ({unlockedAchievements.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="pixel-panel p-4 bg-green-900 border-2 border-green-400"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h3 className="pixel-font text-sm text-green-400 font-bold mb-1">
                        {achievement.title}
                      </h3>
                      <p className="pixel-font text-xs text-gray-200 mb-2">
                        {achievement.description}
                      </p>
                      {achievement.unlockedAt && (
                        <div className="pixel-font text-xs text-green-300">
                          Unlocked {formatDate(achievement.unlockedAt)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h2 className="pixel-font text-xl mb-4 text-gray-400 flex items-center gap-2">
                <Trophy className="w-6 h-6 opacity-50" />
                Locked Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="pixel-panel p-4 bg-gray-800 border-2 border-gray-600"
                  >
                    <div className="text-center opacity-60">
                      <div className="text-4xl mb-2 grayscale">{achievement.icon}</div>
                      <h3 className="pixel-font text-sm text-gray-400 font-bold mb-1">
                        {achievement.title}
                      </h3>
                      <p className="pixel-font text-xs text-gray-500">
                        {achievement.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
