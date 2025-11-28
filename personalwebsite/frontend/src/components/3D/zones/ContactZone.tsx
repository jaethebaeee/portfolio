import React from 'react';
import { Text, Sphere, Box, Ring, Torus } from '@react-three/drei';
import { ParticleField } from '../Effects/ParticleField';
import { InfoWaypoint } from '../InfoWaypoint';

export const ContactZone = React.memo(function ContactZone() {
  return (
    <group>
      {/* Central Communication Hub */}
      <group position={[0, 0, 0]}>
        {/* Base Platform */}
        <Box args={[10, 0.5, 8]} position={[0, 0.25, 0]}>
          <meshStandardMaterial color="#0f1419" metalness={0.9} roughness={0.1} />
        </Box>

        {/* Central Communication Tower */}
        <Torus args={[0.8, 0.15, 16, 32]} position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#00b4d8" metalness={0.8} roughness={0.2} emissive="#00b4d8" emissiveIntensity={0.4} />
        </Torus>

        {/* Communication Rings */}
        <Ring args={[1.8, 2.0, 32]} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#4ecdc4" emissive="#4ecdc4" emissiveIntensity={0.5} transparent opacity={0.8} />
        </Ring>
        <Ring args={[3.2, 3.4, 32]} position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} transparent opacity={0.7} />
        </Ring>
        <Ring args={[4.8, 5.0, 32]} position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#ffe66d" emissive="#ffe66d" emissiveIntensity={0.25} transparent opacity={0.6} />
        </Ring>

        {/* Contact Channel Nodes */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 3.5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 1.5 + Math.sin(i * 0.8) * 0.2;

          const colors = ["#0077b5", "#24292e", "#00b4d8", "#ff6b6b", "#4ecdc4", "#ffe66d"];
          const icons = ["💼", "💻", "📧", "📱", "🌐", "📄"];

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

      {/* Contact Information Panels */}
      <group position={[-6, 3, -3]}>
        {/* Floating Panel Background */}
        <Box args={[4.8, 3.5, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0a0a0a" transparent opacity={0.8} />
        </Box>

        <Text
          position={[0, 1.4, 0.06]}
          fontSize={0.45}
          color="#00b4d8"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          CONTACT
        </Text>
        <Text
          position={[0, 0.8, 0.06]}
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Professional Networks
        </Text>
        <Text
          position={[0, 0.3, 0.06]}
          fontSize={0.18}
          color="#0077b5"
          anchorX="center"
          anchorY="middle"
        >
          LinkedIn: /in/jaehoon-kim
        </Text>
        <Text
          position={[0, -0.1, 0.06]}
          fontSize={0.18}
          color="#24292e"
          anchorX="center"
          anchorY="middle"
        >
          GitHub: @jae-kim-research
        </Text>
        <Text
          position={[0, -0.6, 0.06]}
          fontSize={0.16}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
        >
          Email: jk2589@cornell.edu
        </Text>
      </group>

      {/* Professional Resources Panel */}
      <group position={[6, 3, -3]}>
        {/* Floating Panel Background */}
        <Box args={[4.8, 3.5, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0a0a0a" transparent opacity={0.8} />
        </Box>

        <Text
          position={[0, 1.4, 0.06]}
          fontSize={0.4}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          RESOURCES
        </Text>
        <Text
          position={[0, 0.8, 0.06]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Portfolio & Resume
        </Text>
        <Text
          position={[0, 0.3, 0.06]}
          fontSize={0.18}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
        >
          Live Portfolio: jae.dev
        </Text>
        <Text
          position={[0, -0.1, 0.06]}
          fontSize={0.16}
          color="#ffe66d"
          anchorX="center"
          anchorY="middle"
        >
          Resume: Download PDF
        </Text>
        <Text
          position={[0, -0.6, 0.06]}
          fontSize={0.16}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
        >
          Research Papers: arXiv
        </Text>
        <Text
          position={[0, -1.1, 0.06]}
          fontSize={0.14}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
        >
          Schedule a Call
        </Text>
      </group>

      {/* Communication Signal Particles */}
      <ParticleField
        count={65}
        position={[0, 2.5, 0]}
        color="#00b4d8"
        size={0.009}
        spread={10}
        physics="floating"
        interactive={true}
        mouseAttraction={2.5}
        mouseRepulsion={1.8}
        speed={0.35}
      />

      {/* Network Connection Particles */}
      <ParticleField
        count={35}
        position={[0, 1.8, 0]}
        color="#4ecdc4"
        size={0.006}
        spread={7}
        physics="spiral"
        interactive={false}
        speed={0.5}
      />

      {/* Message Flow Particles */}
      <ParticleField
        count={20}
        position={[0, 3.5, 0]}
        color="#ffe66d"
        size={0.004}
        spread={5}
        physics="trailing"
        interactive={false}
        speed={0.6}
      />

      {/* Contact Lighting */}
      <pointLight
        position={[-8, 7, -7]}
        color="#00b4d8"
        intensity={1.7}
        distance={18}
        decay={2}
      />

      <pointLight
        position={[8, 5, 7]}
        color="#4ecdc4"
        intensity={1.3}
        distance={16}
        decay={1.8}
      />

      <pointLight
        position={[0, 9, 0]}
        color="#ffe66d"
        intensity={0.8}
        distance={20}
        decay={1.5}
      />

      {/* Ambient Communication Glow */}
      <rectAreaLight
        position={[0, 1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={10}
        height={8}
        color="#00b4d8"
        intensity={0.5}
      />

      {/* Interactive Contact Waypoints */}
      <InfoWaypoint
        position={[-5, 4, -2]}
        title="Professional Networks"
        content="Connect with me on LinkedIn and explore my code repositories on GitHub. Let's discuss AI healthcare innovation opportunities."
        icon="💼"
        color="#00b4d8"
        zoneType="contact"
      />

      <InfoWaypoint
        position={[5, 4, -2]}
        title="Portfolio & Resume"
        content="View my complete portfolio of AI healthcare projects and download my resume to learn more about my technical expertise."
        icon="📄"
        color="#4ecdc4"
        zoneType="contact"
      />

      <InfoWaypoint
        position={[-4, 2, 4]}
        title="Direct Communication"
        content="Reach out via email for collaborations, consulting opportunities, or to discuss how AI can transform healthcare."
        icon="📧"
        color="#ff6b6b"
        zoneType="contact"
      />

      <InfoWaypoint
        position={[4, 2, 4]}
        title="Research & Publications"
        content="Explore my published research in clinical machine learning, healthcare AI, and medical computer vision applications."
        icon="📚"
        color="#00ff88"
        zoneType="contact"
      />

      <InfoWaypoint
        position={[0, 5.5, 0]}
        title="Let's Connect"
        content="I'm always interested in innovative healthcare AI projects. Whether you're a researcher, entrepreneur, or healthcare professional, I'd love to hear from you."
        icon="🤝"
        color="#ffffff"
        zoneType="contact"
      />
    </group>
  );
});