import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Mesh, Vector3, DoubleSide } from 'three';
import { use3DStore } from '@/stores/use3DStore';

export interface InfoWaypointProps {
  position: [number, number, number];
  title: string;
  content: string;
  icon?: string;
  color?: string;
  zoneType?: string;
}

export function InfoWaypoint({
  position,
  title,
  content,
  icon = "💡",
  color = "#4ecdc4",
  zoneType
}: InfoWaypointProps) {
  const meshRef = useRef<Mesh>(null);
  const textRef = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDiscovered, setHasBeenDiscovered] = useState(false);
  const { character, currentZone } = use3DStore();
  const { camera } = useThree();

  // Check if character is close enough to discover this waypoint
  useFrame(() => {
    if (!meshRef.current) return;

    const characterPos = new Vector3(...character.position);
    const waypointPos = new Vector3(...position);
    const distance = characterPos.distanceTo(waypointPos);

    // Show waypoint when character is within 3 units
    const shouldBeVisible = distance < 3 && currentZone === zoneType;
    setIsVisible(shouldBeVisible);

    if (shouldBeVisible && !hasBeenDiscovered) {
      setHasBeenDiscovered(true);
    }

    // Make waypoint face the camera
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  // Floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      {/* Main waypoint marker */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={hasBeenDiscovered ? color : "#666666"}
          emissive={hasBeenDiscovered ? color : "#333333"}
          emissiveIntensity={0.3}
          transparent
          opacity={isVisible ? 1 : 0.3}
        />
      </mesh>

      {/* Icon text */}
      <Text
        ref={textRef}
        position={[0, 0, 0.16]}
        fontSize={0.12}
        color={hasBeenDiscovered ? "#ffffff" : "#888888"}
        anchorX="center"
        anchorY="middle"
      >
        {icon}
      </Text>

      {/* Information popup */}
      {isVisible && (
        <group position={[0, 0.8, 0]}>
          {/* Background panel */}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[2, 0.8]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Border */}
          <mesh position={[0, 0, -0.04]}>
            <planeGeometry args={[2.1, 0.9]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Title */}
          <Text
            position={[0, 0.25, 0]}
            fontSize={0.08}
            color={color}
            anchorX="center"
            anchorY="middle"
          >
            {title}
          </Text>

          {/* Content */}
          <Text
            position={[0, -0.05, 0]}
            fontSize={0.05}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
          >
            {content}
          </Text>

          {/* Pointer down to waypoint */}
          <mesh position={[0, -0.45, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.05, 0.1, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      )}

      {/* Discovery effect */}
      {hasBeenDiscovered && !isVisible && (
        <mesh>
          <ringGeometry args={[0.2, 0.25, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.4}
            side={DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
