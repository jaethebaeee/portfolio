// Portfolio scene constants and configurations

export const MOBILE_BREAKPOINT = 768;

// Camera configurations
export const CAMERA_CONFIG = {
  POSITION: [0, 5, 10] as [number, number, number],
  FOV: {
    DESKTOP: 60,
    MOBILE: 70,
  },
  NEAR: 0.1,
  FAR: 1000,
} as const;

// Lighting configurations
export const LIGHTING_CONFIG = {
  AMBIENT: {
    INTENSITY: 0.7,
  },
  DIRECTIONAL: {
    POSITION: [10, 15, 10] as [number, number, number],
    INTENSITY: 1.2,
    SHADOW: {
      MAP_SIZE: 1024,
      FAR: 100,
      LEFT: -50,
      RIGHT: 50,
      TOP: 50,
      BOTTOM: -50,
    },
  },
  POINT_LIGHTS: [
    {
      position: [-20, 20, -20] as [number, number, number],
      intensity: 0.5,
      color: '#6366f1',
    },
    {
      position: [20, 20, 20] as [number, number, number],
      intensity: 0.5,
      color: '#ec4899',
    },
  ],
} as const;

// Camera controls configurations
export const CONTROLS_CONFIG = {
  ENABLE_PAN: {
    DESKTOP: true,
    MOBILE: false,
  },
  ENABLE_ZOOM: true,
  ENABLE_ROTATE: true,
  DISTANCE: {
    MIN: {
      DESKTOP: 8,
      MOBILE: 10,
    },
    MAX: {
      DESKTOP: 80,
      MOBILE: 60,
    },
  },
  POLAR_ANGLE: {
    DESKTOP: Math.PI / 2.2,
    MOBILE: Math.PI / 2.5,
  },
  AUTO_ROTATE: false,
  AUTO_ROTATE_SPEED: 0.5,
  DAMPING_FACTOR: 0.05,
  ENABLE_DAMPING: true,
  TOUCHES: {
    ONE: 0, // Disable single touch rotation on mobile
    TWO: 2, // Two-finger zoom (ROTATE=2)
  },
} as const;

// Shadow configurations
export const SHADOW_CONFIG = {
  POSITION: [0, -0.5, 0] as [number, number, number],
  OPACITY: 0.4,
  SCALE: 150,
  BLUR: 2,
  FAR: 30,
} as const;

// Zone positions and configurations
export const ZONE_POSITIONS = {
  ABOUT: [-15, 0, -15] as [number, number, number],
  SKILLS: [15, 0, 0] as [number, number, number],
  EDUCATION: [15, 0, -15] as [number, number, number],
  PROJECTS: [-15, 0, 0] as [number, number, number],
  CONTACT: [-15, 0, 15] as [number, number, number],
  DOG: [15, 0, 15] as [number, number, number],
  GAMES: [0, 0, 15] as [number, number, number],
} as const;

// Canvas rendering configurations
export const CANVAS_CONFIG = {
  SHADOWS: true,
  GL: {
    ANTIALIAS: {
      DESKTOP: true,
      MOBILE: false,
    },
    ALPHA: false,
    POWER_PREFERENCE: 'high-performance' as const,
    STENCIL: false,
    DEPTH: true,
  },
  DPR: {
    DESKTOP: [1, 2] as [number, number],
    MOBILE: 1,
  },
  STYLE: {
    width: '100%',
    height: '100%',
    display: 'block',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
  },
} as const;

// Loading configurations
export const LOADING_CONFIG = {
  TRANSITION_DELAY: 500,
} as const;

// UI styling constants
export const UI_CONFIG = {
  CONTAINER: {
    STYLE: {
      width: '100vw',
      height: '100vh',
      position: 'relative' as const,
      overflow: 'hidden',
    },
  },
  EXIT_BUTTON: {
    POSITION: {
      TOP: 'top-3 right-3 md:top-4 md:right-4',
      PADDING: 'px-3 py-2 md:px-4 md:py-2.5',
    },
    STYLES: 'bg-red-500/90 hover:bg-red-500 text-white border-0 rounded-lg cursor-pointer text-sm md:text-base font-semibold z-[1000] backdrop-blur-md shadow-lg shadow-red-500/30 transition-all duration-200 ease-out hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 active:scale-95',
  },
  CONTROLS_PANEL: {
    POSITION: 'absolute bottom-3 left-3 md:bottom-5 md:left-5',
    PADDING: 'p-3 md:p-4',
    STYLES: 'bg-black/80 text-white border border-gray-600 rounded-xl text-xs md:text-sm z-[1000] max-w-[280px] md:max-w-xs backdrop-blur-md shadow-lg',
  },
} as const;

// Zone information for UI display
export const ZONE_INFO = [
  {
    name: 'About',
    description: "Jae's background",
    color: 'text-emerald-400',
  },
  {
    name: 'Skills',
    description: 'Technical expertise',
    color: 'text-blue-400',
  },
  {
    name: 'Education',
    description: 'Academic journey',
    color: 'text-purple-400',
  },
  {
    name: 'Projects',
    description: 'Work showcase',
    color: 'text-pink-400',
  },
  {
    name: 'Contact',
    description: 'Get in touch',
    color: 'text-yellow-400',
  },
  {
    name: 'Dog',
    description: 'Meet the companion',
    color: 'text-orange-400',
  },
  {
    name: 'Games',
    description: 'Mini arcade games',
    color: 'text-cyan-400',
  },
] as const;
