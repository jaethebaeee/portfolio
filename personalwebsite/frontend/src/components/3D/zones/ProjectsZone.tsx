import React from 'react';
import { Text, Sphere, Box, Cylinder, Ring } from '@react-three/drei';
import { ParticleField } from '../Effects/ParticleField';
import { InfoWaypoint } from '../InfoWaypoint';

export const ProjectsZone = React.memo(function ProjectsZone() {
  return (
    <group>
      {/* Central Project Hub */}
      <group position={[0, 0, 0]}>
        {/* Base Platform */}
        <Box args={[14, 0.6, 10]} position={[0, 0.3, 0]}>
          <meshStandardMaterial color="#0f0f23" metalness={0.9} roughness={0.1} />
        </Box>

        {/* Central Data Tower */}
        <Cylinder args={[0.6, 0.8, 5]} position={[0, 2.5, 0]}>
          <meshStandardMaterial color="#00ff88" metalness={0.8} roughness={0.2} emissive="#00ff88" emissiveIntensity={0.3} />
        </Cylinder>

        {/* Rotating Data Rings */}
        <Ring args={[2.2, 2.4, 32]} position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#4ecdc4" emissive="#4ecdc4" emissiveIntensity={0.4} transparent opacity={0.7} />
        </Ring>
        <Ring args={[3.8, 4.0, 32]} position={[0, 2.5, 0]} rotation={[Math.PI / 2, 0, Math.PI / 3]}>
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} transparent opacity={0.6} />
        </Ring>
        <Ring args={[5.5, 5.7, 32]} position={[0, 3.5, 0]} rotation={[Math.PI / 2, 0, Math.PI / 6]}>
          <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.25} transparent opacity={0.5} />
        </Ring>

        {/* Floating Project Nodes */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 4.5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 1.8 + Math.sin(i * 0.7) * 0.4;

          const colors = ["#00ff88", "#4ecdc4", "#ff6b6b", "#ffe66d", "#00b4d8", "#ff4757", "#3742fa", "#ffa502"];
          const icons = ["🏥", "🧠", "📊", "⚡", "👁️", "🔬", "💻", "🚀"];

          return (
            <group key={i} position={[x, y, z]}>
              <Sphere args={[0.1]} position={[0, 0, 0]}>
                <meshStandardMaterial color={colors[i]} emissive={colors[i]} emissiveIntensity={0.6} />
              </Sphere>
              <Text
                position={[0, 0.25, 0]}
                fontSize={0.12}
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

      {/* Project Showcase Panels */}
      <group position={[-7, 3, -3]}>
        {/* Floating Panel Background */}
        <Box args={[4.8, 3.5, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0a0a0a" transparent opacity={0.8} />
        </Box>

        <Text
          position={[0, 1.4, 0.06]}
          fontSize={0.45}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          PROJECTS
        </Text>
        <Text
          position={[0, 0.8, 0.06]}
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          AI Healthcare Applications
        </Text>
        <Text
          position={[0, 0.3, 0.06]}
          fontSize={0.18}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
        >
          Computer Vision Research
        </Text>
        <Text
          position={[0, -0.2, 0.06]}
          fontSize={0.18}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
        >
          Clinical ML Systems
        </Text>
        <Text
          position={[0, -0.7, 0.06]}
          fontSize={0.16}
          color="#ffe66d"
          anchorX="center"
          anchorY="middle"
        >
          Full-Stack AI Solutions
        </Text>
        <Text
          position={[0, -1.2, 0.06]}
          fontSize={0.14}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          Medical Data Pipelines
        </Text>
      </group>

      {/* Technology Stack Panel */}
      <group position={[7, 3, -3]}>
        {/* Floating Panel Background */}
        <Box args={[4.8, 3.5, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0a0a0a" transparent opacity={0.8} />
        </Box>

        <Text
          position={[0, 1.4, 0.06]}
          fontSize={0.4}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          TECH STACK
        </Text>
        <Text
          position={[0, 0.8, 0.06]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Python • TensorFlow • PyTorch
        </Text>
        <Text
          position={[0, 0.3, 0.06]}
          fontSize={0.18}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
        >
          React • TypeScript • Node.js
        </Text>
        <Text
          position={[0, -0.2, 0.06]}
          fontSize={0.16}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
        >
          Docker • AWS • MongoDB
        </Text>
        <Text
          position={[0, -0.7, 0.06]}
          fontSize={0.16}
          color="#ffe66d"
          anchorX="center"
          anchorY="middle"
        >
          OpenCV • Scikit-learn
        </Text>
        <Text
          position={[0, -1.2, 0.06]}
          fontSize={0.14}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          CUDA • GPU Computing
        </Text>
      </group>

      {/* Dynamic Code Particles */}
      <ParticleField
        count={70}
        position={[0, 2.5, 0]}
        color="#00ff88"
        size={0.01}
        spread={12}
        physics="floating"
        interactive={true}
        mouseAttraction={2.2}
        mouseRepulsion={1.5}
        speed={0.4}
      />

      {/* Innovation Sparks */}
      <ParticleField
        count={35}
        position={[0, 1.5, 0]}
        color="#4ecdc4"
        size={0.007}
        spread={8}
        physics="spiral"
        interactive={false}
        speed={0.6}
      />

      {/* Data Flow Streams */}
      <ParticleField
        count={25}
        position={[0, 3.5, 0]}
        color="#ff6b6b"
        size={0.005}
        spread={6}
        physics="trailing"
        interactive={false}
        speed={0.8}
      />

      {/* Project Lighting */}
      <pointLight
        position={[-10, 8, -8]}
        color="#00ff88"
        intensity={1.8}
        distance={20}
        decay={2}
      />

      <pointLight
        position={[10, 6, 8]}
        color="#4ecdc4"
        intensity={1.4}
        distance={18}
        decay={1.8}
      />

      <pointLight
        position={[0, 10, 0]}
        color="#ff6b6b"
        intensity={1.0}
        distance={22}
        decay={1.5}
      />

      {/* Ambient Project Glow */}
      <rectAreaLight
        position={[0, 1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={14}
        height={10}
        color="#00ff88"
        intensity={0.6}
      />

      {/* Interactive Project Waypoints */}
      <InfoWaypoint
        position={[-6, 4, -2]}
        title="AI Healthcare Apps"
        content="Developing clinical decision support systems, predictive diagnostics, and AI-powered medical imaging analysis tools."
        icon="🏥"
        color="#00ff88"
        zoneType="projects"
      />

      <InfoWaypoint
        position={[6, 4, -2]}
        title="Computer Vision Research"
        content="Advanced image processing for medical diagnostics, real-time video analysis, and automated clinical workflow optimization."
        icon="👁️"
        color="#4ecdc4"
        zoneType="projects"
      />

      <InfoWaypoint
        position={[-4, 2, 4]}
        title="Clinical ML Systems"
        content="Machine learning pipelines for healthcare data, patient outcome prediction, and treatment effectiveness analysis."
        icon="🧠"
        color="#ff6b6b"
        zoneType="projects"
      />

      <InfoWaypoint
        position={[4, 2, 4]}
        title="Full-Stack AI Solutions"
        content="End-to-end AI applications combining advanced ML models with intuitive user interfaces for healthcare professionals."
        icon="⚡"
        color="#ffe66d"
        zoneType="projects"
      />

      <InfoWaypoint
        position={[0, 6.5, 0]}
        title="Innovation Hub"
        content="Central hub for cutting-edge healthcare AI projects, from research prototypes to production-ready clinical systems."
        icon="🚀"
        color="#ffffff"
        zoneType="projects"
      />
    </group>
  );
});