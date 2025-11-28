import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom shader materials
const hologramVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  uniform float time;

  void main() {
    vPosition = position;
    vNormal = normal;
    vUv = uv;

    // Holographic distortion
    vec3 pos = position;
    pos.y += sin(time * 2.0 + position.x * 5.0) * 0.05;
    pos.x += cos(time * 1.5 + position.z * 3.0) * 0.03;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const hologramFragmentShader = `
  uniform float time;
  uniform vec3 color;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    // Holographic scan lines
    float scanLine = sin(vPosition.y * 50.0 + time * 10.0) * 0.5 + 0.5;

    // Fresnel effect
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);

    // Color shifting based on position
    vec3 shiftedColor = color;
    shiftedColor.r += sin(time + vPosition.x * 10.0) * 0.2;
    shiftedColor.g += sin(time * 1.2 + vPosition.y * 8.0) * 0.2;
    shiftedColor.b += sin(time * 0.8 + vPosition.z * 12.0) * 0.2;

    // Combine effects
    vec3 finalColor = shiftedColor * (scanLine * 0.8 + fresnel * 0.6);

    gl_FragColor = vec4(finalColor, 0.8);
  }
`;

const energyVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  uniform float time;

  void main() {
    vPosition = position;
    vNormal = normal;
    vUv = uv;

    // Energy field distortion
    vec3 pos = position;
    float wave = sin(time * 3.0 + length(position) * 8.0) * 0.1;
    pos += normal * wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const energyFragmentShader = `
  uniform float time;
  uniform vec3 color;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    // Electric field effect
    float electric = sin(vPosition.y * 20.0 + time * 15.0) *
                    sin(vPosition.x * 15.0 + time * 12.0) *
                    sin(vPosition.z * 18.0 + time * 10.0);

    electric = electric * 0.5 + 0.5; // Normalize to 0-1

    // Energy pulse
    float pulse = sin(time * 4.0) * 0.3 + 0.7;

    // Rim lighting
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float rim = 1.0 - dot(viewDirection, vNormal);
    rim = pow(rim, 2.0);

    vec3 finalColor = color * (electric * pulse + rim * 0.5);

    gl_FragColor = vec4(finalColor, 0.9);
  }
`;

const portalVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  uniform float time;

  void main() {
    vPosition = position;
    vNormal = normal;
    vUv = uv;

    // Portal distortion
    vec3 pos = position;
    float distortion = sin(time * 2.0 + length(position.xz) * 4.0) * 0.2;
    pos.y += distortion;

    // Swirl effect
    float angle = atan(position.z, position.x);
    float radius = length(position.xz);
    angle += time * 2.0;
    pos.x = cos(angle) * radius;
    pos.z = sin(angle) * radius;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const portalFragmentShader = `
  uniform float time;
  uniform vec3 color;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    // Portal ring effect
    float radius = length(vUv - 0.5) * 2.0;
    float ring = 1.0 - abs(radius - 0.8) * 5.0;
    ring = max(0.0, ring);

    // Energy waves
    float wave1 = sin(radius * 20.0 - time * 8.0) * 0.5 + 0.5;
    float wave2 = sin(radius * 15.0 - time * 6.0) * 0.5 + 0.5;
    float waves = wave1 * wave2;

    // Color shifting
    vec3 portalColor = color;
    portalColor.r = sin(time + radius * 10.0) * 0.5 + 0.5;
    portalColor.g = sin(time * 1.3 + radius * 8.0) * 0.5 + 0.5;
    portalColor.b = sin(time * 0.7 + radius * 12.0) * 0.5 + 0.5;

    vec3 finalColor = portalColor * (ring * waves + 0.2);

    gl_FragColor = vec4(finalColor, ring * 0.8);
  }
`;

interface HologramMaterialProps {
  color?: string;
}

export function HologramMaterial({ color = "#00ffff" }: HologramMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color(color) }
  }), [color]);

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={hologramVertexShader}
      fragmentShader={hologramFragmentShader}
      uniforms={uniforms}
      transparent
      side={THREE.DoubleSide}
    />
  );
}

interface EnergyFieldMaterialProps {
  color?: string;
}

export function EnergyFieldMaterial({ color = "#00ff88" }: EnergyFieldMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color(color) }
  }), [color]);

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={energyVertexShader}
      fragmentShader={energyFragmentShader}
      uniforms={uniforms}
      transparent
      blending={THREE.AdditiveBlending}
    />
  );
}

interface PortalMaterialProps {
  color?: string;
}

export function PortalMaterial({ color = "#ff6b6b" }: PortalMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color(color) }
  }), [color]);

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={portalVertexShader}
      fragmentShader={portalFragmentShader}
      uniforms={uniforms}
      transparent
      side={THREE.DoubleSide}
    />
  );
}

// Pre-built shader components
interface HologramProps {
  position: [number, number, number];
  scale?: number;
  color?: string;
}

export function Hologram({ position, scale = 1, color = "#00ffff" }: HologramProps) {
  return (
    <mesh position={position} scale={scale}>
      <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
      <HologramMaterial color={color} />
    </mesh>
  );
}

interface EnergyFieldProps {
  position: [number, number, number];
  scale?: number;
  color?: string;
}

export function EnergyField({ position, scale = 1, color = "#00ff88" }: EnergyFieldProps) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <EnergyFieldMaterial color={color} />
    </mesh>
  );
}

interface PortalProps {
  position: [number, number, number];
  scale?: number;
  color?: string;
}

export function Portal({ position, scale = 1, color = "#ff6b6b" }: PortalProps) {
  return (
    <mesh position={position} scale={scale}>
      <ringGeometry args={[0.8, 1.2, 32]} />
      <PortalMaterial color={color} />
    </mesh>
  );
}
