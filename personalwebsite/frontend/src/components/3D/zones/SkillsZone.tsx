import React from 'react';
import { Text, Sphere, Box } from '@react-three/drei';
import { OctahedronGeometry, DodecahedronGeometry } from 'three';
import { ParticleField } from '../Effects/ParticleField';
import { InfoWaypoint } from '../InfoWaypoint';

export const SkillsZone = React.memo(function SkillsZone() {
  return (
    <group>
      {/* Central Skills Matrix */}
      <group position={[0, 0, 0]}>
        {/* Base Platform */}
        <Box args={[11, 0.4, 9]} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </Box>

        {/* Central Knowledge Core */}
        <Sphere args={[1.0]} position={[0, 1.8, 0]}>
          <meshStandardMaterial color="#ffe66d" metalness={0.9} roughness={0.1} emissive="#ffe66d" emissiveIntensity={0.5} />
        </Sphere>

        {/* Skill Geometry Nodes */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 4.2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 1.2 + Math.sin(i * 0.6) * 0.3;

          const colors = ["#ffe66d", "#4ecdc4", "#ff6b6b", "#00ff88", "#4ecdc4", "#ff4757", "#3742fa", "#ffa502", "#ffe66d", "#00b4d8", "#ff6b6b", "#00ff88"];
          const skills = ["Python", "ML", "React", "AI", "TypeScript", "Cloud", "DevOps", "Vision", "Data", "Node.js", "Docker", "AWS"];

          return (
            <group key={i} position={[x, y, z]}>
              <Sphere args={[0.08]} position={[0, 0, 0]}>
                <meshStandardMaterial color={colors[i]} emissive={colors[i]} emissiveIntensity={0.7} />
              </Sphere>
              <Text
                position={[0, 0.2, 0]}
                fontSize={0.08}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {skills[i]}
              </Text>
            </group>
          );
        })}

        {/* Geometric Skill Representations */}
        <group position={[-2.5, 2.5, -2.5]}>
          <primitive object={new DodecahedronGeometry(0.3)} position={[0, 0, 0]}>
            <meshStandardMaterial color="#4ecdc4" emissive="#4ecdc4" emissiveIntensity={0.4} wireframe />
          </primitive>
          <Text position={[0, -0.6, 0]} fontSize={0.1} color="#4ecdc4" anchorX="center" anchorY="middle">ML/AI</Text>
        </group>

        <group position={[2.5, 2.8, 2.5]}>
          <primitive object={new OctahedronGeometry(0.25)} position={[0, 0, 0]}>
            <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.3} />
          </primitive>
          <Text position={[0, -0.5, 0]} fontSize={0.09} color="#ff6b6b" anchorX="center" anchorY="middle">DevOps</Text>
        </group>
      </group>

      {/* Skills Proficiency Panels */}
      <group position={[-6, 3, -3]}>
        {/* Floating Panel Background */}
        <Box args={[4.5, 3.8, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0a0a0a" transparent opacity={0.8} />
        </Box>

        <Text
          position={[0, 1.6, 0.06]}
          fontSize={0.45}
          color="#ffe66d"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          SKILLS
        </Text>
        <Text
          position={[0, 1.0, 0.06]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Programming Languages
        </Text>
        <Text
          position={[0, 0.5, 0.06]}
          fontSize={0.18}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
        >
          Python • TypeScript • JavaScript
        </Text>
        <Text
          position={[0, 0.1, 0.06]}
          fontSize={0.18}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
        >
          React • Node.js • SQL
        </Text>
        <Text
          position={[0, -0.3, 0.06]}
          fontSize={0.16}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
        >
          C++ • Rust • Go
        </Text>
      </group>

      {/* AI/ML Expertise Panel */}
      <group position={[6, 3, -3]}>
        {/* Floating Panel Background */}
        <Box args={[4.5, 3.8, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0a0a0a" transparent opacity={0.8} />
        </Box>

        <Text
          position={[0, 1.6, 0.06]}
          fontSize={0.4}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          AI/ML
        </Text>
        <Text
          position={[0, 1.0, 0.06]}
          fontSize={0.18}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Frameworks & Libraries
        </Text>
        <Text
          position={[0, 0.5, 0.06]}
          fontSize={0.16}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
        >
          TensorFlow • PyTorch • Scikit-learn
        </Text>
        <Text
          position={[0, 0.1, 0.06]}
          fontSize={0.16}
          color="#ffe66d"
          anchorX="center"
          anchorY="middle"
        >
          OpenCV • Pandas • NumPy
        </Text>
        <Text
          position={[0, -0.3, 0.06]}
          fontSize={0.16}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
        >
          Computer Vision • NLP
        </Text>
        <Text
          position={[0, -0.7, 0.06]}
          fontSize={0.14}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          Deep Learning • MLOps
        </Text>
      </group>

      {/* Skill Energy Particles */}
      <ParticleField
        count={80}
        position={[0, 2, 0]}
        color="#ffe66d"
        size={0.008}
        spread={11}
        physics="floating"
        interactive={true}
        mouseAttraction={2.0}
        mouseRepulsion={1.3}
        speed={0.3}
      />

      {/* Knowledge Flow Particles */}
      <ParticleField
        count={40}
        position={[0, 1.5, 0]}
        color="#4ecdc4"
        size={0.006}
        spread={9}
        physics="spiral"
        interactive={false}
        speed={0.4}
      />

      {/* Innovation Sparks */}
      <ParticleField
        count={25}
        position={[0, 3, 0]}
        color="#ff6b6b"
        size={0.004}
        spread={7}
        physics="trailing"
        interactive={false}
        speed={0.7}
      />

      {/* Skills Lighting */}
      <pointLight
        position={[-9, 7, -7]}
        color="#ffe66d"
        intensity={1.6}
        distance={19}
        decay={2}
      />

      <pointLight
        position={[9, 5, 7]}
        color="#4ecdc4"
        intensity={1.3}
        distance={17}
        decay={1.8}
      />

      <pointLight
        position={[0, 9, 0]}
        color="#ff6b6b"
        intensity={0.9}
        distance={21}
        decay={1.5}
      />

      {/* Ambient Skills Glow */}
      <rectAreaLight
        position={[0, 1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={11}
        height={9}
        color="#ffe66d"
        intensity={0.5}
      />

      {/* Interactive Skill Waypoints */}
      <InfoWaypoint
        position={[-5, 4, -2]}
        title="Programming Mastery"
        content="Expert-level proficiency in multiple programming paradigms and languages, from system-level C++ to modern web development."
        icon="💻"
        color="#ffe66d"
        zoneType="skills"
      />

      <InfoWaypoint
        position={[5, 4, -2]}
        title="AI/ML Expertise"
        content="Deep expertise in machine learning frameworks, computer vision, and natural language processing for healthcare applications."
        icon="🧠"
        color="#4ecdc4"
        zoneType="skills"
      />

      <InfoWaypoint
        position={[-4, 2, 4]}
        title="Full-Stack Development"
        content="Complete web development stack including modern frontend frameworks, backend APIs, databases, and cloud infrastructure."
        icon="⚡"
        color="#00ff88"
        zoneType="skills"
      />

      <InfoWaypoint
        position={[4, 2, 4]}
        title="Cloud & DevOps"
        content="Production-ready deployment, containerization, CI/CD pipelines, and scalable cloud architecture for AI applications."
        icon="☁️"
        color="#ff6b6b"
        zoneType="skills"
      />

      <InfoWaypoint
        position={[0, 5.5, 0]}
        title="Technical Leadership"
        content="Leading AI development teams, mentoring engineers, and driving innovation in healthcare technology solutions."
        icon="🎯"
        color="#ffffff"
        zoneType="skills"
      />
    </group>
  );
});