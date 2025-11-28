import React from 'react';
import { Text, Sphere, Cylinder, Ring, Box } from '@react-three/drei';
import { ParticleField } from '../Effects/ParticleField';
import { InfoWaypoint } from '../InfoWaypoint';

export const AboutZone = React.memo(function AboutZone() {
  return (
    <group>
      {/* Central Avatar/Aura Platform */}
      <group position={[0, 0, 0]}>
        {/* Base Platform */}
        <Cylinder args={[6, 7, 0.5]} position={[0, 0.25, 0]}>
          <meshStandardMaterial color="#0a0a1a" metalness={0.8} roughness={0.2} />
        </Cylinder>

        {/* Central Energy Core */}
        <Sphere args={[1.2]} position={[0, 2, 0]}>
          <meshStandardMaterial color="#4ecdc4" metalness={0.9} roughness={0.1} emissive="#4ecdc4" emissiveIntensity={0.4} />
        </Sphere>

        {/* Rotating Energy Rings */}
        <Ring args={[2.5, 2.7, 32]} position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.6} transparent opacity={0.8} />
        </Ring>
        <Ring args={[3.8, 4.0, 32]} position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
          <meshStandardMaterial color="#4ecdc4" emissive="#4ecdc4" emissiveIntensity={0.4} transparent opacity={0.6} />
        </Ring>
        <Ring args={[5.2, 5.4, 32]} position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#00b4d8" emissive="#00b4d8" emissiveIntensity={0.3} transparent opacity={0.5} />
        </Ring>

        {/* Floating Identity Markers */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 4;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 1.2 + Math.sin(i * 0.8) * 0.3;

          const colors = ["#4ecdc4", "#00ff88", "#ff6b6b", "#ffe66d", "#4ecdc4", "#00b4d8"];
          const icons = ["🤖", "🧠", "👁️", "📊", "⚡", "🎯"];

          return (
            <group key={i} position={[x, y, z]}>
              <Sphere args={[0.12]} position={[0, 0, 0]}>
                <meshStandardMaterial color={colors[i]} emissive={colors[i]} emissiveIntensity={0.8} />
              </Sphere>
              <Text
                position={[0, 0.3, 0]}
                fontSize={0.15}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {icons[i]}
              </Text>
            </group>
          );
        })}
      </group>

      {/* Modern Info Panels */}
      <group position={[-6, 3, -3]}>
        {/* Floating Panel Background */}
        <Box args={[4.5, 3, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0a0a0a" transparent opacity={0.8} />
        </Box>

        <Text
          position={[0, 1.1, 0.06]}
          fontSize={0.45}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          ABOUT JAE
        </Text>
        <Text
          position={[0, 0.4, 0.06]}
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Computer Science & ML Researcher
        </Text>
        <Text
          position={[0, -0.1, 0.06]}
          fontSize={0.2}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
        >
          Healthcare AI & Clinical ML
        </Text>
        <Text
          position={[0, -0.6, 0.06]}
          fontSize={0.18}
          color="#ffe66d"
          anchorX="center"
          anchorY="middle"
        >
          Computer Vision • Deep Learning
        </Text>
        <Text
          position={[0, -1.1, 0.06]}
          fontSize={0.16}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          Building AI for Better Healthcare
        </Text>
      </group>

      {/* Skills Visualization Panel */}
      <group position={[6, 3, -3]}>
        {/* Floating Panel Background */}
        <Box args={[4.5, 3, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0a0a0a" transparent opacity={0.8} />
        </Box>

        <Text
          position={[0, 1.1, 0.06]}
          fontSize={0.4}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          EXPERTISE
        </Text>
        <Text
          position={[0, 0.4, 0.06]}
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Python • TypeScript • React
        </Text>
        <Text
          position={[0, -0.1, 0.06]}
          fontSize={0.18}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
        >
          Machine Learning & AI
        </Text>
        <Text
          position={[0, -0.6, 0.06]}
          fontSize={0.16}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
        >
          Computer Vision & NLP
        </Text>
        <Text
          position={[0, -1.1, 0.06]}
          fontSize={0.14}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          Full-Stack Development
        </Text>
      </group>

      {/* Interactive Energy Particles */}
      <ParticleField
        count={60}
        position={[0, 2, 0]}
        color="#4ecdc4"
        size={0.012}
        spread={10}
        physics="floating"
        interactive={true}
        mouseAttraction={1.8}
        mouseRepulsion={1.2}
        speed={0.3}
      />

      {/* Ambient Energy Waves */}
      <ParticleField
        count={25}
        position={[0, 1, 0]}
        color="#00ff88"
        size={0.008}
        spread={8}
        physics="spiral"
        interactive={false}
        speed={0.5}
      />

      {/* Atmospheric Lighting */}
      <pointLight
        position={[-8, 8, -6]}
        color="#4ecdc4"
        intensity={1.5}
        distance={18}
        decay={2}
      />

      <pointLight
        position={[8, 6, 6]}
        color="#00ff88"
        intensity={1.2}
        distance={16}
        decay={1.8}
      />

      <pointLight
        position={[0, 12, 0]}
        color="#ffffff"
        intensity={0.8}
        distance={25}
        decay={1.5}
      />

      {/* Ambient Platform Glow */}
      <rectAreaLight
        position={[0, 1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={12}
        height={12}
        color="#4ecdc4"
        intensity={0.5}
      />

      {/* Interactive Info Waypoints */}
      <InfoWaypoint
        position={[-4, 4, -2]}
        title="Clinical AI Research"
        content="Research in machine learning for healthcare, including computational oncology at MSKCC, clinical NLP systems, and biomedical signal processing at Cornell Sci Fi Lab."
        icon="🤖"
        color="#4ecdc4"
        zoneType="about"
      />

      <InfoWaypoint
        position={[4, 4, -2]}
        title="Research Leadership"
        content="Leading research in computational oncology and clinical ML, with publications in peer-reviewed journals and collaborations with top medical institutions."
        icon="🧠"
        color="#00ff88"
        zoneType="about"
      />

      <InfoWaypoint
        position={[-3, 2, 4]}
        title="Translational Research"
        content="Bridging computational methods with biological data analysis, developing ML models for large-scale health data processing and computational discovery in biomedicine."
        icon="⚡"
        color="#ff6b6b"
        zoneType="about"
      />

      <InfoWaypoint
        position={[3, 2, 4]}
        title="Multidisciplinary Research"
        content="Integrating computational biology, machine learning, and clinical medicine to develop innovative healthcare AI solutions with strong methodological foundations."
        icon="🎯"
        color="#ffe66d"
        zoneType="about"
      />

      <InfoWaypoint
        position={[0, 6, 0]}
        title="Research Vision"
        content="Advancing computational biology and healthcare AI through rigorous research, developing ML systems for biological data analysis, clinical informatics, and computational modeling of health processes."
        icon="🌟"
        color="#ffffff"
        zoneType="about"
      />
    </group>
  );
});