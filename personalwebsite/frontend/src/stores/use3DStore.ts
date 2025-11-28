import { create } from 'zustand';
import { Vector3 } from 'three';

// Zone atmosphere configurations
const ZONE_ATMOSPHERES: Record<string, ZoneAtmosphere> = {
  about: {
    ambientIntensity: 0.4,
    directionalIntensity: 0.6,
    fogColor: '#1a1a2e',
    fogNear: 35,
    fogFar: 200,
    bloomIntensity: 0.5,
    toneMappingExposure: 1.0
  },
  education: {
    ambientIntensity: 0.3,
    directionalIntensity: 0.8,
    fogColor: '#0f0f23',
    fogNear: 30,
    fogFar: 180,
    bloomIntensity: 0.3,
    toneMappingExposure: 0.9
  },
  skills: {
    ambientIntensity: 0.5,
    directionalIntensity: 0.7,
    fogColor: '#16213e',
    fogNear: 40,
    fogFar: 220,
    bloomIntensity: 0.7,
    toneMappingExposure: 1.1
  },
  projects: {
    ambientIntensity: 0.4,
    directionalIntensity: 0.9,
    fogColor: '#0f3460',
    fogNear: 25,
    fogFar: 160,
    bloomIntensity: 0.8,
    toneMappingExposure: 1.2
  },
  contact: {
    ambientIntensity: 0.6,
    directionalIntensity: 0.5,
    fogColor: '#1a1a2e',
    fogNear: 45,
    fogFar: 250,
    bloomIntensity: 0.6,
    toneMappingExposure: 0.95
  },
  games: {
    ambientIntensity: 0.8,
    directionalIntensity: 0.6,
    fogColor: '#2d1b69',
    fogNear: 40,
    fogFar: 250,
    bloomIntensity: 0.7,
    toneMappingExposure: 1.1
  },
  chat: {
    ambientIntensity: 0.5,
    directionalIntensity: 0.7,
    fogColor: '#1b1b2f',
    fogNear: 35,
    fogFar: 200,
    bloomIntensity: 0.6,
    toneMappingExposure: 1.05
  },
  pet: {
    ambientIntensity: 0.6,
    directionalIntensity: 0.5,
    fogColor: '#1a4d3a',
    fogNear: 35,
    fogFar: 200,
    bloomIntensity: 0.4,
    toneMappingExposure: 0.95
  }
};

export type ZoneType = 'about' | 'education' | 'projects' | 'skills' | 'contact' | 'games' | 'chat' | 'pet' | null;

export type TransitionState = 'idle' | 'portal' | 'cinematic' | 'atmosphere-transition';

interface Character {
  position: Vector3;
  rotation: number;
  isMoving: boolean;
  velocity: Vector3;
}

interface ZoneAtmosphere {
  ambientIntensity: number;
  directionalIntensity: number;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  bloomIntensity: number;
  toneMappingExposure: number;
}

interface ZoneTransition {
  state: TransitionState;
  fromZone: ZoneType;
  toZone: ZoneType;
  progress: number;
  duration: number;
  startTime: number;
  cameraTarget: Vector3;
  atmosphereFrom: ZoneAtmosphere;
  atmosphereTo: ZoneAtmosphere;
}

interface ThreeDState {
  // Character state
  character: Character;
  setCharacterPosition: (_position: Vector3) => void;
  setCharacterRotation: (_rotation: number) => void;
  setCharacterMoving: (_isMoving: boolean) => void;
  setCharacterVelocity: (_velocity: Vector3) => void;

  // Mobile controls state
  joystickDirection: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };
  setJoystickDirection: (_direction: { forward: boolean; backward: boolean; left: boolean; right: boolean }) => void;

  // Zone interaction
  currentZone: ZoneType;
  setCurrentZone: (_zone: ZoneType) => void;
  activeOverlay: ZoneType;
  setActiveOverlay: (_overlay: ZoneType) => void;
  canInteract: boolean;
  setCanInteract: (_can: boolean) => void;

  // Camera state
  cameraTarget: Vector3;
  setCameraTarget: (_target: Vector3) => void;

  // UI state
  showControls: boolean;
  setShowControls: (_show: boolean) => void;

  // Zone transitions
  transition: ZoneTransition;
  startZoneTransition: (_fromZone: ZoneType, _toZone: ZoneType, _cameraTarget: Vector3) => void;
  updateTransitionProgress: (_progress: number) => void;
  completeZoneTransition: () => void;
  cancelZoneTransition: () => void;
}

export const use3DStore = create<ThreeDState>((set) => ({
  // Initial character state
  character: {
    position: new Vector3(0, 0.5, 0),
    rotation: 0,
    isMoving: false,
    velocity: new Vector3(0, 0, 0),
  },
  
  setCharacterPosition: (_position) =>
    set((state) => ({
      character: { ...state.character, position: _position },
    })),

  setCharacterRotation: (_rotation) =>
    set((state) => ({
      character: { ...state.character, rotation: _rotation },
    })),

  setCharacterMoving: (_isMoving) =>
    set((state) => ({
      character: { ...state.character, isMoving: _isMoving },
    })),

  setCharacterVelocity: (_velocity) =>
    set((state) => ({
      character: { ...state.character, velocity: _velocity },
    })),

  // Mobile controls state
  joystickDirection: {
    forward: false,
    backward: false,
    left: false,
    right: false,
  },
  setJoystickDirection: (_direction) => set({ joystickDirection: _direction }),

  // Zone state
  currentZone: null,
  setCurrentZone: (_zone) => set({ currentZone: _zone }),
  activeOverlay: null,
  setActiveOverlay: (_overlay) => set({ activeOverlay: _overlay }),
  canInteract: false,
  setCanInteract: (_can) => set({ canInteract: _can }),

  // Camera state
  cameraTarget: new Vector3(0, 0.5, 0),
  setCameraTarget: (_target) => set({ cameraTarget: _target }),

  // UI state
  showControls: true,
  setShowControls: (_show) => set({ showControls: _show }),

  // Zone transitions
  transition: {
    state: 'idle' as TransitionState,
    fromZone: null,
    toZone: null,
    progress: 0,
    duration: 0,
    startTime: 0,
    cameraTarget: new Vector3(),
    atmosphereFrom: ZONE_ATMOSPHERES.about,
    atmosphereTo: ZONE_ATMOSPHERES.about
  },
  startZoneTransition: (_fromZone, _toZone, _cameraTarget) => set((_state) => ({
    transition: {
      state: 'portal',
      fromZone: _fromZone,
      toZone: _toZone,
      progress: 0,
      duration: 3.0, // 3 seconds total transition
      startTime: Date.now(),
      cameraTarget: _cameraTarget.clone(),
      atmosphereFrom: ZONE_ATMOSPHERES[_fromZone || 'about'] || ZONE_ATMOSPHERES.about,
      atmosphereTo: ZONE_ATMOSPHERES[_toZone || 'about'] || ZONE_ATMOSPHERES.about
    }
  })),
  updateTransitionProgress: (_progress) => set((state) => ({
    transition: {
      ...state.transition,
      progress: Math.max(0, Math.min(1, _progress))
    }
  })),
  completeZoneTransition: () => set((state) => ({
    transition: {
      ...state.transition,
      state: 'idle',
      progress: 0,
      fromZone: null,
      toZone: null
    }
  })),
  cancelZoneTransition: () => set((state) => ({
    transition: {
      ...state.transition,
      state: 'idle',
      progress: 0,
      fromZone: null,
      toZone: null
    }
  })),
}));
