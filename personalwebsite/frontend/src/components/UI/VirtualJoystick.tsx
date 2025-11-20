import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { use3DStore } from '@/stores/use3DStore';
import { Zap } from 'lucide-react';

interface JoystickState {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function VirtualJoystick() {
  const { setJoystickDirection, canInteract, setActiveOverlay, currentZone } = use3DStore();
  const [joystickState, setJoystickState] = useState<JoystickState>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== 'undefined' && 'ontouchstart' in window;

  // Only show on mobile devices
  if (!isMobile) return null;

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setJoystickState({
      active: true,
      startX: centerX,
      startY: centerY,
      currentX: clientX,
      currentY: clientY,
    });
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!joystickState.active || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxDistance = rect.width / 2 - 20; // Leave some margin
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Clamp to max distance
    const clampedX = distance > maxDistance ? (deltaX / distance) * maxDistance : deltaX;
    const clampedY = distance > maxDistance ? (deltaY / distance) * maxDistance : deltaY;

    setJoystickState(prev => ({
      ...prev,
      currentX: centerX + clampedX,
      currentY: centerY + clampedY,
    }));

    // Convert to direction vector (normalized -1 to 1)
    const normalizedX = clampedX / maxDistance;
    const normalizedY = clampedY / maxDistance;

    // Map to movement directions
    setJoystickDirection({
      forward: normalizedY < -0.3,
      backward: normalizedY > 0.3,
      left: normalizedX < -0.3,
      right: normalizedX > 0.3,
    });
  }, [joystickState.active, setJoystickDirection]);

  const handleEnd = useCallback(() => {
    setJoystickState(prev => ({ ...prev, active: false }));
    setJoystickDirection({
      forward: false,
      backward: false,
      left: false,
      right: false,
    });
  }, [setJoystickDirection]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  // Mouse event handlers (for testing on desktop)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (joystickState.active) {
      handleMove(e.clientX, e.clientY);
    }
  }, [joystickState.active, handleMove]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  // Global mouse move and up handlers
  useEffect(() => {
    if (!joystickState.active) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleGlobalMouseUp = () => {
      handleEnd();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [joystickState.active, handleMove, handleEnd]);

  const getKnobPosition = () => {
    if (!joystickState.active || !containerRef.current) {
      return { x: 0, y: 0 };
    }

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    return {
      x: joystickState.currentX - rect.left - centerX,
      y: joystickState.currentY - rect.top - centerY,
    };
  };

  const knobPosition = getKnobPosition();

  return (
    <>
      {/* Virtual Joystick */}
      <motion.div
        ref={containerRef}
        className="fixed bottom-6 left-6 w-24 h-24 pixel-panel bg-gray-800 border-2 border-gray-600 rounded-full select-none touch-none"
        style={{ zIndex: 20 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
      {/* Outer ring */}
      <div className="absolute inset-2 border-2 border-gray-500 rounded-full" />

      {/* Inner deadzone indicator */}
      <div className="absolute inset-6 border border-gray-600 rounded-full opacity-50" />

      {/* Joystick knob */}
      <motion.div
        className="absolute w-8 h-8 bg-cyan-400 rounded-full border-2 border-cyan-300 shadow-lg"
        style={{
          left: '50%',
          top: '50%',
          x: knobPosition.x,
          y: knobPosition.y,
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: joystickState.active ? 1.1 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      />

      {/* Touch area */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {/* Direction indicators */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-gray-500 rounded-t" />
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-gray-500 rounded-b" />
        <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-3 h-1 bg-gray-500 rounded-l" />
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-1 bg-gray-500 rounded-r" />
      </div>
      </motion.div>

      {/* Mobile Interaction Button */}
      {canInteract && (
        <motion.button
          className="fixed bottom-6 right-6 w-16 h-16 pixel-panel bg-yellow-600 hover:bg-yellow-500 border-2 border-yellow-400 rounded-full flex items-center justify-center shadow-lg"
          style={{ zIndex: 20 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => currentZone && setActiveOverlay(currentZone)}
          aria-label="Interact with zone"
        >
          <Zap className="w-8 h-8 text-white" />
        </motion.button>
      )}
    </>
  );
}
