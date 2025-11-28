import React from 'react';
import { Text, Sphere, Box, Cylinder, Ring } from '@react-three/drei';
import { ParticleField } from '../Effects/ParticleField';
import { InfoWaypoint } from '../InfoWaypoint';

export const EducationZone = React.memo(function EducationZone() {
  console.log('EducationZone is rendering');

  return (
    <group>
      {/* Modern Academic Structure - Floating Knowledge Tower */}
      <group position={[0, 0, 0]}>
        {/* Base Platform */}
        <Box args={[12, 0.5, 8]} position={[0, 0.25, 0]}>
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </Box>

        {/* Central Knowledge Pillar */}
        <Cylinder args={[0.8, 1.2, 6]} position={[0, 3, 0]}>
          <meshStandardMaterial color="#4ecdc4" metalness={0.6} roughness={0.4} emissive="#4ecdc4" emissiveIntensity={0.1} />
        </Cylinder>

        {/* Floating Data Rings */}
        <Ring args={[2, 2.2, 32]} position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} transparent opacity={0.7} />
        </Ring>
        <Ring args={[3.5, 3.7, 32]} position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#4ecdc4" emissive="#4ecdc4" emissiveIntensity={0.2} transparent opacity={0.6} />
        </Ring>
        <Ring args={[5, 5.2, 32]} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#00b4d8" emissive="#00b4d8" emissiveIntensity={0.25} transparent opacity={0.5} />
        </Ring>

        {/* Neural Network Nodes */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 4;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 1.5 + Math.sin(i) * 0.5;
          return (
            <Sphere key={i} args={[0.15]} position={[x, y, z]}>
              <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.5} />
            </Sphere>
          );
        })}
      </group>

      {/* Academic Achievement Orb */}
      <group position={[0, 8, 0]}>
        <Sphere args={[0.6]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#4ecdc4" metalness={0.8} roughness={0.2} emissive="#4ecdc4" emissiveIntensity={0.3} />
        </Sphere>
        <Text
          position={[0, 0, 0.7]}
          fontSize={0.12}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          BS/MS '25
        </Text>
      </group>

      {/* Modern Education Info Panels */}
      <group position={[-6, 3, -4]}>
        {/* Floating Panel Background */}
        <Box args={[4, 2.5, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0a0a0a" transparent opacity={0.8} />
        </Box>

        <Text
          position={[0, 0.8, 0.06]}
          fontSize={0.4}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          EDUCATION
        </Text>
        <Text
          position={[0, 0.2, 0.06]}
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          BS/MS Computer Science
        </Text>
        <Text
          position={[0, -0.3, 0.06]}
          fontSize={0.2}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
        >
          Cornell University '25
        </Text>
        <Text
          position={[0, -0.8, 0.06]}
          fontSize={0.18}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          AI/ML • Healthcare Focus
        </Text>
      </group>

      {/* Research Innovation Panel */}
      <group position={[6, 3, -4]}>
        {/* Floating Panel Background */}
        <Box args={[4, 2.5, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0a0a0a" transparent opacity={0.8} />
        </Box>

        <Text
          position={[0, 0.8, 0.06]}
          fontSize={0.4}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          RESEARCH
        </Text>
        <Text
          position={[0, 0.2, 0.06]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Peer-Reviewed Publications
        </Text>
        <Text
          position={[0, -0.2, 0.06]}
          fontSize={0.16}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
        >
          Acta Materialia (2024)
        </Text>
        <Text
          position={[0, -0.6, 0.06]}
          fontSize={0.14}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
        >
          Computational Oncology
        </Text>
        <Text
          position={[0, -1.0, 0.06]}
          fontSize={0.12}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          Clinical ML Research
        </Text>
      </group>

      {/* Digital Knowledge Particles - spiraling around the central pillar */}
      <ParticleField
        count={50}
        position={[0, 3, 0]}
        color="#4ecdc4"
        size={0.015}
        spread={8}
        physics="spiral"
        interactive={true}
        mouseAttraction={1.5}
        mouseRepulsion={0.8}
        speed={0.4}
      />

      {/* Innovation Spark Particles - floating upward */}
      <ParticleField
        count={30}
        position={[0, 2, 0]}
        color="#00ff88"
        size={0.01}
        spread={6}
        physics="floating"
        interactive={false}
        speed={0.2}
      />

      {/* Neural Network Connection Particles */}
      <ParticleField
        count={20}
        position={[0, 5, 0]}
        color="#ff6b6b"
        size={0.008}
        spread={4}
        physics="spiral"
        interactive={false}
        speed={0.6}
      />

      {/* Modern Tech Lighting */}
      <pointLight
        position={[-8, 6, -6]}
        color="#4ecdc4"
        intensity={1.2}
        distance={15}
        decay={2}
      />

      <pointLight
        position={[8, 8, 6]}
        color="#00ff88"
        intensity={0.8}
        distance={12}
        decay={1.8}
      />

      <pointLight
        position={[0, 10, 0]}
        color="#ffffff"
        intensity={0.6}
        distance={20}
        decay={1.5}
      />

      {/* Ambient Platform Glow */}
      <rectAreaLight
        position={[0, 1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={12}
        height={8}
        color="#4ecdc4"
        intensity={0.4}
      />

      {/* Interactive Info Waypoints */}
      <InfoWaypoint
        position={[-6, 4, -3]}
        title="Dual Degree Program"
        content="BS/MS Computer Science program with AI/ML specialization. Focus on healthcare applications and clinical machine learning."
        icon="🎓"
        color="#4ecdc4"
        zoneType="education"
      />

      <InfoWaypoint
        position={[6, 4, -3]}
        title="Published Research"
        content="Published in Acta Materialia (2024) on physics-enhanced ML for materials science. Additional research in computational oncology at MSKCC and biosensor analytics at Cornell Sci Fi Lab."
        icon="🧠"
        color="#00ff88"
        zoneType="education"
      />

      <InfoWaypoint
        position={[-4, 6, 4]}
        title="Knowledge Architecture"
        content="Modern representation of academic pursuit - data flows, neural networks, and digital knowledge structures symbolizing continuous learning."
        icon="🏗️"
        color="#ff6b6b"
        zoneType="education"
      />

      <InfoWaypoint
        position={[4, 2, 4]}
        title="Healthcare AI Focus"
        content="Specialized research in clinical applications: predictive diagnostics, treatment optimization, and medical language processing systems."
        icon="🏥"
        color="#4ecdc4"
        zoneType="education"
      />

      <InfoWaypoint
        position={[0, 9, 0]}
        title="Academic Achievement"
        content="Graduating 2025 with expertise in AI/ML, ready to contribute to healthcare innovation and clinical technology advancement."
        icon="🎯"
        color="#ffffff"
        zoneType="education"
      />
    </group>
  );
});