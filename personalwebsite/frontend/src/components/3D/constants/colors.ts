// Color palette for retro aesthetic with expanded options
export const RETRO_COLORS = {
  // Primary colors
  red: '#ff6b6b',
  blue: '#4ecdc4',
  green: '#95e1d3',
  yellow: '#ffe66d',
  purple: '#a8dadc',
  orange: '#f4a261',

  // Vibrant extensions
  hotPink: '#ff1493',
  neonBlue: '#00ffff',
  electricGreen: '#39ff14',
  cyberYellow: '#ffff00',
  plasmaPurple: '#8a2be2',
  coral: '#ff7f50',

  // Neutral colors
  white: '#f1faee',
  lightGray: '#e0e0e0',
  gray: '#9e9e9e',
  darkGray: '#5a5a5a',
  black: '#1a1a1a',

  // Ground/environment
  grass: '#7cb342',
  dirt: '#8d6e63',
  stone: '#78909c',
  water: '#4fc3f7',

  // Special
  gold: '#ffd700',
  silver: '#c0c0c0',
  bronze: '#cd7f32',

  // Tech colors
  matrixGreen: '#00ff41',
  tronBlue: '#00d4ff',
  cyberOrange: '#ff4500',
  synthwaveMagenta: '#ff00ff',

  // Pastel variants
  pastelBlue: '#b3e5fc',
  pastelGreen: '#c8e6c9',
  pastelYellow: '#fff9c4',
  pastelPink: '#fce4ec',
  pastelPurple: '#e1bee7',
} as const;

// Gradient utilities
export const COLOR_GRADIENTS = {
  sunset: ['#ff6b6b', '#f4a261', '#ffe66d'],
  ocean: ['#4ecdc4', '#95e1d3', '#a8dadc'],
  forest: ['#7cb342', '#95e1d3', '#4ecdc4'],
  cyberpunk: ['#ff00ff', '#00ffff', '#ffff00'],
  retroArcade: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8dadc'],
  neonGlow: ['#00ffff', '#ff00ff', '#ffff00'],
  warmTech: ['#ff4500', '#ffd700', '#00d4ff'],
} as const;

// Material color combinations
export const MATERIAL_THEMES = {
  metallic: {
    primary: RETRO_COLORS.silver,
    secondary: RETRO_COLORS.gold,
    accent: RETRO_COLORS.bronze,
  },
  emissive: {
    primary: RETRO_COLORS.neonBlue,
    secondary: RETRO_COLORS.hotPink,
    accent: RETRO_COLORS.electricGreen,
  },
  glass: {
    primary: RETRO_COLORS.tronBlue,
    secondary: RETRO_COLORS.matrixGreen,
    accent: RETRO_COLORS.coral,
  },
} as const;
