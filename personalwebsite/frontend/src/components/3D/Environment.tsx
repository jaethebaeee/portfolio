import { RETRO_COLORS } from './constants/colors';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { Color, Mesh, DirectionalLight, AmbientLight, MeshBasicMaterial, Vector3, InstancedMesh, Object3D } from 'three';
import { Voxel } from './models/VoxelBuilder';
import * as THREE from 'three';

// Enhanced grass material with better properties
const createGrassMaterial = () => {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(RETRO_COLORS.grass),
    roughness: 0.9,
    metalness: 0.0,
    // Add some color variation for more realistic grass
    emissive: new THREE.Color(RETRO_COLORS.grass).multiplyScalar(0.02),
    emissiveIntensity: 0.02,
  });

  // Create a subtle noise texture for grass variation
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Create grass-like texture with variation
  for (let x = 0; x < canvas.width; x += 4) {
    for (let y = 0; y < canvas.height; y += 4) {
      const noise = Math.random();
      const grassColor = new THREE.Color(RETRO_COLORS.grass);
      const variationColor = grassColor.clone().multiplyScalar(0.8 + noise * 0.4);
      ctx.fillStyle = `#${variationColor.getHexString()}`;
      ctx.fillRect(x, y, 4, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);

  material.map = texture;
  material.needsUpdate = true;

  return material;
};

export function Ground() {
  const grassMaterial = useMemo(() => createGrassMaterial(), []);
  const grassBladeRef = useRef<InstancedMesh>(null);
  const windTimeRef = useRef(0);

  // Create procedural grass blades
  const grassBlades = useMemo(() => {
    const blades: Vector3[] = [];
    const bladeCount = 150; // Reasonable number for performance

    for (let i = 0; i < bladeCount; i++) {
      // Random positions within the ground area, avoiding zone platforms
      let x, z;
      do {
        x = (Math.random() - 0.5) * 100;
        z = (Math.random() - 0.5) * 100;
      } while (
        // Avoid zone platform areas
        (Math.abs(x + 15) < 8 && Math.abs(z + 15) < 8) ||
        (Math.abs(x + 15) < 8 && Math.abs(z) < 8) ||
        (Math.abs(x - 15) < 8 && Math.abs(z) < 8) ||
        (Math.abs(x - 15) < 8 && Math.abs(z + 15) < 8)
      );

      blades.push(new Vector3(x, 0.1 + Math.random() * 0.2, z));
    }

    return blades;
  }, []);

  // Wind animation for grass
  useFrame((state) => {
    windTimeRef.current = state.clock.getElapsedTime();

    if (grassBladeRef.current) {
      const dummy = new Object3D();

      grassBlades.forEach((blade, i) => {
        const windStrength = 0.1;
        const windSpeed = 1 + Math.sin(windTimeRef.current * 2 + i * 0.1) * 0.5;
        const windOffset = Math.sin(windTimeRef.current * windSpeed + blade.x * 0.1 + blade.z * 0.1) * windStrength;

        dummy.position.set(blade.x, blade.y, blade.z);
        dummy.rotation.z = windOffset;
        dummy.scale.setScalar(0.8 + Math.random() * 0.4);
        dummy.updateMatrix();

        grassBladeRef.current!.setMatrixAt(i, dummy.matrix);
      });

      grassBladeRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Main ground plane with enhanced grass material */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120, 32, 32]} />
        <primitive object={grassMaterial} attach="material" />
      </mesh>

      {/* Procedural grass blades */}
      <instancedMesh ref={grassBladeRef} args={[undefined, undefined, grassBlades.length]}>
        <planeGeometry args={[0.1, 0.8]} />
        <meshStandardMaterial
          color={new THREE.Color(RETRO_COLORS.grass).multiplyScalar(0.9)}
          side={THREE.DoubleSide}
          transparent
          alphaTest={0.5}
          roughness={0.8}
          metalness={0.0}
        />
      </instancedMesh>

      {/* Grass patches for added detail */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 25 + Math.random() * 20;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]}
            position={[x, 0.02, z]}
            receiveShadow
          >
            <circleGeometry args={[2 + Math.random() * 3, 8]} />
            <meshStandardMaterial
              color={new THREE.Color(RETRO_COLORS.grass).multiplyScalar(0.85 + Math.random() * 0.2)}
              roughness={0.9}
              metalness={0.0}
            />
          </mesh>
        );
      })}

      {/* Enhanced grid lines with better visibility */}
      <gridHelper
        args={[120, 24, RETRO_COLORS.darkGray, RETRO_COLORS.gray]}
        position={[0, 0.01, 0]}
      />

      {/* Enhanced zone boundary markers with grass transition */}
      {/* About zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, 0.02, -15]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color={new THREE.Color(RETRO_COLORS.stone).lerp(new THREE.Color(RETRO_COLORS.grass), 0.3)}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Projects zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, 0.02, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color={new THREE.Color(RETRO_COLORS.stone).lerp(new THREE.Color(RETRO_COLORS.grass), 0.3)}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Skills zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0.02, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color={new THREE.Color(RETRO_COLORS.stone).lerp(new THREE.Color(RETRO_COLORS.grass), 0.3)}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Education zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0.02, -15]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color={new THREE.Color(RETRO_COLORS.stone).lerp(new THREE.Color(RETRO_COLORS.grass), 0.3)}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Decorative boundary markers */}
      {/* Corner markers for visual interest */}
      <Voxel position={[-25, 0.5, -25]} color={RETRO_COLORS.gold} materialType="metallic" size={0.8} />
      <Voxel position={[-25, 0.5, 25]} color={RETRO_COLORS.gold} materialType="metallic" size={0.8} />
      <Voxel position={[25, 0.5, -25]} color={RETRO_COLORS.gold} materialType="metallic" size={0.8} />
      <Voxel position={[25, 0.5, 25]} color={RETRO_COLORS.gold} materialType="metallic" size={0.8} />

      {/* Path markers between zones */}
      <Voxel position={[-20, 0.3, -20]} color={RETRO_COLORS.silver} materialType="metallic" size={0.5} />
      <Voxel position={[-10, 0.3, -20]} color={RETRO_COLORS.silver} materialType="metallic" size={0.5} />
      <Voxel position={[0, 0.3, -20]} color={RETRO_COLORS.silver} materialType="metallic" size={0.5} />
      <Voxel position={[10, 0.3, -20]} color={RETRO_COLORS.silver} materialType="metallic" size={0.5} />
      <Voxel position={[20, 0.3, -20]} color={RETRO_COLORS.silver} materialType="metallic" size={0.5} />

      {/* Additional environmental details */}
      {/* Small flowers scattered around */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 30 + Math.random() * 25;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={`flower-${i}`} position={[x, 0.1, z]}>
            {/* Flower stem */}
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.6]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            {/* Flower petals */}
            {Array.from({ length: 5 }, (_, petal) => (
              <mesh
                key={petal}
                position={[Math.cos(petal * Math.PI * 2 / 5) * 0.15, 0.6, Math.sin(petal * Math.PI * 2 / 5) * 0.15]}
                rotation={[0, 0, petal * Math.PI * 2 / 5]}
              >
                <planeGeometry args={[0.08, 0.12]} />
                <meshStandardMaterial
                  color={['#FF69B4', '#FF1493', '#DC143C', '#FF6347', '#FF4500'][petal % 5]}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
            {/* Flower center */}
            <mesh position={[0, 0.6, 0]}>
              <sphereGeometry args={[0.04]} />
              <meshStandardMaterial color="#FFD700" />
            </mesh>
          </group>
        );
      })}

      {/* Small rocks for added detail */}
      {Array.from({ length: 15 }, (_, i) => {
        const angle = (i / 15) * Math.PI * 2 + Math.random() * 0.5;
        const radius = 35 + Math.random() * 30;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh
            key={`rock-${i}`}
            position={[x, 0.1 + Math.random() * 0.1, z]}
            rotation={[Math.random() * 0.3, Math.random() * Math.PI * 2, Math.random() * 0.3]}
          >
            <dodecahedronGeometry args={[0.15 + Math.random() * 0.2]} />
            <meshStandardMaterial
              color={new THREE.Color(RETRO_COLORS.stone).multiplyScalar(0.7 + Math.random() * 0.5)}
              roughness={0.9}
              metalness={0.0}
            />
          </mesh>
        );
      })}
    </>
  );
}

export function Skybox() {
  const skyRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (skyRef.current) {
      const time = state.clock.getElapsedTime() * 0.1; // Slow time cycle

      // Subtle sky color variation (very slow)
      const skyHue = (time * 10) % 360; // Much slower cycle
      const skyColor = new Color().setHSL(skyHue / 360, 0.1, 0.7); // More subtle
      const material = skyRef.current.material as MeshBasicMaterial;
      material.color.lerp(skyColor, 0.005); // Much slower transition
    }
  });

  return (
    <>
      {/* Dynamic gradient sky */}
      <mesh ref={skyRef}>
        <sphereGeometry args={[300, 16, 16]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.3} side={2} />
      </mesh>

      {/* Subtle cloud layer */}
      <mesh position={[0, 50, 0]}>
        <sphereGeometry args={[480, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          side={2}
        />
      </mesh>
    </>
  );
}

export function Lights() {
  const directionalLightRef = useRef<DirectionalLight>(null);
  const ambientLightRef = useRef<AmbientLight>(null);

  useFrame((_state) => {
    if (directionalLightRef.current && ambientLightRef.current) {
      // const time = state.clock.getElapsedTime() * 0.05; // Slow cycle - unused

      // Fixed sun position for stable lighting
      directionalLightRef.current.position.set(10, 20, 10);
      directionalLightRef.current.intensity = 0.8;

      // Green-tinted ambient light to match background
      ambientLightRef.current.color.setHex(0x10b981);
    }
  });

  return (
    <>
      {/* Dynamic ambient light */}
      <ambientLight ref={ambientLightRef} intensity={0.4} />

      {/* Dynamic directional light (sun) */}
      <directionalLight
        ref={directionalLightRef}
        position={[10, 20, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Hemisphere light for softer lighting */}
      <hemisphereLight args={[RETRO_COLORS.blue, RETRO_COLORS.grass, 0.2]} />

      {/* Subtle zone accent lights */}
      {/* About zone - gentle blue */}
      <pointLight
        position={[-15, 8, -15]}
        intensity={0.2}
        distance={12}
        color="#4ecdc4"
        decay={2}
      />

      {/* Projects zone - soft yellow */}
      <pointLight
        position={[-15, 8, 0]}
        intensity={0.2}
        distance={12}
        color="#ffe66d"
        decay={2}
      />

      {/* Skills zone - subtle green */}
      <pointLight
        position={[15, 8, 0]}
        intensity={0.15}
        distance={10}
        color="#95e1d3"
        decay={2}
      />

      {/* Education zone - gentle purple */}
      <pointLight
        position={[15, 8, -15]}
        intensity={0.2}
        distance={12}
        color="#a8dadc"
        decay={2}
      />
    </>
  );
}

