import { use3DStore } from '@/stores/use3DStore';
import { ZoneType } from '@/stores/use3DStore';

interface MinimapProps {
  className?: string;
}

interface ZoneInfo {
  type: ZoneType;
  name: string;
  position: [number, number, number];
  icon: string;
}

const ZONES: ZoneInfo[] = [
  { type: 'about', name: 'About', position: [-15, 0.5, -15], icon: '🎯' },
  { type: 'education', name: 'Education', position: [15, 0.5, -15], icon: '🎓' },
  { type: 'projects', name: 'Projects', position: [-15, 0.5, 0], icon: '💼' },
  { type: 'skills', name: 'Skills', position: [15, 0.5, 0], icon: '🛠️' },
  { type: 'contact', name: 'Contact', position: [-15, 0.5, 15], icon: '📧' },
  { type: 'chat', name: 'AI Chat', position: [15, 0.5, 15], icon: '🤖' },
];

const WORLD_SIZE = 50; // World extends from -WORLD_SIZE to +WORLD_SIZE

export function Minimap({ className = '' }: MinimapProps) {
  const { character, currentZone } = use3DStore();

  // Convert world position to minimap coordinates (0-100 scale)
  const worldToMinimap = (worldPos: number) => {
    return ((worldPos + WORLD_SIZE) / (WORLD_SIZE * 2)) * 100;
  };

  const characterX = worldToMinimap(character.position.x);
  const characterZ = worldToMinimap(character.position.z);

  // Get zone icon color based on current zone
  const getZoneColor = (zoneType: ZoneType) => {
    if (zoneType === currentZone) {
      return '#ffff00'; // Yellow for current zone
    }
    return '#4ecdc4'; // Default cyan
  };

  return (
    <div className={`relative ${className}`} style={{
      width: '120px',
      height: '120px',
      background: 'rgba(0,0,0,0.8)',
      border: '2px solid #4ecdc4',
      borderRadius: '4px',
      overflow: 'hidden',
      fontFamily: 'monospace',
      fontSize: '8px',
    }}>
      {/* Background grid */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(78, 205, 196, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(78, 205, 196, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Zone markers */}
      {ZONES.map((zone) => {
        const x = worldToMinimap(zone.position[0]);
        const z = worldToMinimap(zone.position[2]);

        return (
          <div
            key={zone.type}
            style={{
              position: 'absolute',
              left: `${x - 8}px`, // Center the 16px wide icon
              top: `${z - 8}px`, // Center the 16px tall icon
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: getZoneColor(zone.type),
              fontSize: '10px',
              textShadow: '0 0 3px rgba(0,0,0,0.8)',
              zIndex: 2,
            }}
            title={zone.name}
          >
            {zone.icon}
          </div>
        );
      })}

      {/* Character marker */}
      <div
        style={{
          position: 'absolute',
          left: `${characterX - 3}px`, // Center the 6px marker
          top: `${characterZ - 3}px`,
          width: '6px',
          height: '6px',
          background: 'radial-gradient(circle, #ffffff 0%, #ffff00 50%, #ff6b6b 100%)',
          borderRadius: '50%',
          border: '1px solid #000',
          boxShadow: '0 0 4px rgba(255, 255, 0, 0.8)',
          zIndex: 3,
        }}
      />

      {/* Border and labels */}
      <div style={{
        position: 'absolute',
        top: '2px',
        left: '2px',
        right: '2px',
        bottom: '2px',
        border: '1px solid rgba(78, 205, 196, 0.3)',
        pointerEvents: 'none',
      }} />

      {/* Title */}
      <div style={{
        position: 'absolute',
        bottom: '2px',
        left: '2px',
        color: '#4ecdc4',
        fontSize: '6px',
        textShadow: '0 0 2px rgba(0,0,0,0.8)',
        zIndex: 4,
      }}>
        ZONE MAP
      </div>
    </div>
  );
}
