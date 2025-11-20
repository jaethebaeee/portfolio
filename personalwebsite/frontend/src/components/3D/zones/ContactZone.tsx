import React, { useState } from 'react';
import { VoxelStructure } from '../models/VoxelBuilder';
import { RETRO_COLORS } from '../constants/colors';
import { Text, Html } from '@react-three/drei';
import { InfoWaypoint } from '../InfoWaypoint';
import { ZoneLighting } from '../ZoneLighting';
import { VoxelAdder } from './voxelHelpers';

interface ContactButtonProps {
  position: [number, number, number];
  icon: string;
  label: string;
  color: string;
  onClick: () => void;
}

function ContactButton({ position, icon, label, color, onClick }: ContactButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Button base */}
      <mesh>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 16]} />
        <meshStandardMaterial
          color={hovered ? "#ffffff" : color}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Button icon */}
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {icon}
      </Text>

      {/* Button label */}
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.15}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {label}
      </Text>
    </group>
  );
}

export function ContactZone() {
  const [contactModal, setContactModal] = useState<string | null>(null);

  // Enhanced communication hub architecture
  const voxels = React.useMemo(() => {
    const contactVoxels: Array<{
      pos: [number, number, number];
      color: string;
      materialType?: 'standard' | 'metallic' | 'emissive' | 'glass' | 'animated';
      emissiveIntensity?: number;
      metalness?: number;
      roughness?: number;
    }> = [];

    const addVoxel: VoxelAdder = (
      position: [number, number, number],
      color: string,
      materialType?: 'standard' | 'metallic' | 'emissive' | 'glass' | 'animated',
      emissiveIntensity?: number,
      metalness?: number,
      roughness?: number
    ) => {
      contactVoxels.push({
        pos: position,
        color,
        materialType,
        emissiveIntensity,
        metalness,
        roughness
      });
    };

    // Circular communication platform
    for (let x = -10; x <= 10; x++) {
      for (let z = -10; z <= 10; z++) {
        const distance = Math.sqrt(x * x + z * z);
        if (distance <= 10) {
          const isEdge = distance > 8;
          if (isEdge) {
            addVoxel([x, 0, z], '#4ecdc4', 'emissive', 0.3);
          } else {
            addVoxel([x, 0, z], RETRO_COLORS.lightGray, 'metallic', 0.1, 0.8, 0.2);
          }
        }
      }
    }

    // Central communication tower
    for (let y = 1; y <= 8; y++) {
      for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
          if (Math.abs(x) + Math.abs(z) <= 1) {
            const materialType = y % 2 === 0 ? 'emissive' : 'metallic';
            const emissiveIntensity = materialType === 'emissive' ? 0.4 : 0.1;
            addVoxel([x, y, z], '#a78bfa', materialType, emissiveIntensity);
          }
        }
      }
    }

    // Communication antennas/spires
    const antennaPositions = [
      [-6, 0, -6], [6, 0, -6], [-6, 0, 6], [6, 0, 6]
    ];

    antennaPositions.forEach(([ax, az]) => {
      for (let y = 1; y <= 4; y++) {
        addVoxel([ax, y, az], '#ffe66d', 'emissive', 0.5);
      }
      // Antenna top
      addVoxel([ax, 5, az], '#ffffff', 'emissive', 0.8);
    });

    // Signal rings around antennas
    antennaPositions.forEach(([ax, az], index) => {
      const colors = ['#4ecdc4', '#a78bfa', '#ffe66d', '#ff6b6b'];
      for (let ring = 0; ring < 2; ring++) {
        const radius = 1 + ring * 0.5;
        for (let angle = 0; angle < 360; angle += 30) {
          const rad = angle * Math.PI / 180;
          const x = ax + Math.cos(rad) * radius;
          const z = az + Math.sin(rad) * radius;
          addVoxel([Math.round(x), 2 + ring, Math.round(z)], colors[index], 'emissive', 0.3);
        }
      }
    });

    return contactVoxels;
  }, []);

  // Contact methods data
  const contactMethods = [
    {
      id: 'email',
      icon: '✉️',
      label: 'Email',
      color: '#4ecdc4',
      position: [-4, 1.5, -4] as [number, number, number],
      action: () => setContactModal('email'),
      content: 'jk2765@cornell.edu'
    },
    {
      id: 'linkedin',
      icon: '💼',
      label: 'LinkedIn',
      color: '#a78bfa',
      position: [4, 1.5, -4] as [number, number, number],
      action: () => setContactModal('linkedin'),
      content: 'Connect professionally on LinkedIn'
    },
    {
      id: 'github',
      icon: '💻',
      label: 'GitHub',
      color: '#ffe66d',
      position: [-4, 1.5, 4] as [number, number, number],
      action: () => setContactModal('github'),
      content: 'Check out my code and projects'
    },
    {
      id: 'location',
      icon: '📍',
      label: 'Location',
      color: '#ff6b6b',
      position: [4, 1.5, 4] as [number, number, number],
      action: () => setContactModal('location'),
      content: 'Ithaca, NY & Seoul, South Korea'
    }
  ];

  return (
    <group position={[-15, 0, 15]}>
      <VoxelStructure voxels={voxels} />

      {/* Enhanced zone lighting */}
      <ZoneLighting
        position={[-15, 0, 15]}
        primaryAccentColor="#4ecdc4"
        secondaryAccentColor="#f87171"
      />

      {/* Central communication tower lighting */}
      <pointLight
        position={[0, 6, 0]}
        color="#a78bfa"
        intensity={2}
        distance={15}
      />

      {/* Enhanced zone title */}
      <Text
        position={[0, 10, 0]}
        fontSize={1.0}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#ffffff"
      >
        CONTACT & CONNECT
      </Text>

      <Text
        position={[0, 8, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#4ecdc4"
      >
        Let's Build Something Amazing Together
      </Text>

      {/* Interactive contact buttons */}
      {contactMethods.map((method) => (
        <ContactButton
          key={method.id}
          position={method.position}
          icon={method.icon}
          label={method.label}
          color={method.color}
          onClick={method.action}
        />
      ))}

      {/* Contact modal */}
      {contactModal && (
        <Html position={[0, 4, 0]} center>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {contactMethods.find(m => m.id === contactModal)?.icon}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-blue-400">
                    {contactMethods.find(m => m.id === contactModal)?.label}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {contactMethods.find(m => m.id === contactModal)?.content}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setContactModal(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {contactModal === 'email' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-300">
                  Send me an email to discuss opportunities, collaborations, or just say hello!
                </p>
                <button
                  onClick={() => window.open('mailto:jk2765@cornell.edu')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  📧 Open Email Client
                </button>
              </div>
            )}

            {contactModal === 'linkedin' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-300">
                  Connect with me professionally to discuss AI research, healthcare technology, and career opportunities.
                </p>
                <button
                  onClick={() => window.open('https://linkedin.com/in/jae-kim', '_blank')}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  💼 View LinkedIn Profile
                </button>
              </div>
            )}

            {contactModal === 'github' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-300">
                  Explore my open source projects, research code, and technical contributions.
                </p>
                <button
                  onClick={() => window.open('https://github.com/jae-kim', '_blank')}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  💻 Visit GitHub
                </button>
              </div>
            )}

            {contactModal === 'location' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-300">
                  Currently finishing my BA/MS at Cornell University in Ithaca, NY. Originally from Seoul, South Korea.
                </p>
                <div className="flex gap-2">
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">🇺🇸 Ithaca, NY</span>
                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">🇰🇷 Seoul, Korea</span>
                </div>
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Enhanced particle effects */}
      <React.Fragment>
        {/* Communication signals */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh
            key={`signal-${i}`}
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 12,
              3 + Math.sin(i) * 2,
              Math.sin((i / 8) * Math.PI * 2) * 12
            ]}
          >
            <sphereGeometry args={[0.05, 8, 6]} />
            <meshStandardMaterial
              color="#4ecdc4"
              emissive="#4ecdc4"
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}

        {/* Floating data particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <mesh
            key={`data-${i}`}
            position={[
              (Math.random() - 0.5) * 20,
              Math.random() * 8 + 2,
              (Math.random() - 0.5) * 20
            ]}
          >
            <boxGeometry args={[0.03, 0.03, 0.03]} />
            <meshStandardMaterial
              color="#a78bfa"
              emissive="#a78bfa"
              emissiveIntensity={0.6}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </React.Fragment>

      {/* Legacy information waypoints for compatibility */}
      <InfoWaypoint
        position={[-13, 1, 18]}
        title="Professional Inquiries"
        content="Open to research collaborations, AI consulting, and healthcare technology discussions."
        icon="🤝"
        color="#4ecdc4"
        zoneType="contact"
      />

      <InfoWaypoint
        position={[-17, 1, 18]}
        title="Response Time"
        content="I typically respond within 24-48 hours during business days."
        icon="⚡"
        color="#a78bfa"
        zoneType="contact"
      />
    </group>
  );
}


