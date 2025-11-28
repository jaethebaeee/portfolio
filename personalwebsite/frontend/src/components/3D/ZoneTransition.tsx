import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, Mesh } from 'three';
import { use3DStore } from '@/stores/use3DStore';
import { RETRO_COLORS } from './constants/colors';

interface PortalRingProps {
  position: Vector3;
  radius: number;
  color: string;
  emissiveIntensity: number;
  rotationSpeed: number;
}

function PortalRing({ position, radius, color, emissiveIntensity, rotationSpeed }: PortalRingProps) {
  const ringRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      const time = state.clock.getElapsedTime();
      ringRef.current.rotation.z = time * rotationSpeed;
      ringRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.1);
    }
  });

  return (
    <mesh ref={ringRef} position={position}>
      <torusGeometry args={[radius, 0.1, 8, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

interface EnergyFieldProps {
  position: Vector3;
  size: number;
  color: string;
  intensity: number;
}

function EnergyField({ position, size, color, intensity }: EnergyFieldProps) {
  const fieldRef = useRef<Group>(null);

  useFrame((state) => {
    if (fieldRef.current) {
      const time = state.clock.getElapsedTime();
      fieldRef.current.rotation.y = time * 0.5;
      fieldRef.current.children.forEach((child, index) => {
        const mesh = child as Mesh;
        if (mesh.material) {
          const material = mesh.material as any;
          material.emissiveIntensity = intensity * (0.8 + Math.sin(time * 2 + index) * 0.2);
        }
      });
    }
  });

  return (
    <group ref={fieldRef} position={position}>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 0, 0]}>
          <sphereGeometry args={[size * (0.8 + i * 0.1), 16, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={intensity * 0.5}
            transparent
            opacity={0.1 - i * 0.015}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}

interface TeleportParticlesProps {
  position: Vector3;
  targetPosition: Vector3;
  progress: number;
  color: string;
}

function TeleportParticles({ position, targetPosition, progress, color }: TeleportParticlesProps) {
  const particlesRef = useRef<Group>(null);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, index) => {
        const mesh = child as Mesh;
        const particleProgress = (progress + index * 0.1) % 1;
        const currentPos = new Vector3().lerpVectors(position, targetPosition, particleProgress);
        mesh.position.copy(currentPos);
        mesh.position.y += Math.sin(particleProgress * Math.PI) * 2;
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            position.x + (Math.random() - 0.5) * 4,
            position.y + Math.random() * 4,
            position.z + (Math.random() - 0.5) * 4
          ]}
        >
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.0}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

export function ZoneTransition() {
  const transitionRef = useRef<Group>(null);
  const { transition, updateTransitionProgress, completeZoneTransition } = use3DStore();

  const zoneColors: Record<string, string> = {
    about: RETRO_COLORS.hotPink,
    education: RETRO_COLORS.neonBlue,
    skills: RETRO_COLORS.electricGreen,
    projects: RETRO_COLORS.cyberOrange,
    contact: RETRO_COLORS.plasmaPurple,
    chat: RETRO_COLORS.cyberYellow
  };

  useFrame(() => {
    if (transition.state !== 'idle' && transition.state !== 'cinematic') {
      const elapsed = (Date.now() - transition.startTime) / 1000;
      const progress = Math.min(elapsed / transition.duration, 1);

      updateTransitionProgress(progress);

      if (progress >= 1) {
        completeZoneTransition();
      }
    }
  });

  // Don't render if not transitioning
  if (transition.state === 'idle') {
    return null;
  }

  const fromColor = zoneColors[transition.fromZone || 'about'] || RETRO_COLORS.hotPink;
  const toColor = zoneColors[transition.toZone || 'about'] || RETRO_COLORS.hotPink;

  // Interpolate color based on progress
  const currentColor = fromColor; // For now, use from color during portal phase

  return (
    <group ref={transitionRef}>
      {/* Portal rings at origin */}
      <PortalRing
        position={new Vector3(0, 1, 0)}
        radius={2}
        color={currentColor}
        emissiveIntensity={2.0}
        rotationSpeed={2}
      />
      <PortalRing
        position={new Vector3(0, 1, 0)}
        radius={2.5}
        color={toColor}
        emissiveIntensity={1.5}
        rotationSpeed={-1.5}
      />
      <PortalRing
        position={new Vector3(0, 1, 0)}
        radius={3}
        color={currentColor}
        emissiveIntensity={1.0}
        rotationSpeed={1}
      />

      {/* Energy field */}
      <EnergyField
        position={new Vector3(0, 1, 0)}
        size={3}
        color={currentColor}
        intensity={transition.progress * 3}
      />

      {/* Teleport particles */}
      {transition.state === 'portal' && (
        <TeleportParticles
          position={new Vector3(0, 0, 0)}
          targetPosition={transition.cameraTarget}
          progress={transition.progress}
          color={toColor}
        />
      )}

      {/* Central vortex effect */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.5, 2, 4, 16, 1, true]} />
        <meshStandardMaterial
          color={currentColor}
          emissive={currentColor}
          emissiveIntensity={transition.progress * 2}
          transparent
          opacity={0.6}
          wireframe
        />
      </mesh>
    </group>
  );
}
