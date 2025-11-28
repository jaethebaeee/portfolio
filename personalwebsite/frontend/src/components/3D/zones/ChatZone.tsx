import React from 'react';
import { Text, RoundedBox } from '@react-three/drei';
import { BaseBuilding } from '../Buildings/BaseBuilding';

export const ChatZone = React.memo(function ChatZone() {
  return (
    <group>
      {/* Data center style pod */}
      <BaseBuilding
        width={8}
        height={5}
        depth={6}
        color="#0f172a"
        roofColor="#1e293b"
        style="tech"
        windows={false}
        position={[0, 0, 0]}
      />

      {/* Holographic chat terminal */}
      <group position={[0, 2.5, 3.4]}>
        <RoundedBox args={[4, 2, 0.3]} radius={0.2} smoothness={4}>
          <meshStandardMaterial color="#0ea5e9" emissive="#38bdf8" emissiveIntensity={0.4} roughness={0.3} />
        </RoundedBox>
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.3}
          color="#e0f2fe"
          anchorX="center"
          anchorY="middle"
        >
          AI CHAT HUB
        </Text>
        <Text
          position={[0, -0.4, 0.2]}
          fontSize={0.18}
          color="#7dd3fc"
          anchorX="center"
          anchorY="middle"
        >
          Press E to open chat
        </Text>
      </group>

      {/* Floor accent */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[6, 48]} />
        <meshStandardMaterial color="#0f172a" emissive="#0ea5e9" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
});
