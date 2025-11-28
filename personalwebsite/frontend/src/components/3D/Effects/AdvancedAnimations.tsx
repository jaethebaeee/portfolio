import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useSpring, animated, useTransition } from '@react-spring/three';
// Note: config is not used directly - inline config objects are used instead

interface FloatingAnimationProps {
  children: React.ReactNode;
  intensity?: number;
  speed?: number;
  axis?: 'x' | 'y' | 'z' | 'all';
}

export function FloatingAnimation({
  children,
  intensity = 0.5,
  speed = 1,
  axis = 'y'
}: FloatingAnimationProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime() * speed;

    if (axis === 'y' || axis === 'all') {
      groupRef.current.position.y += Math.sin(time) * intensity * 0.01;
    }
    if (axis === 'x' || axis === 'all') {
      groupRef.current.position.x += Math.sin(time * 0.7) * intensity * 0.005;
    }
    if (axis === 'z' || axis === 'all') {
      groupRef.current.position.z += Math.sin(time * 1.3) * intensity * 0.005;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

interface PulseAnimationProps {
  children: React.ReactNode;
  scaleRange?: [number, number];
  speed?: number;
  type?: 'uniform' | 'wave' | 'bounce';
}

export function PulseAnimation({
  children,
  scaleRange = [1, 1.2],
  speed = 1,
  type = 'uniform'
}: PulseAnimationProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime() * speed;
    let scale = scaleRange[0];

    switch (type) {
      case 'uniform':
        scale = scaleRange[0] + (Math.sin(time * 2) * 0.5 + 0.5) * (scaleRange[1] - scaleRange[0]);
        groupRef.current.scale.setScalar(scale);
        break;
      case 'wave': {
        const waveScale = scaleRange[0] + Math.sin(time) * (scaleRange[1] - scaleRange[0]);
        groupRef.current.scale.setScalar(waveScale);
        break;
      }
      case 'bounce': {
        const bounceScale = scaleRange[0] + Math.abs(Math.sin(time * 3)) * (scaleRange[1] - scaleRange[0]);
        groupRef.current.scale.setScalar(bounceScale);
        break;
      }
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

interface OrbitAnimationProps {
  children: React.ReactNode;
  radius?: number;
  speed?: number;
  axis?: 'x' | 'y' | 'z';
  center?: [number, number, number];
}

export function OrbitAnimation({
  children,
  radius = 2,
  speed = 1,
  axis = 'y',
  center = [0, 0, 0]
}: OrbitAnimationProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime() * speed;

    switch (axis) {
      case 'x':
        groupRef.current.position.x = center[0] + Math.cos(time) * radius;
        groupRef.current.position.z = center[2] + Math.sin(time) * radius;
        break;
      case 'y':
        groupRef.current.position.x = center[0] + Math.cos(time) * radius;
        groupRef.current.position.y = center[1] + Math.sin(time) * radius;
        break;
      case 'z':
        groupRef.current.position.x = center[0] + Math.cos(time) * radius;
        groupRef.current.position.y = center[1] + Math.sin(time) * radius;
        break;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

interface MorphAnimationProps {
  children: React.ReactNode;
  targetPosition?: [number, number, number];
  targetRotation?: [number, number, number];
  targetScale?: [number, number, number];
  duration?: number;
  delay?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export function MorphAnimation({
  children
}: MorphAnimationProps) {
  return <group>{children}</group>;
}

interface ElasticAnimationProps {
  children: React.ReactNode;
  trigger?: boolean;
  intensity?: number;
  duration?: number;
}

export function ElasticAnimation({
  children,
  trigger = false,
  intensity = 1,
  duration = 500
}: ElasticAnimationProps) {
  const groupRef = useRef<Group>(null);

  const { scale } = useSpring({
    scale: trigger ? [1.5, 0.8, 1.2, 0.9, 1.1, 0.95, 1] : [1, 1, 1, 1, 1, 1, 1],
    config: {
      duration,
      mass: 1,
      tension: 120 * intensity,
      friction: 14
    }
  });

  return (
    <animated.group ref={groupRef} scale={scale as any}>
      {children}
    </animated.group>
  );
}

interface TransitionEffectProps {
  isVisible: boolean;
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'rotate';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
}

export function TransitionEffect({
  isVisible,
  children,
  type = 'fade',
  direction = 'up',
  duration = 300
}: TransitionEffectProps) {
  const transitions = useTransition(isVisible, {
    from: getInitialState(type, direction),
    enter: { opacity: 1, position: [0, 0, 0], scale: 1, rotation: [0, 0, 0] },
    leave: getExitState(type, direction),
    config: { duration }
  });

  function getInitialState(type: string, direction: string) {
    const state: any = { opacity: 0 };

    switch (type) {
      case 'slide':
        switch (direction) {
          case 'up': state.position = [0, -2, 0]; break;
          case 'down': state.position = [0, 2, 0]; break;
          case 'left': state.position = [-2, 0, 0]; break;
          case 'right': state.position = [2, 0, 0]; break;
        }
        break;
      case 'scale':
        state.scale = 0;
        break;
      case 'rotate':
        state.rotation = [0, Math.PI, 0];
        break;
    }

    return state;
  }

  function getExitState(type: string, direction: string) {
    const state: any = { opacity: 0 };

    switch (type) {
      case 'slide':
        switch (direction) {
          case 'up': state.position = [0, 2, 0]; break;
          case 'down': state.position = [0, -2, 0]; break;
          case 'left': state.position = [2, 0, 0]; break;
          case 'right': state.position = [-2, 0, 0]; break;
        }
        break;
      case 'scale':
        state.scale = 0;
        break;
      case 'rotate':
        state.rotation = [0, -Math.PI, 0];
        break;
    }

    return state;
  }

  return transitions((style, item) =>
    item ? (
      <animated.group {...style}>
        {children}
      </animated.group>
    ) : null
  );
}

interface WaveAnimationProps {
  children: React.ReactNode;
  amplitude?: number;
  frequency?: number;
  speed?: number;
  axis?: 'x' | 'y' | 'z';
}

export function WaveAnimation({
  children,
  amplitude = 0.5,
  frequency = 1,
  speed = 1,
  axis = 'y'
}: WaveAnimationProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime() * speed;

    groupRef.current.children.forEach((child, index) => {
      const phase = index * frequency;
      const wave = Math.sin(time + phase) * amplitude;

      switch (axis) {
        case 'x':
          child.position.x = wave;
          break;
        case 'y':
          child.position.y = wave;
          break;
        case 'z':
          child.position.z = wave;
          break;
      }
    });
  });

  return <group ref={groupRef}>{children}</group>;
}

interface SpiralAnimationProps {
  children: React.ReactNode;
  radius?: number;
  height?: number;
  speed?: number;
  loops?: number;
}

export function SpiralAnimation({
  children,
  radius = 3,
  height = 2,
  speed = 1,
  loops = 2
}: SpiralAnimationProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime() * speed;
    const angle = time * loops;

    groupRef.current.position.x = Math.cos(angle) * radius;
    groupRef.current.position.z = Math.sin(angle) * radius;
    groupRef.current.position.y = (angle / (Math.PI * 2 * loops)) * height;

    groupRef.current.rotation.y = angle;
  });

  return <group ref={groupRef}>{children}</group>;
}

// Combined animation presets
export function GentleFloat({ children }: { children: React.ReactNode }) {
  return (
    <FloatingAnimation intensity={0.3} speed={0.5} axis="y">
      {children}
    </FloatingAnimation>
  );
}

export function EnergeticPulse({ children }: { children: React.ReactNode }) {
  return (
    <PulseAnimation scaleRange={[1, 1.3]} speed={2} type="bounce">
      {children}
    </PulseAnimation>
  );
}

export function MagicOrbit({ children }: { children: React.ReactNode }) {
  return (
    <OrbitAnimation radius={2} speed={0.5} axis="y">
      <FloatingAnimation intensity={0.2} speed={1.5} axis="y">
        {children}
      </FloatingAnimation>
    </OrbitAnimation>
  );
}
