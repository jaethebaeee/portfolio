import React, { useRef, useEffect, useState, createContext, useContext } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import * as THREE from 'three';

// Audio context for managing sound effects and ambient audio
/* eslint-disable no-unused-vars */
interface AudioContextType {
  playSound: (soundId: string, position?: Vector3, volume?: number) => void;
  setAmbientTrack: (trackId: string, volume?: number) => void;
  setMasterVolume: (volume: number) => void;
  getListenerPosition: () => Vector3;
  setListenerPosition: (position: Vector3) => void;
}
/* eslint-enable no-unused-vars */

const AudioContext = createContext<AudioContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

  // Sound definitions (in a real implementation, these would be audio files)
type SoundDefinition = {
  frequency: number | number[];
  duration: number;
  type: string;
  loop?: boolean;
};

const SOUND_LIBRARY: Record<string, SoundDefinition> = {
  // UI Sounds
  'ui_hover': { frequency: 800, duration: 0.1, type: 'sine' },
  'ui_click': { frequency: 600, duration: 0.2, type: 'square' },
  'ui_success': { frequency: [523, 659, 784], duration: 0.3, type: 'sine' },
  'ui_error': { frequency: [200, 150], duration: 0.4, type: 'sawtooth' },

  // Environmental Sounds
  'ambient_wind': { frequency: [50, 80, 120], duration: 2, type: 'sine', loop: true },
  'ambient_nature': { frequency: [220, 330, 440], duration: 3, type: 'triangle', loop: true },
  'water_drip': { frequency: [400, 300], duration: 0.3, type: 'sine' },

  // Character Sounds
  'footstep': { frequency: [100, 150], duration: 0.2, type: 'noise' },
  'jump': { frequency: [300, 400, 500], duration: 0.4, type: 'square' },
  'land': { frequency: [150, 100], duration: 0.3, type: 'sawtooth' },

  // Interactive Sounds
  'crystal_activate': { frequency: [600, 800, 1000], duration: 1, type: 'sine' },
  'portal_open': { frequency: [200, 300, 400, 500], duration: 2, type: 'sawtooth' },
  'energy_charge': { frequency: [220, 330, 440, 550], duration: 1.5, type: 'triangle' },

  // Zone Sounds
  'zone_enter': { frequency: [440, 554, 659], duration: 0.8, type: 'sine' },
  'zone_exit': { frequency: [659, 554, 440], duration: 0.8, type: 'sine' },
};

interface AudioProviderProps {
  children: React.ReactNode;
  masterVolume?: number;
  enableSpatialAudio?: boolean;
}

export function AudioProvider({
  children,
  masterVolume = 0.5,
  enableSpatialAudio = true
}: AudioProviderProps) {
  const [currentAmbientTrack, setCurrentAmbientTrack] = useState<string | null>(null);
  const [listenerPosition, setListenerPosition] = useState(new Vector3(0, 0, 0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSoundsRef = useRef<Map<string, OscillatorNode>>(new Map());

  // Initialize Web Audio API
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const generateTone = (
    context: AudioContext,
    frequency: number | number[],
    duration: number,
    type: 'sine' | 'square' | 'sawtooth' | 'triangle' | 'custom',
    volume: number = 1
  ): OscillatorNode => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Handle frequency arrays for chords
    if (Array.isArray(frequency)) {
      // Create multiple oscillators for chord
      frequency.forEach((freq, index) => {
        const osc = context.createOscillator();
        const gain = context.createGain();

        osc.frequency.setValueAtTime(freq, context.currentTime);
        osc.type = type;

        gain.gain.setValueAtTime(volume * masterVolume * 0.3, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

        osc.connect(gain);
        gain.connect(context.destination);

        osc.start(context.currentTime + index * 0.05);
        osc.stop(context.currentTime + duration + index * 0.05);
      });

      return oscillator; // Return first oscillator as handle
    } else {
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume * masterVolume, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);

      return oscillator;
    }
  };

  const playSound = (soundId: string, position?: Vector3, volume: number = 1): void => {
    if (!audioContextRef.current) return;

    const sound = SOUND_LIBRARY[soundId as keyof typeof SOUND_LIBRARY];
    if (!sound) {
      console.warn(`Sound '${soundId}' not found in library`);
      return;
    }

    // Calculate spatial audio if enabled
    let finalVolume = volume;
    if (enableSpatialAudio && position) {
      const distance = listenerPosition.distanceTo(position);
      const maxDistance = 20;
      finalVolume *= Math.max(0, 1 - (distance / maxDistance));
    }

    const source = generateTone(
      audioContextRef.current,
      sound.frequency,
      sound.duration,
      sound.type as 'sine' | 'square' | 'sawtooth' | 'triangle' | 'custom',
      finalVolume
    );

    if (sound.loop) {
      activeSoundsRef.current.set(soundId, source);
    }
  };

  const setAmbientTrack = (trackId: string, volume: number = 0.3): void => {
    // Stop current ambient track
    if (currentAmbientTrack && activeSoundsRef.current.has(currentAmbientTrack)) {
      const oldSource = activeSoundsRef.current.get(currentAmbientTrack);
      if (oldSource) {
        oldSource.stop();
        activeSoundsRef.current.delete(currentAmbientTrack);
      }
    }

    // Start new ambient track
    setCurrentAmbientTrack(trackId);
    playSound(trackId, undefined, volume);
  };

  const setMasterVolume = (_volume: number): void => {
    // This would affect all active sounds in a real implementation
    console.log(`Master volume set to: ${_volume}`);
  };

  const contextValue: AudioContextType = {
    playSound,
    setAmbientTrack,
    setMasterVolume,
    getListenerPosition: () => listenerPosition,
    setListenerPosition
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}

interface SoundEmitterProps {
  soundId: string;
  position?: [number, number, number];
  triggerDistance?: number;
  volume?: number;
  autoPlay?: boolean;
  children?: React.ReactNode;
}

export function SoundEmitter({
  soundId,
  position = [0, 0, 0],
  triggerDistance = 5,
  volume = 1,
  autoPlay = false,
  children
}: SoundEmitterProps) {
  const { playSound, getListenerPosition } = useAudio();
  const [lastPlayed, setLastPlayed] = useState(0);

  useFrame(() => {
    const listenerPos = getListenerPosition();
    const emitterPos = new Vector3(...position);
    const distance = listenerPos.distanceTo(emitterPos);

    if (distance <= triggerDistance) {
      const now = Date.now();
      const cooldown = 2000; // 2 second cooldown

      if (now - lastPlayed > cooldown) {
        playSound(soundId, emitterPos, volume);
        setLastPlayed(now);
      }
    }
  });

  useEffect(() => {
    if (autoPlay) {
      playSound(soundId, new Vector3(...position), volume);
    }
  }, [autoPlay, soundId, position, volume, playSound]);

  return (
    <group position={position}>
      {/* Visual indicator for sound emitter */}
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color="#ffff00"
          transparent
          opacity={0.5}
          emissive="#ffff00"
          emissiveIntensity={0.2}
        />
      </mesh>
      {children}
    </group>
  );
}

interface AudioVisualizerProps {
  position: [number, number, number];
  bars?: number;
  height?: number;
  color?: string;
}

export function AudioVisualizer({
  position,
  bars = 16,
  height = 2,
  color = "#00ff88"
}: AudioVisualizerProps) {
  const barsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!barsRef.current) return;

    const time = state.clock.getElapsedTime();

    barsRef.current.children.forEach((child, index: number) => {
      if (!(child instanceof THREE.Mesh)) return;
      const bar = child as THREE.Mesh;
      
      // Create fake audio data based on time and index
      const frequency = Math.sin(time * 2 + index * 0.5) * 0.5 + 0.5;
      const amplitude = Math.sin(time * 3 + index * 0.3) * 0.3 + 0.7;

      const barHeight = frequency * amplitude * height;
      bar.scale.y = barHeight;

      // Color based on amplitude
      const material = bar.material as THREE.MeshStandardMaterial;
      const intensity = amplitude * 0.8 + 0.2;
      if (material.emissive) {
        material.emissive.setStyle(color);
        material.emissiveIntensity = intensity;
      }
    });
  });

  return (
    <group ref={barsRef} position={position}>
      {Array.from({ length: bars }, (_, i) => (
        <mesh key={i} position={[i * 0.15 - (bars * 0.15) / 2, 0, 0]}>
          <boxGeometry args={[0.1, 1, 0.05]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

interface AudioReactiveMaterialProps {
  soundId?: string;
  baseColor?: string;
  reactiveColor?: string;
  intensity?: number;
  children: React.ReactNode;
}

export function AudioReactiveMaterial({
  soundId,
  baseColor = "#ffffff",
  reactiveColor = "#00ff88",
  intensity = 1,
  children
}: AudioReactiveMaterialProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { playSound } = useAudio();
  const [isReacting, setIsReacting] = useState(false);

  const handleInteraction = () => {
    setIsReacting(true);
    if (soundId) {
      playSound(soundId);
    }

    // Reset reaction after animation
    setTimeout(() => setIsReacting(false), 1000);
  };

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.MeshStandardMaterial;

        if (isReacting) {
          // Pulse between colors
          const time = Date.now() * 0.005;
          const pulse = (Math.sin(time) + 1) * 0.5;

          // Interpolate between base and reactive colors
          material.color.lerpColors(
            new THREE.Color(baseColor),
            new THREE.Color(reactiveColor),
            pulse
          );

          material.emissive.setStyle(reactiveColor);
          material.emissiveIntensity = pulse * intensity;
        } else {
          material.color.setStyle(baseColor);
          material.emissiveIntensity = 0.1;
        }
      }
    });
  });

  return (
    <group ref={groupRef} onClick={handleInteraction}>
      {children}
    </group>
  );
}
