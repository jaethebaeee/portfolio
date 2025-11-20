import { useMemo, useEffect } from 'react';
import { Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { Collectible } from './Collectible';
import { use3DStore } from '@/stores/use3DStore';
import { useGameStore } from '@/stores/useGameStore';

type Item = { id: string; pos: [number, number, number]; color?: string };

// Generate dynamic daily collectibles based on current date
const generateDailyCollectibles = (): Item[] => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  // Use seeded random for consistent daily positions (improved algorithm)
  const seededRandom = (seed: number) => {
    // Use a simple but effective seeded random algorithm
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return (x - Math.floor(x) + 1) % 1; // Ensure result is between 0 and 1
  };

  const positions: [number, number, number][] = [
    [-17, 0.8, -17], [17, 0.8, -17], [-17, 0.8, -2], [17, 0.8, -2],
    [-17, 0.8, 17], [17, 0.8, 17], [-2, 0.8, -17], [2, 0.8, 17],
    [-12, 0.8, -12], [12, 0.8, -12], [-12, 0.8, 12], [12, 0.8, 12]
  ];

  // Shuffle positions using seeded random
  const shuffled = [...positions].sort((a, b) => {
    const hashA = seededRandom(seed + a[0] + a[1] + a[2]);
    const hashB = seededRandom(seed + b[0] + b[1] + b[2]);
    return hashA - hashB;
  });

  return shuffled.slice(0, 6).map((pos, index) => ({
    id: `daily-coin-${today.toDateString()}-${index}`,
    pos,
    color: '#ffd166' // Golden color for daily coins
  }));
};

export function CollectibleManager() {
  const { character } = use3DStore();
  const {
    isCollected,
    markCollected,
    addCoins,
    addXP,
    updateChallengeProgress,
    completeChallenge,
    refreshDailyChallenges,
    dailyChallenges
  } = useGameStore();

  // Generate daily collectibles
  const today = new Date().toDateString();
  const dailyItems = useMemo(() => generateDailyCollectibles(), [today]);

  // Refresh challenges on mount
  useEffect(() => {
    refreshDailyChallenges();
  }, [refreshDailyChallenges]);

  const allItems = useMemo(() => {
    // Include both daily collectibles and any permanent ones (none currently)
    return [...dailyItems];
  }, [dailyItems]);

  const remaining = useMemo(() => allItems.filter((i) => !isCollected(i.id)), [allItems, isCollected]);

  useFrame(() => {
    for (const item of allItems) {
      if (isCollected(item.id)) continue;
      // Distance check
      const itemPos = new Vector3(...item.pos);
      const dist = itemPos.distanceTo(character.position);
      if (dist < 1.2) {
        // Collect
        markCollected(item.id);
        addCoins(1);
        addXP(10);

        // Update daily collect challenge if it exists
        const collectChallenge = dailyChallenges.find(c => c.type === 'collect');
        if (collectChallenge) {
          updateChallengeProgress(collectChallenge.id);
          // Check if challenge is complete
          if (collectChallenge.current + 1 >= collectChallenge.target) {
            setTimeout(() => completeChallenge(collectChallenge.id), 100);
          }
        }

        // Stop checking this frame to avoid double collect
        break;
      }
    }
  });

  return (
    <group>
      {remaining.map((i) => (
        <Collectible key={i.id} position={i.pos} color={i.color} />
      ))}
    </group>
  );
}
