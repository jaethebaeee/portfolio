import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ZoneType } from './use3DStore';

// Daily challenge types
export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'collect' | 'visit' | 'interact' | 'chat';
  target: number;
  current: number;
  reward: { xp: number; coins: number };
  expiresAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface GameState {
  level: number;
  xp: number; // total XP accumulated
  coins: number;
  visitedZones: Record<Exclude<ZoneType, null>, boolean>;
  collected: Record<string, boolean>;
  // New dynamic gamification features
  dailyChallenges: DailyChallenge[];
  achievements: Record<string, Achievement>;
  lastChallengeRefresh: string; // ISO date string
  totalZoneVisits: Record<Exclude<ZoneType, null>, number>;
  streakDays: number;
  lastVisitDate: string; // ISO date string
}

interface GameActions {
  addXP: (_amount: number) => void;
  addCoins: (_amount: number) => void;
  markZoneVisited: (_zone: Exclude<ZoneType, null>) => void;
  hasVisited: (_zone: Exclude<ZoneType, null>) => boolean;
  markCollected: (_id: string) => void;
  isCollected: (_id: string) => boolean;
  // New dynamic gamification actions
  refreshDailyChallenges: () => void;
  updateChallengeProgress: (_challengeId: string, _amount?: number) => void;
  completeChallenge: (_challengeId: string) => void;
  unlockAchievement: (_achievementId: string) => void;
  incrementZoneVisit: (_zone: Exclude<ZoneType, null>) => void;
  updateVisitStreak: () => void;
}

const xpForLevel = (level: number) => 100 * level; // simple linear curve for now

// Achievement definitions
const ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlockedAt' | 'progress' | 'maxProgress'>> = {
  first_visit: {
    id: 'first_visit',
    title: 'Welcome Explorer',
    description: 'First time visiting Jae\'s portfolio',
    icon: '🎯'
  },
  zone_explorer: {
    id: 'zone_explorer',
    title: 'Zone Explorer',
    description: 'Visit all zones',
    icon: '🗺️'
  },
  collector: {
    id: 'collector',
    title: 'Coin Collector',
    description: 'Collect 50 coins',
    icon: '💰'
  },
  social_butterfly: {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Send 10 chat messages',
    icon: '🦋'
  },
  return_visitor: {
    id: 'return_visitor',
    title: 'Loyal Visitor',
    description: 'Return 7 days in a row',
    icon: '🔄'
  },
  zone_master: {
    id: 'zone_master',
    title: 'Zone Master',
    description: 'Visit one zone 10 times',
    icon: '👑'
  },
  challenge_champion: {
    id: 'challenge_champion',
    title: 'Challenge Champion',
    description: 'Complete 20 daily challenges',
    icon: '🏆'
  }
};

// Generate daily challenges
const generateDailyChallenges = (): DailyChallenge[] => {
  const challenges: Omit<DailyChallenge, 'current' | 'expiresAt'>[] = [
    {
      id: 'daily_collect',
      title: 'Coin Hunter',
      description: 'Collect golden coins scattered around the world',
      type: 'collect',
      target: 6,
      reward: { xp: 50, coins: 5 }
    },
    {
      id: 'daily_visit',
      title: 'Zone Tourist',
      description: 'Visit different zones to learn about Jae',
      type: 'visit',
      target: 3,
      reward: { xp: 30, coins: 3 }
    },
    {
      id: 'daily_chat',
      title: 'Chat Enthusiast',
      description: 'Have conversations with the AI assistant',
      type: 'chat',
      target: 2,
      reward: { xp: 40, coins: 4 }
    },
    {
      id: 'daily_interact',
      title: 'Interaction Master',
      description: 'Interact with zone structures',
      type: 'interact',
      target: 4,
      reward: { xp: 35, coins: 3 }
    }
  ];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return challenges.map(challenge => ({
    ...challenge,
    current: 0,
    expiresAt: tomorrow
  }));
};

export const useGameStore = create<GameState & GameActions>()(
  devtools(
    persist((set, get) => ({
      level: 1,
      xp: 0,
      coins: 0,
      visitedZones: {
        about: false,
        education: false,
        projects: false,
        skills: false,
        contact: false,
        chat: false,
      },
      collected: {},
      // New dynamic gamification state
      dailyChallenges: [],
      achievements: ACHIEVEMENTS,
      lastChallengeRefresh: '',
      totalZoneVisits: {
        about: 0,
        education: 0,
        projects: 0,
        skills: 0,
        contact: 0,
        chat: 0,
      },
      streakDays: 0,
      lastVisitDate: '',

      addXP: (_amount) =>
        set((state) => {
          let newXP = state.xp + Math.max(0, Math.floor(_amount));
          let newLevel = state.level;

          // Level up while XP exceeds next threshold
          while (newXP >= xpForLevel(newLevel)) {
            newXP -= xpForLevel(newLevel);
            newLevel += 1;
          }

          return { xp: newXP, level: newLevel };
        }),

      addCoins: (_amount) =>
        set((state) => ({ coins: state.coins + Math.max(0, Math.floor(_amount)) })),

      markZoneVisited: (_zone) =>
        set((state) => ({
          visitedZones: { ...state.visitedZones, [_zone]: true },
        })),

      hasVisited: (_zone) => !!get().visitedZones[_zone],
      markCollected: (_id) =>
        set((state) => ({ collected: { ...state.collected, [_id]: true } })),
      isCollected: (_id) => !!get().collected[_id],

      // New dynamic gamification actions
      refreshDailyChallenges: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastChallengeRefresh !== today) {
          set({
            dailyChallenges: generateDailyChallenges(),
            lastChallengeRefresh: today
          });
        }
      },

      updateChallengeProgress: (_challengeId, _amount = 1) => {
        set((state) => ({
          dailyChallenges: state.dailyChallenges.map(challenge =>
            challenge.id === _challengeId
              ? { ...challenge, current: Math.min(challenge.current + _amount, challenge.target) }
              : challenge
          )
        }));
      },

      completeChallenge: (_challengeId) => {
        const state = get();
        const challenge = state.dailyChallenges.find(c => c.id === _challengeId);
        if (challenge && challenge.current >= challenge.target) {
          // Award rewards
          state.addXP(challenge.reward.xp);
          state.addCoins(challenge.reward.coins);

          // Remove completed challenge
          set((state) => ({
            dailyChallenges: state.dailyChallenges.filter(c => c.id !== _challengeId)
          }));
        }
      },

      unlockAchievement: (_achievementId) => {
        set((state) => ({
          achievements: {
            ...state.achievements,
            [_achievementId]: {
              ...state.achievements[_achievementId],
              unlockedAt: new Date()
            }
          }
        }));
      },

      incrementZoneVisit: (_zone) => {
        set((state) => ({
          totalZoneVisits: {
            ...state.totalZoneVisits,
            [_zone]: state.totalZoneVisits[_zone] + 1
          }
        }));
      },

      updateVisitStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();

        if (state.lastVisitDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          const newStreak = state.lastVisitDate === yesterdayStr ? state.streakDays + 1 : 1;

          set({
            lastVisitDate: today,
            streakDays: newStreak
          });
        }
      },
    }), {
      name: 'personal-website-game',
      partialize: (state) => ({
        level: state.level,
        xp: state.xp,
        coins: state.coins,
        visitedZones: state.visitedZones,
        collected: state.collected,
        // New dynamic gamification state
        dailyChallenges: state.dailyChallenges,
        achievements: state.achievements,
        lastChallengeRefresh: state.lastChallengeRefresh,
        totalZoneVisits: state.totalZoneVisits,
        streakDays: state.streakDays,
        lastVisitDate: state.lastVisitDate,
      }),
    })
  )
);

export const xpProgress = (level: number, xp: number) => {
  const needed = xpForLevel(level);
  return Math.max(0, Math.min(1, xp / needed));
};
