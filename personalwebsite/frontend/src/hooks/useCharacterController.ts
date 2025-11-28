import { useEffect, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { use3DStore, ZoneType } from '@/stores/use3DStore';
import { useGameStore } from '@/stores/useGameStore';
import { clampToWorldBounds, isPointInZone, Zone } from '@/utils/collision';
import { soundManager } from '@/utils/soundManager';
import useStore from '@/stores/useStore';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  tab: boolean;
  shift: boolean;
}

const MOVEMENT_SPEEDS = {
  walk: 4,
  run: 6,
  sprint: 10
};
const ROTATION_SPEED = 5;
const MOMENTUM_DECAY = 0.85; // How quickly momentum fades
const MIN_MOMENTUM = 0.01; // Minimum momentum before stopping
const WORLD_SIZE = 100;
const FOOTSTEP_INTERVAL = 0.4; // seconds between footsteps

// Define zones in 3D space
const ZONES: (Zone & { type: ZoneType })[] = [
  { name: 'About', type: 'about', position: new Vector3(-15, 0.5, -15), size: new Vector3(8, 2, 8) },
  { name: 'Education', type: 'education', position: new Vector3(15, 0.5, -15), size: new Vector3(8, 2, 8) },
  { name: 'Projects', type: 'projects', position: new Vector3(-15, 0.5, 0), size: new Vector3(8, 2, 8) },
  { name: 'Skills', type: 'skills', position: new Vector3(15, 0.5, 0), size: new Vector3(8, 2, 8) },
  { name: 'Contact', type: 'contact', position: new Vector3(-15, 0.5, 15), size: new Vector3(8, 2, 8) },
  { name: 'Games', type: 'games', position: new Vector3(0, 0.5, 15), size: new Vector3(8, 2, 8) },
  { name: 'Pet Zone', type: 'pet', position: new Vector3(15, 0.5, 15), size: new Vector3(8, 2, 8) },
  { name: 'AI Chat', type: 'chat', position: new Vector3(0, 0.5, -15), size: new Vector3(8, 2, 8) },
];

export function useCharacterController() {
  const keysPressed = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    interact: false,
    tab: false,
    shift: false,
  });

  const currentZoneIndex = useRef(0);

  // Momentum system
  const momentum = useRef(new Vector3());
  const lastInputDirection = useRef(new Vector3());

  // Sound system
  const lastFootstepTime = useRef(0);

  const {
    character,
    setCharacterPosition,
    setCharacterRotation,
    setCharacterMoving,
    setCharacterVelocity,
    setCurrentZone,
    setCanInteract,
    setActiveOverlay,
    activeOverlay,
    currentZone,
    joystickDirection,
  } = use3DStore();

  const {
    hasVisited,
    markZoneVisited,
  } = useGameStore();
  const { setChatOpen } = useStore();

  // Accessibility: Announce zone changes and interactions
  const mountedRef = useRef(true);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;

    // Only add if component is still mounted
    if (mountedRef.current && document.body) {
      document.body.appendChild(announcement);

      // Remove after announcement - use a safer cleanup approach
      const cleanup = () => {
        if (mountedRef.current && document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      };

      setTimeout(cleanup, 1000);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Keyboard event handlers
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    // Prevent default behavior for game controls
    if (['w', 'a', 's', 'd', 'e', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'escape'].includes(key)) {
      event.preventDefault();
    }

    switch (key) {
      case 'w':
      case 'arrowup':
        keysPressed.current.forward = true;
        announceToScreenReader('Moving forward', 'polite');
        break;
      case 's':
      case 'arrowdown':
        keysPressed.current.backward = true;
        announceToScreenReader('Moving backward', 'polite');
        break;
      case 'a':
      case 'arrowleft':
        keysPressed.current.left = true;
        announceToScreenReader('Moving left', 'polite');
        break;
      case 'd':
      case 'arrowright':
        keysPressed.current.right = true;
        announceToScreenReader('Moving right', 'polite');
        break;
      case 'e':
      case ' ':
        keysPressed.current.interact = true;
        announceToScreenReader('Attempting interaction', 'polite');
        break;
      case 'escape':
        setActiveOverlay(null);
        announceToScreenReader('Closing overlay', 'polite');
        break;
      case 'h':
      case '?':
        // Help/announce controls
        announceToScreenReader('Controls: WASD or arrow keys to move, E or space to interact, Escape to close overlays, H for help', 'assertive');
        break;
      case 'tab': {
        // Zone navigation for accessibility
        event.preventDefault();
        if (event.shiftKey) {
          // Previous zone
          currentZoneIndex.current = (currentZoneIndex.current - 1 + ZONES.length) % ZONES.length;
        } else {
          // Next zone
          currentZoneIndex.current = (currentZoneIndex.current + 1) % ZONES.length;
        }
        const targetZone = ZONES[currentZoneIndex.current];
        setCharacterPosition(targetZone.position);
        setCurrentZone(targetZone.type);
        announceToScreenReader(`Navigated to ${targetZone.name} zone`, 'assertive');
        break;
      }
    }
  }, [setActiveOverlay, announceToScreenReader]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    
    switch (key) {
      case 'w':
      case 'arrowup':
        keysPressed.current.forward = false;
        break;
      case 's':
      case 'arrowdown':
        keysPressed.current.backward = false;
        break;
      case 'a':
      case 'arrowleft':
        keysPressed.current.left = false;
        break;
      case 'd':
      case 'arrowright':
        keysPressed.current.right = false;
        break;
      case 'e':
      case ' ':
        keysPressed.current.interact = false;
        break;
    }
  }, []);


  // Set up keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Update character position every frame
  useFrame((_state, delta) => {
    // Don't move if overlay is open
    if (activeOverlay) return;

    const keys = keysPressed.current;
    const isMoving = keys.forward || keys.backward || keys.left || keys.right ||
                     joystickDirection.forward || joystickDirection.backward ||
                     joystickDirection.left || joystickDirection.right;

    // Calculate movement direction (combine keyboard and joystick)
    const direction = new Vector3();
    if (keys.forward || joystickDirection.forward) direction.z -= 1;
    if (keys.backward || joystickDirection.backward) direction.z += 1;
    if (keys.left || joystickDirection.left) direction.x -= 1;
    if (keys.right || joystickDirection.right) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize();
      lastInputDirection.current.copy(direction);

      // Calculate target rotation
      const targetRotation = Math.atan2(direction.x, direction.z);

      // Smooth rotation
      let currentRotation = character.rotation;
      const rotationDiff = targetRotation - currentRotation;
      const rotationDelta = Math.sign(rotationDiff) * Math.min(Math.abs(rotationDiff), ROTATION_SPEED * delta);
      currentRotation += rotationDelta;

      setCharacterRotation(currentRotation);

      // Determine movement speed based on shift key (sprint)
      const currentSpeed = keys.shift ? MOVEMENT_SPEEDS.sprint : MOVEMENT_SPEEDS.run;

      // Add to momentum (accelerate)
      const acceleration = direction.clone().multiplyScalar(currentSpeed * delta);
      momentum.current.add(acceleration);
      momentum.current.clampLength(0, currentSpeed * 0.8); // Cap momentum
    } else {
      // Apply momentum decay when no input
      momentum.current.multiplyScalar(MOMENTUM_DECAY);

      // Stop if momentum is too low
      if (momentum.current.length() < MIN_MOMENTUM) {
        momentum.current.set(0, 0, 0);
      }
    }

    // Apply momentum-based movement
    if (momentum.current.length() > 0) {
      const newPosition = character.position.clone().add(momentum.current.clone().multiplyScalar(delta));

      // Clamp to world bounds
      const clampedPosition = clampToWorldBounds(newPosition, WORLD_SIZE);
      clampedPosition.y = 0.5; // Keep character at ground level

      setCharacterPosition(clampedPosition);
      setCharacterVelocity(momentum.current);

      // Play footstep sounds
      const currentTime = performance.now() / 1000;
      if (currentTime - lastFootstepTime.current > FOOTSTEP_INTERVAL) {
        soundManager.playFootstep(0.2);
        lastFootstepTime.current = currentTime;
      }
    }

    setCharacterMoving(isMoving);

    // Check zone detection
    let inZone = false;

    for (const zone of ZONES) {
      if (isPointInZone(character.position, zone)) {
        inZone = true;

        // Announce zone entry if it's a new zone
        if (currentZone !== zone.type) {
          soundManager.playZoneEnter(0.4); // Play zone enter sound
          announceToScreenReader(`Entered ${zone.name} zone. Press E to interact.`, 'polite');
        }

        setCurrentZone(zone.type);
        setCanInteract(true);

        // Mark zone as visited on first visit
        if (zone.type && !hasVisited(zone.type)) {
          markZoneVisited(zone.type);
          announceToScreenReader(`First time visiting ${zone.name}.`, 'polite');
        }

        // Handle interaction
        if (keys.interact && !activeOverlay) {
          if (zone.type === 'chat') {
            setChatOpen(true);
            announceToScreenReader('Opening AI chat assistant.', 'assertive');
          } else {
            setActiveOverlay(zone.type);
            announceToScreenReader(`Opened ${zone.name} information panel. Press Escape to close.`, 'assertive');
          }
          soundManager.playInteraction(0.3); // Play interaction sound

          keysPressed.current.interact = false; // Prevent repeated triggers
        }
        break;
      }
    }

    if (!inZone) {
      // Announce leaving zone
      if (currentZone) {
        announceToScreenReader('Left zone area.', 'polite');
      }
      setCurrentZone(null);
      setCanInteract(false);
    }
  });

  return {
    zones: ZONES,
  };
}
