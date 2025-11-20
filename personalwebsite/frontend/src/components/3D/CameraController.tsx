import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { OrbitControls } from '@react-three/drei';
import { use3DStore } from '@/stores/use3DStore';

export function CameraController() {
  const { camera } = useThree();
  const { character } = use3DStore();

  const targetPosition = useRef(new Vector3());
  const currentCameraPosition = useRef(new Vector3(0, 15, 15));
  const currentLookAt = useRef(new Vector3(0, 0, 0));

  // Camera effect state
  const shakeIntensity = useRef(0);
  const shakeDecay = useRef(0.9);
  const focusTransition = useRef({
    active: false,
    target: new Vector3(),
    duration: 0,
    elapsed: 0,
    easing: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // easeInOutQuad
  });

  // Free camera mode toggle
  const freeCameraMode = useRef(false);

  useEffect(() => {
    // Initial camera setup
    camera.position.copy(currentCameraPosition.current);
    camera.lookAt(currentLookAt.current);

    // Add keyboard listener for free camera toggle
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'c' || event.key === 'C') {
        freeCameraMode.current = !freeCameraMode.current;
        console.log(`Free camera mode: ${freeCameraMode.current ? 'ON' : 'OFF'}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camera]);

  useFrame((state, delta) => {
    // Skip camera follow logic if in free camera mode
    if (freeCameraMode.current) return;

    const time = state.clock.getElapsedTime();

    // Calculate camera position behind and above character
    const baseOffset = new Vector3(0, 12, 12);
    targetPosition.current.copy(character.position).add(baseOffset);

    // Add subtle cinematic drift
    const cinematicDrift = new Vector3(
      Math.sin(time * 0.1) * 0.5,
      Math.cos(time * 0.15) * 0.3,
      Math.sin(time * 0.08) * 0.5
    );
    targetPosition.current.add(cinematicDrift);

    // Handle focus transitions
    if (focusTransition.current.active) {
      focusTransition.current.elapsed += delta;
      const t = Math.min(focusTransition.current.elapsed / focusTransition.current.duration, 1);
      const easedT = focusTransition.current.easing(t);

      currentCameraPosition.current.lerp(
        new Vector3().lerpVectors(targetPosition.current, focusTransition.current.target, easedT),
        2 * delta
      );

      if (t >= 1) {
        focusTransition.current.active = false;
      }
    } else {
      // Smooth camera follow with adaptive speed
      const distance = currentCameraPosition.current.distanceTo(targetPosition.current);
      const lerpFactor = Math.min(4 * delta, distance * 2 * delta); // Adaptive smoothing
      currentCameraPosition.current.lerp(targetPosition.current, lerpFactor);
    }

    // Apply screen shake
    if (shakeIntensity.current > 0.001) {
      const shake = new Vector3(
        (Math.random() - 0.5) * shakeIntensity.current,
        (Math.random() - 0.5) * shakeIntensity.current,
        (Math.random() - 0.5) * shakeIntensity.current
      );
      currentCameraPosition.current.add(shake);
      shakeIntensity.current *= shakeDecay.current;
    }

    // Apply final camera position
    camera.position.copy(currentCameraPosition.current);

    // Dynamic look-at with subtle variation
    const lookAtOffset = new Vector3(
      Math.sin(time * 0.2) * 0.2,
      Math.sin(time * 0.3) * 0.1,
      Math.cos(time * 0.25) * 0.2
    );

    currentLookAt.current.lerp(
      new Vector3().copy(character.position).add(lookAtOffset),
      5 * delta
    );
    camera.lookAt(currentLookAt.current);
  });

  // Utility functions for camera effects (can be called from other components)
  useEffect(() => {
    // Expose camera control functions globally for other components to use
    (window as any).cameraController = {
      shake: (intensity: number = 0.5, decay: number = 0.9) => {
        shakeIntensity.current = intensity;
        shakeDecay.current = decay;
      },

      focusOn: (target: Vector3, duration: number = 2) => {
        focusTransition.current.target.copy(target);
        focusTransition.current.duration = duration;
        focusTransition.current.elapsed = 0;
        focusTransition.current.active = true;
      },

      reset: () => {
        focusTransition.current.active = false;
        shakeIntensity.current = 0;
      }
    };

    return () => {
      delete (window as any).cameraController;
    };
  }, []);

  return (
    <>
      {freeCameraMode.current && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.8}
          rotateSpeed={0.4}
          minDistance={5}
          maxDistance={200}
          maxPolarAngle={Math.PI * 0.75} // Prevent flipping upside down
        />
      )}
    </>
  );
}

