import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ZoneType } from './use3DStore';

interface GameState {
  visitedZones: Record<Exclude<ZoneType, null>, boolean>;
}

interface GameActions {
  markZoneVisited: (_zone: Exclude<ZoneType, null>) => void;
  hasVisited: (_zone: Exclude<ZoneType, null>) => boolean;
}


export const useGameStore = create<GameState & GameActions>()(
  devtools(
    persist((set, get) => ({
      visitedZones: {
        about: false,
        education: false,
        projects: false,
        skills: false,
        contact: false,
        chat: false,
        games: false,
        pet: false,
      },

      markZoneVisited: (_zone) =>
        set((state) => ({
          visitedZones: { ...state.visitedZones, [_zone]: true },
        })),

      hasVisited: (_zone) => !!get().visitedZones[_zone],
    }), {
      name: 'personal-website-zones',
      partialize: (state) => ({
        visitedZones: state.visitedZones,
      }),
    })
  )
);

