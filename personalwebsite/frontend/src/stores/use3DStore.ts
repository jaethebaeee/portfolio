import { create } from 'zustand';
import { Vector3 } from 'three';

export type ZoneType = 'about' | 'education' | 'projects' | 'skills' | 'contact' | 'chat' | null;

interface Character {
  position: Vector3;
  rotation: number;
  isMoving: boolean;
  velocity: Vector3;
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
}));

