// React Three Fiber imports
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Three.js imports
import {
  Mesh,
  Color,
  MeshBasicMaterial,
  DirectionalLight,
  AmbientLight,
  Points,
  PointsMaterial,
  HemisphereLight,
} from 'three';

// Environment components
import { GroundPlane } from './Environment/GroundPlane';
import { GrassBlades } from './Environment/GrassBlades';
import { GroundGrid } from './Environment/GridHelper';
import { ZoneMarkers } from './Environment/ZoneMarkers';
import { DecorativeElements } from './Environment/DecorativeElements';

// Weather effects
import { WeatherSystem } from './Effects/Weather';

export function Ground() {
  return (
    <>
      <GroundPlane />
      <GrassBlades />
      <GroundGrid />
      <ZoneMarkers />
      <DecorativeElements />
      <WeatherSystem />
    </>
  );
}

export function Skybox() {
  const skyRef = useRef<Mesh>(null);
  const cloudRef1 = useRef<Mesh>(null);
  const cloudRef2 = useRef<Mesh>(null);
  const cloudRef3 = useRef<Mesh>(null);
  const starFieldRef = useRef<Points>(null);

  // Generate star field
  const starField = useMemo(() => {
    const starCount = 200;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Random star positions on sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 380 + Math.random() * 20;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Star colors (white, blue-white, yellow-white)
      const starType = Math.random();
      if (starType < 0.6) {
        colors[i * 3] = 1.0; // r
        colors[i * 3 + 1] = 1.0; // g
        colors[i * 3 + 2] = 0.95; // b (slightly blue)
      } else if (starType < 0.85) {
        colors[i * 3] = 0.9; // r
        colors[i * 3 + 1] = 0.95; // g
        colors[i * 3 + 2] = 1.0; // b (slightly blue)
      } else {
        colors[i * 3] = 1.0; // r
        colors[i * 3 + 1] = 0.95; // g
        colors[i * 3 + 2] = 0.8; // b (slightly yellow)
      }

      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const dayTime = time * TIME_SCALE;
    const seasonTime = time * SEASON_CYCLE;
    const hourOfDay = (dayTime % (Math.PI * 2)) / (Math.PI * 2);

    if (skyRef.current) {
      // Dynamic sky color based on time and season
      let skyHue, skySaturation, skyLightness;

      if (hourOfDay < 0.2 || hourOfDay > 0.8) {
        // Night - deep blue to purple
        skyHue = 0.65 + Math.sin(seasonTime) * 0.1;
        skySaturation = 0.3 + Math.sin(seasonTime) * 0.2;
        skyLightness = 0.1 + Math.sin(seasonTime) * 0.05;
      } else if (hourOfDay < 0.3 || hourOfDay > 0.7) {
        // Dawn/dusk - golden to pink
        skyHue = 0.08 + Math.sin(seasonTime) * 0.05;
        skySaturation = 0.4 + Math.sin(seasonTime) * 0.1;
        skyLightness = 0.6 + Math.sin(seasonTime) * 0.1;
      } else {
        // Day - blue with seasonal variation
        skyHue = 0.55 + Math.sin(seasonTime) * 0.15;
        skySaturation = 0.2 + Math.sin(seasonTime) * 0.1;
        skyLightness = 0.7 + Math.sin(seasonTime) * 0.1;
      }

      const skyColor = new Color().setHSL(skyHue, skySaturation, skyLightness);
      const material = skyRef.current.material as MeshBasicMaterial;
      material.color.lerp(skyColor, 0.005);
    }

    // Stars visibility based on time of day
    if (starFieldRef.current) {
      const nightVisibility = hourOfDay < 0.2 || hourOfDay > 0.8 ? 1 : 0;
      starFieldRef.current.visible = nightVisibility > 0.1;
      if (starFieldRef.current.visible) {
        const material = starFieldRef.current.material as PointsMaterial;
        material.opacity = nightVisibility;
        material.needsUpdate = true;
      }
    }

    // Animate clouds with wind and seasonal effects
    if (cloudRef1.current) {
      cloudRef1.current.position.x = Math.sin(time * 0.02) * 20;
      cloudRef1.current.position.z = Math.cos(time * 0.015) * 15;
      // Seasonal cloud size variation
      cloudRef1.current.scale.setScalar(0.8 + Math.sin(seasonTime) * 0.4);
    }
    if (cloudRef2.current) {
      cloudRef2.current.position.x = Math.sin(time * 0.025 + 2) * 25;
      cloudRef2.current.position.z = Math.cos(time * 0.02 + 1) * 20;
      cloudRef2.current.scale.setScalar(0.9 + Math.sin(seasonTime + 1) * 0.3);
    }
    if (cloudRef3.current) {
      cloudRef3.current.position.x = Math.sin(time * 0.018 + 4) * 18;
      cloudRef3.current.position.z = Math.cos(time * 0.022 + 3) * 12;
      cloudRef3.current.scale.setScalar(0.7 + Math.sin(seasonTime + 2) * 0.5);
    }
  });

  return (
    <>
      {/* Enhanced volumetric sky with atmospheric scattering */}
      <mesh ref={skyRef}>
        <sphereGeometry args={[400, 32, 32]} />
        <meshBasicMaterial color="#7bb3d6" transparent opacity={0.85} side={2} />
      </mesh>

      {/* Star field for night time */}
      <points ref={starFieldRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starField.positions.length / 3}
            array={starField.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={starField.colors.length / 3}
            array={starField.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={starField.sizes.length}
            array={starField.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={2}
          vertexColors
          transparent
          opacity={0}
          sizeAttenuation={false}
        />
      </points>

      {/* Multiple animated cloud layers for depth */}
      <mesh ref={cloudRef1} position={[20, 60, 15]}>
        <sphereGeometry args={[80, 16, 12]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          side={2}
        />
      </mesh>

      <mesh ref={cloudRef2} position={[-25, 70, -20]}>
        <sphereGeometry args={[90, 18, 14]} />
        <meshBasicMaterial
          color="#f8f9fa"
          transparent
          opacity={0.08}
          side={2}
        />
      </mesh>

      <mesh ref={cloudRef3} position={[0, 50, 25]}>
        <sphereGeometry args={[70, 14, 10]} />
        <meshBasicMaterial
          color="#e9ecef"
          transparent
          opacity={0.15}
          side={2}
        />
      </mesh>

      {/* Atmospheric haze layer */}
      <mesh position={[0, 25, 0]}>
        <sphereGeometry args={[350, 24, 20]} />
        <meshBasicMaterial
          color="#b8d4f0"
          transparent
          opacity={0.05}
          side={2}
        />
      </mesh>
    </>
  );
}

// Global time and season state
const TIME_SCALE = 0.01; // Speed of day/night cycle
const SEASON_CYCLE = 0.005; // Speed of seasonal changes

export function Lights() {
  const directionalLightRef = useRef<DirectionalLight>(null);
  const ambientLightRef = useRef<AmbientLight>(null);
  const hemisphereLightRef = useRef<HemisphereLight>(null);

  useFrame((state) => {
    if (directionalLightRef.current && ambientLightRef.current && hemisphereLightRef.current) {
      const time = state.clock.getElapsedTime();
      const dayTime = time * TIME_SCALE; // Day/night cycle
      const seasonTime = time * SEASON_CYCLE; // Seasonal cycle

      // Enhanced sun position with seasonal variation
      const sunAngle = dayTime;
      const seasonalTilt = Math.sin(seasonTime) * 0.3; // Seasonal sun path variation
      const sunHeight = Math.max(0.1, Math.sin(sunAngle + seasonalTilt) * 0.8 + 0.2);

      // Seasonal sun distance (farther in summer, closer in winter)
      const seasonalDistance = 20 + Math.sin(seasonTime) * 8;
      const sunX = Math.cos(sunAngle) * seasonalDistance;
      const sunZ = Math.sin(sunAngle) * seasonalDistance;

      directionalLightRef.current.position.set(sunX, 15 + sunHeight * 15, sunZ);

      // Dynamic light intensity based on time and season
      const baseIntensity = 0.5 + sunHeight * 0.5;
      const seasonalIntensity = 1 + Math.sin(seasonTime) * 0.2; // Brighter in summer
      directionalLightRef.current.intensity = baseIntensity * seasonalIntensity;

      // Dynamic light color based on time of day and season
      const hourOfDay = (dayTime % (Math.PI * 2)) / (Math.PI * 2);
      let lightHue, lightSaturation;

      if (hourOfDay < 0.25 || hourOfDay > 0.75) {
        // Night/dawn/dusk - cooler tones
        lightHue = 0.6 + Math.sin(seasonTime) * 0.1; // Blue with seasonal variation
        lightSaturation = 0.1 + sunHeight * 0.2;
      } else {
        // Day - warmer tones
        lightHue = 0.1 + Math.sin(seasonTime) * 0.05; // Yellow/orange with seasonal variation
        lightSaturation = 0.15 + sunHeight * 0.3;
      }

      directionalLightRef.current.color.setHSL(lightHue, lightSaturation, 0.9);

      // Enhanced ambient light with seasonal color
      const ambientIntensity = 0.3 + sunHeight * 0.4;
      const ambientSeasonal = 1 + Math.sin(seasonTime) * 0.3;
      ambientLightRef.current.intensity = ambientIntensity * ambientSeasonal;

      // Ambient color changes with season and time
      const ambientHue = 0.55 + Math.sin(seasonTime) * 0.1 + hourOfDay * 0.1;
      ambientLightRef.current.color.setHSL(ambientHue, 0.05, 0.7);

      // Hemisphere light for sky-ground ambient
      const skyHue = 0.55 + Math.sin(seasonTime) * 0.15 + hourOfDay * 0.2;
      const groundHue = 0.25 + Math.sin(seasonTime) * 0.1; // Earthy ground tones
      hemisphereLightRef.current.color.setHSL(skyHue, 0.1, 0.8);
      hemisphereLightRef.current.groundColor.setHSL(groundHue, 0.1, 0.3);
      hemisphereLightRef.current.intensity = 0.2 + sunHeight * 0.2;
    }
  });

  return (
    <>
      {/* Enhanced ambient light with dynamic color */}
      <ambientLight ref={ambientLightRef} intensity={0.5} color="#e6f3ff" />

      {/* Improved directional light with better shadows */}
      <directionalLight
        ref={directionalLightRef}
        position={[15, 25, 15]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={80}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />

      {/* Enhanced hemisphere light with atmospheric scattering */}
      <hemisphereLight
        color={new Color("#87CEEB")}
        groundColor={new Color("#2F4F2F")}
        intensity={0.3}
      />

      {/* Enhanced zone accent lights with better positioning and effects */}
      {/* About zone - cool blue with slight animation */}
      <pointLight
        position={[-15, 10, -15]}
        intensity={0.3}
        distance={18}
        color="#4ecdc4"
        decay={1.5}
        castShadow
      />

      {/* Projects zone - warm golden with pulsing effect */}
      <pointLight
        position={[-15, 12, 0]}
        intensity={0.35}
        distance={20}
        color="#ffd700"
        decay={1.2}
        castShadow
      />

      {/* Skills zone - fresh green */}
      <pointLight
        position={[15, 9, 0]}
        intensity={0.25}
        distance={15}
        color="#7fff7f"
        decay={1.8}
        castShadow
      />

      {/* Education zone - elegant purple */}
      <pointLight
        position={[15, 11, -15]}
        intensity={0.3}
        distance={16}
        color="#dda0dd"
        decay={1.6}
        castShadow
      />

      {/* Dog zone - playful orange */}
      <pointLight
        position={[0, 8, 15]}
        intensity={0.2}
        distance={12}
        color="#ff8c00"
        decay={2}
        castShadow
      />

      {/* Contact zone - professional cyan */}
      <pointLight
        position={[0, 10, -15]}
        intensity={0.28}
        distance={14}
        color="#00ced1"
        decay={1.7}
        castShadow
      />

      {/* Games zone - vibrant magenta */}
      <pointLight
        position={[15, 9, 15]}
        intensity={0.25}
        distance={13}
        color="#ff1493"
        decay={1.9}
        castShadow
      />

      {/* Atmospheric rim lighting for buildings */}
      <spotLight
        position={[0, 30, 0]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={0.15}
        distance={100}
        color="#ffffff"
        castShadow
      />

      {/* Subtle volumetric god rays effect */}
      <spotLight
        position={[20, 25, 20]}
        target-position={[0, 0, 0]}
        angle={Math.PI / 8}
        penumbra={0.8}
        intensity={0.1}
        distance={60}
        color="#fffacd"
        castShadow={false}
      />
    </>
  );
}
