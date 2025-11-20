import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { use3DStore } from '@/stores/use3DStore';

interface TouchPosition {
  x: number;
  y: number;
}

export function MobileControls() {
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState<TouchPosition>({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickCenterRef = useRef<HTMLDivElement>(null);

  const { activeOverlay, setActiveOverlay, setJoystickDirection } = use3DStore();

  // Don't show mobile controls if overlay is open
  if (activeOverlay) return null;

  const handleJoystickStart = useCallback((clientX: number, clientY: number) => {
    if (!joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setJoystickActive(true);
    setJoystickPosition({
      x: Math.max(-30, Math.min(30, clientX - centerX)),
      y: Math.max(-30, Math.min(30, clientY - centerY))
    });
  }, []);

  const handleJoystickMove = useCallback((clientX: number, clientY: number) => {
    if (!joystickActive || !joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setJoystickPosition({
      x: Math.max(-30, Math.min(30, clientX - centerX)),
      y: Math.max(-30, Math.min(30, clientY - centerY))
    });
  }, [joystickActive]);

  const handleJoystickEnd = useCallback(() => {
    setJoystickActive(false);
    setJoystickPosition({ x: 0, y: 0 });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleJoystickStart(touch.clientX, touch.clientY);
    }
  }, [handleJoystickStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleJoystickMove(touch.clientX, touch.clientY);
    }
  }, [handleJoystickMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleJoystickEnd();
  }, [handleJoystickEnd]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleJoystickStart(e.clientX, e.clientY);

    const handleMouseMove = (e: MouseEvent) => {
      handleJoystickMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleJoystickEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleJoystickStart, handleJoystickMove, handleJoystickEnd]);

  // Convert joystick position to movement direction
  const getMovementDirection = () => {
    const threshold = 5;
    const { x, y } = joystickPosition;

    return {
      forward: y < -threshold,
      backward: y > threshold,
      left: x < -threshold,
      right: x > threshold
    };
  };

  const movement = getMovementDirection();

  // Update store with joystick direction
  useEffect(() => {
    setJoystickDirection(movement);
  }, [movement, setJoystickDirection]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 md:hidden">
      {/* Virtual Joystick */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <div
          ref={joystickRef}
          className="relative w-24 h-24 bg-gray-800 bg-opacity-70 rounded-full border-4 border-cyan-400 pixel-border"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          aria-label="Virtual joystick for character movement"
          role="slider"
          aria-valuetext={`Movement: ${movement.forward ? 'Forward' : movement.backward ? 'Backward' : movement.left ? 'Left' : movement.right ? 'Right' : 'Center'}`}
        >
          <motion.div
            ref={joystickCenterRef}
            className="absolute w-12 h-12 bg-cyan-400 rounded-full border-2 border-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              x: joystickPosition.x,
              y: joystickPosition.y
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          />
        </div>
      </div>

      {/* Interact Button */}
      <div className="absolute bottom-8 right-8 pointer-events-auto">
        <motion.button
          className="pixel-button px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-black pixel-font text-lg font-bold"
          whileTap={{ scale: 0.95 }}
          onTouchStart={(e) => {
            e.preventDefault();
            // Trigger interaction (this would need to be connected to the character controller)
            const event = new KeyboardEvent('keydown', { key: 'e' });
            window.dispatchEvent(event);
            setTimeout(() => {
              window.dispatchEvent(new KeyboardEvent('keyup', { key: 'e' }));
            }, 100);
          }}
          aria-label="Interact with nearby zone"
        >
          E
        </motion.button>
      </div>

      {/* Mobile HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-auto">
        <div className="pixel-panel p-3 bg-gray-800 bg-opacity-90">
          <div className="pixel-font text-xs text-cyan-400">
            Use joystick to move • Tap E to interact
          </div>
        </div>

        <motion.button
          className="pixel-button p-3 bg-red-600 hover:bg-red-700"
          whileTap={{ scale: 0.95 }}
          onTouchStart={(e) => {
            e.preventDefault();
            setActiveOverlay(null);
          }}
          aria-label="Close any open panels"
        >
          <span className="pixel-font text-sm">ESC</span>
        </motion.button>
      </div>

      {/* Movement indicators for debugging/visual feedback */}
      {(movement.forward || movement.backward || movement.left || movement.right) && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pixel-panel p-2 bg-gray-800 bg-opacity-90">
          <div className="flex gap-2">
            {movement.forward && <span className="pixel-font text-xs text-green-400">↑</span>}
            {movement.backward && <span className="pixel-font text-xs text-green-400">↓</span>}
            {movement.left && <span className="pixel-font text-xs text-green-400">←</span>}
            {movement.right && <span className="pixel-font text-xs text-green-400">→</span>}
          </div>
        </div>
      )}
    </div>
  );
}
