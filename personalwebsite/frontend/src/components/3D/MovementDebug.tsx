import { useControls } from 'leva';

export function MovementDebug() {
  const movementControls = useControls('Movement System', {
    walkSpeed: { value: 4, min: 1, max: 10, step: 0.5 },
    runSpeed: { value: 6, min: 1, max: 15, step: 0.5 },
    sprintSpeed: { value: 10, min: 5, max: 20, step: 0.5 },
    momentumDecay: { value: 0.85, min: 0.5, max: 0.99, step: 0.01 },
    rotationSpeed: { value: 5, min: 1, max: 10, step: 0.5 },
    springTension: { value: 120, min: 50, max: 300, step: 10 },
    springFriction: { value: 14, min: 5, max: 50, step: 1 },
  });

  const dogControls = useControls('Dog AI', {
    followSpeed: { value: 5, min: 1, max: 10, step: 0.5 },
    followOffset: { value: [-1.3, 0, -0.2], step: 0.1 },
    wagSpeed: { value: 15, min: 5, max: 25, step: 1 },
    bounceSpeed: { value: 8, min: 2, max: 15, step: 1 },
  });

  const cameraControls = useControls('Camera System', {
    followDistance: { value: 12, min: 5, max: 25, step: 1 },
    followHeight: { value: 12, min: 5, max: 25, step: 1 },
    cinematicDrift: { value: 0.5, min: 0, max: 2, step: 0.1 },
    shakeIntensity: { value: 0.5, min: 0, max: 2, step: 0.1 },
  });

  // Expose controls globally for use in other components
  (window as any).movementDebug = {
    movement: movementControls,
    dog: dogControls,
    camera: cameraControls
  };

  return null; // This component only provides controls, no visual output
}

