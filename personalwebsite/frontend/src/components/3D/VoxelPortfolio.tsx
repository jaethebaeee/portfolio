import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { VoxelPortfolioProps } from './types/portfolio';
import { ChatOverlay } from '../UI/ChatOverlay';
import { OrbitControls } from '@react-three/drei';
import { LoadingScreen } from '../UI/LoadingScreen';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { Dog } from './Dog';

type MovementDirection = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

function useMovementControls(isActive: boolean) {
  const [direction, setDirection] = useState<MovementDirection>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    if (!isActive) {
      setDirection({ forward: false, backward: false, left: false, right: false });
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.code) return;
      setDirection((prev) => {
        const next = { ...prev };
        if (event.code === 'KeyW' || event.code === 'ArrowUp') next.forward = true;
        if (event.code === 'KeyS' || event.code === 'ArrowDown') next.backward = true;
        if (event.code === 'KeyA' || event.code === 'ArrowLeft') next.left = true;
        if (event.code === 'KeyD' || event.code === 'ArrowRight') next.right = true;
        return next;
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!event.code) return;
      setDirection((prev) => {
        const next = { ...prev };
        if (event.code === 'KeyW' || event.code === 'ArrowUp') next.forward = false;
        if (event.code === 'KeyS' || event.code === 'ArrowDown') next.backward = false;
        if (event.code === 'KeyA' || event.code === 'ArrowLeft') next.left = false;
        if (event.code === 'KeyD' || event.code === 'ArrowRight') next.right = false;
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive]);

  return direction;
}

function CharacterPawn({ direction }: { direction: MovementDirection }) {
  const pawnRef = useRef<THREE.Group>(null);
  const speed = 3;

  useFrame((state, delta) => {
    if (!pawnRef.current) return;
    const moveDelta = new THREE.Vector3(
      (direction.right ? 1 : 0) - (direction.left ? 1 : 0),
      0,
      (direction.backward ? 1 : 0) - (direction.forward ? 1 : 0)
    );

    if (moveDelta.lengthSq() > 0) {
      moveDelta.normalize().multiplyScalar(speed * delta);
      pawnRef.current.position.add(moveDelta);
    }

    const desiredCameraPos = pawnRef.current.position.clone().add(new THREE.Vector3(0, 2.2, 4));
    state.camera.position.lerp(desiredCameraPos, delta * 4);
    state.camera.lookAt(pawnRef.current.position);
  });

  return (
    <group ref={pawnRef} position={[0, 0.5, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.2, 16]} />
        <meshStandardMaterial color="#f9c74f" metalness={0.2} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#ffe066" metalness={0.1} roughness={0.5} />
      </mesh>
    </group>
  );
}


type StartOverlayProps = {
  onStart: () => void;
  previewHighlights: string[];
};


function SimpleDogScene() {
  return (
    <>
      {/* Warm ambient lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1} />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#FFD700" />

      {/* Simple ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#8B7355" opacity={0.9} transparent />
      </mesh>

      {/* Simple grass patches */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            -0.4,
            (Math.random() - 0.5) * 20
          ]}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.2, 6]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      ))}

      {/* Simple flowers */}
      {Array.from({ length: 5 }, (_, i) => (
        <group
          key={`flower-${i}`}
          position={[
            (Math.random() - 0.5) * 15,
            0,
            (Math.random() - 0.5) * 15
          ]}
        >
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#FF69B4" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        </group>
      ))}

      {/* Simple trees */}
      {Array.from({ length: 4 }, (_, i) => (
        <group
          key={`tree-${i}`}
          position={[
            (Math.random() - 0.5) * 25,
            0,
            (Math.random() - 0.5) * 25
          ]}
        >
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[1.2, 8, 8]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        </group>
      ))}

      {/* The interactive dog */}
      <Dog />
    </>
  );
}

function StartOverlay({ onStart, previewHighlights }: StartOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-4 bg-black/50">
      <div className="pointer-events-auto max-w-md">
        <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-center text-white backdrop-blur-sm">
          <h1 className="text-3xl font-bold mb-4 text-amber-200 pixel-font">
            🐕 Meet My Portfolio Dog!
          </h1>
          <p className="text-base leading-relaxed text-amber-100 mb-6 pixel-font">
            Take control of my adorable companion and explore the garden together!
          </p>

          <button
            onClick={onStart}
            className="mt-4 px-8 py-4 bg-gradient-to-b from-purple-600 via-purple-500 to-indigo-600 border-2 border-purple-300 text-white font-bold text-lg uppercase tracking-wider shadow-2xl rounded-lg pixel-font transition-all duration-300 hover:shadow-purple-500/50 hover:scale-105 hover:border-purple-200"
            style={{
              textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
              boxShadow: `
                0 8px 16px rgba(147, 51, 234, 0.4),
                inset 0 2px 0 rgba(255, 255, 255, 0.3),
                inset 0 -2px 0 rgba(0,0,0,0.3)
              `,
              fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
              letterSpacing: '0.1em'
            }}
          >
            🐕 Walk with Buddy
          </button>
          <div className="mt-6 text-left text-sm text-gray-300 space-y-2">
            {previewHighlights.map((highlight) => (
              <p key={highlight}>{highlight}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VoxelPortfolio({ onExit: _onExit }: VoxelPortfolioProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const { progress: simulatedProgress, isLoaded, skipLoading } = useSimulatedLoading({
    duration: 3000,
    easingType: 'portfolio',
  });

    const previewHighlights = useMemo(
      () => [
        '🐕 Move Buddy around the garden with WASD keys',
        '🌸 Discover my projects as you walk together',
        '💬 Chat with AI Buddy to learn about my work',
        '🎮 Simple controls, endless exploration!'
      ],
      []
    );
  const movementDirection = useMovementControls(hasStarted);

  return (
    <div className="relative w-screen h-screen bg-slate-950">
      <Canvas
        shadows
        camera={{ position: [0, 3, 6], fov: 55 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#030712']} />
        <fog attach="fog" args={['#030712', 6, 20]} />
        <OrbitControls
          makeDefault
          enablePan
          enableRotate
          enableZoom
          minDistance={3}
          maxDistance={16}
          maxPolarAngle={Math.PI / 2.2}
        />
        <SimpleDogScene />
        {hasStarted && <CharacterPawn direction={movementDirection} />}
      </Canvas>

      <div className="absolute inset-0 pointer-events-none" />

      {isLoaded && !hasStarted && (
        <StartOverlay onStart={() => setHasStarted(true)} previewHighlights={previewHighlights} />
      )}

      {hasStarted && (
        <div className="absolute top-4 right-4">
          <div className="pixel-panel border-amber-800/30 bg-gradient-to-b from-amber-100/10 via-amber-50/5 to-yellow-100/10 px-4 py-3 text-amber-900 backdrop-blur-sm border-2">
            <div className="grid gap-2 text-xs pixel-font font-bold">
              <div className="flex justify-between gap-4 items-center">
                <span>MOVE</span>
                <span className="font-mono text-amber-700 bg-amber-200/50 px-1 rounded">WASD</span>
              </div>
              <div className="flex justify-between gap-4 items-center">
                <span>INTERACT</span>
                <span className="font-mono text-amber-700 bg-amber-200/50 px-1 rounded">E</span>
              </div>
              <div className="flex justify-between gap-4 items-center">
                <span>CHAT</span>
                <span className="font-mono text-amber-700 bg-amber-200/50 px-1 rounded">C</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ChatOverlay />
      {!isLoaded && (
        <LoadingScreen
          progressOverride={simulatedProgress}
          onSkip={skipLoading}
          forceVisible
        />
      )}

    </div>
  );
}
