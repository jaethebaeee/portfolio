import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { use3DStore, ZoneType } from '@/stores/use3DStore';

interface NavigationOrbProps {
  position: [number, number, number];
  zoneName: string;
  icon: string;
  color: string;
  description: string;
  zoneId?: string;
  cameraTarget?: [number, number, number];
  onClick?: () => void;
}

function NavigationOrb({ position, zoneName, icon, color, description, onClick, zoneId, cameraTarget }: NavigationOrbProps & { zoneId?: string, cameraTarget?: [number, number, number] }) {
  const orbRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { startZoneTransition, transition, currentZone } = use3DStore();

  useFrame((state) => {
    if (orbRef.current) {
      const time = state.clock.getElapsedTime();

      // Floating animation
      orbRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.2;

      // Gentle rotation
      orbRef.current.rotation.y = Math.sin(time * 0.8) * 0.2;

      // Pulse effect when hovered or during transition to this zone
      const isTransitionTarget = transition.toZone === zoneId && transition.state !== 'idle';
      const pulseIntensity = hovered || isTransitionTarget ? 0.15 : 0.05;
      orbRef.current.scale.setScalar(1 + Math.sin(time * 6) * pulseIntensity);

      // Click feedback
      if (clicked) {
        orbRef.current.scale.setScalar(0.9);
        setTimeout(() => setClicked(false), 100);
      }

      // Highlight current zone
      if (currentZone === zoneId && transition.state === 'idle') {
        orbRef.current.scale.setScalar(1.1);
      }
    }
  });

  const handleClick = () => {
    if (transition.state !== 'idle') return; // Prevent clicks during transitions

    setClicked(true);

    if (zoneId && cameraTarget && currentZone !== zoneId) {
      // Start the zone transition
      startZoneTransition(
        currentZone,
        zoneId as any,
        new THREE.Vector3(...cameraTarget)
      );
    }

    onClick?.();
  };

  return (
    <group
      ref={orbRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Main navigation orb */}
      <mesh>
        <sphereGeometry args={[0.6, 16, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.3}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner glowing core */}
      <mesh>
        <sphereGeometry args={[0.3, 12, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Zone icon */}
      <Text
        position={[0, 0, 0.4]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {icon}
      </Text>

      {/* Zone name */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {zoneName}
      </Text>

      {/* Hover indicator ring */}
      {hovered && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.0, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {/* Connection line to center (optional visual guide) */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 3, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={`particle-${i}`}
          position={[
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          ]}
        >
          <sphereGeometry args={[0.03, 6, 4]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.4}
            emissive={color}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}

      {/* Tooltip on hover */}
      {hovered && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 max-w-xs text-white shadow-lg">
            <h4 className="font-bold text-blue-400 mb-1">{zoneName}</h4>
            <p className="text-sm text-gray-300">{description}</p>
            <p className="text-xs text-gray-500 mt-1">Click to teleport</p>
          </div>
        </Html>
      )}
    </group>
  );
}

interface ZoneNavigationProps {
  currentZone?: ZoneType;
  onZoneChange?: (_zoneId: ZoneType) => void;
}

export function ZoneNavigation({ currentZone, onZoneChange }: ZoneNavigationProps) {
  const navRef = useRef<THREE.Group>(null);

  // Zone navigation data
  const zones = [
    {
      id: 'about',
      name: 'About Jae',
      icon: '👤',
      color: '#ff1493',
      position: [-15, 8, -15] as [number, number, number],
      cameraTarget: [0, 0, -10] as [number, number, number],
      description: 'Learn about Jae\'s background, experience, and journey in AI research.'
    },
    {
      id: 'education',
      name: 'Education',
      icon: '🎓',
      color: '#B31B1B',
      position: [15, 8, -15] as [number, number, number],
      cameraTarget: [10, 0, -10] as [number, number, number],
      description: 'Explore Jae\'s academic journey from Seoul National to Cornell University.'
    },
    {
      id: 'skills',
      name: 'Skills',
      icon: '⚡',
      color: '#a78bfa',
      position: [15, 8, 0] as [number, number, number],
      cameraTarget: [10, 0, 0] as [number, number, number],
      description: 'Discover Jae\'s technical expertise in AI/ML, healthcare, and full-stack development.'
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: '🚀',
      color: '#4ecdc4',
      position: [-15, 8, 0] as [number, number, number],
      cameraTarget: [-10, 0, 0] as [number, number, number],
      description: 'Browse Jae\'s innovative projects in healthcare AI, ML research, and web development.'
    },
    {
      id: 'contact',
      name: 'Contact',
      icon: '📡',
      color: '#4ecdc4',
      position: [-15, 8, 15] as [number, number, number],
      cameraTarget: [-10, 0, 10] as [number, number, number],
      description: 'Get in touch with Jae for collaborations, opportunities, and professional discussions.'
    },
    {
      id: 'games',
      name: 'Games',
      icon: '🎮',
      color: '#ff6b6b',
      position: [0, 8, 15] as [number, number, number],
      cameraTarget: [0, 0, 15] as [number, number, number],
      description: 'Explore Jae\'s game development projects and interactive experiences.'
    },
    {
      id: 'chat',
      name: 'AI Chat',
      icon: '🤖',
      color: '#4ecdc4',
      position: [0, 8, -15] as [number, number, number],
      cameraTarget: [0, 0, -15] as [number, number, number],
      description: 'Talk with the AI assistant about Jae\'s work and background.'
    },
    {
      id: 'pet',
      name: 'Pet Zone',
      icon: '🐕',
      color: '#8B4513',
      position: [15, 8, 15] as [number, number, number],
      cameraTarget: [15, 0, 15] as [number, number, number],
      description: 'Meet Jae\'s loyal digital companion and enjoy some relaxing interaction.'
    }
  ];

  useFrame((state) => {
    if (navRef.current) {
      const time = state.clock.getElapsedTime();
      // Gentle overall rotation of the navigation system
      navRef.current.rotation.y = Math.sin(time * 0.1) * 0.05;
    }
  });

  return (
    <group ref={navRef}>
      {/* Central navigation hub */}
      <group position={[0, 10, 0]}>
        <mesh>
          <sphereGeometry args={[0.8, 16, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#4ecdc4"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Hub label */}
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.2}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          ZONE NAVIGATION
        </Text>

        {/* Connecting rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.05, 8, 16]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#a78bfa"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>

      {/* Navigation orbs for each zone */}
      {zones.map((zone) => (
        <NavigationOrb
          key={zone.id}
          position={zone.position}
          zoneName={zone.name}
          icon={zone.icon}
          color={zone.color}
          description={zone.description}
          zoneId={zone.id}
          cameraTarget={zone.cameraTarget}
          onClick={() => onZoneChange?.(zone.id as ZoneType)}
        />
      ))}

      {/* Navigation instructions */}
      <Html position={[0, 6, 0]} center>
        <div className="bg-gray-900/90 border border-gray-700 rounded-lg p-4 max-w-md text-white text-center">
          <h3 className="text-lg font-bold text-blue-400 mb-2">🌐 Zone Navigation</h3>
          <p className="text-sm text-gray-300 mb-3">
            Click on the floating orbs above to quickly teleport between different areas of Jae's portfolio.
          </p>
          <div className="text-xs text-gray-500">
            Current Zone: <span className="text-blue-400 font-semibold">
              {currentZone ? zones.find(z => z.id === currentZone)?.name : 'Central Hub'}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}
