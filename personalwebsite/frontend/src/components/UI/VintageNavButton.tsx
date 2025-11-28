import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface VintageNavButtonProps {
  onClick: () => void;
  children: ReactNode;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  disabled?: boolean;
  delay?: number;
}

export function VintageNavButton({
  onClick,
  children,
  position,
  disabled = false,
  delay = 0
}: VintageNavButtonProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: position.includes('top') ? -20 : 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.5,
        ease: 'easeOut',
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      whileHover={{
        scale: 1.05,
        y: position.includes('top') ? -2 : 2,
        boxShadow: '0 8px 25px rgba(139, 69, 19, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.3)'
      }}
      whileTap={{ scale: 0.95, y: 0 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        absolute ${positionClasses[position]} z-30
        px-3 py-2
        bg-gradient-to-b from-amber-100 via-amber-50 to-yellow-100
        border-2 border-amber-800
        text-amber-900
        font-bold
        text-xs
        uppercase
        tracking-wider
        shadow-lg
        rounded-sm
        flex items-center gap-2
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}
        font-['Courier_New',_monospace]
        before:content-['']
        before:absolute
        before:inset-0
        before:bg-gradient-to-b
        before:from-transparent
        before:via-transparent
        before:to-amber-200/30
        before:rounded-sm
        before:pointer-events-none
        after:content-['']
        after:absolute
        after:inset-0
        after:bg-gradient-to-r
        after:from-amber-600/20
        after:via-transparent
        after:to-amber-600/20
        after:rounded-sm
        after:pointer-events-none
      `}
      style={{
        textShadow: '1px 1px 0px rgba(101, 67, 33, 0.3)',
        boxShadow: `
          0 4px 8px rgba(139, 69, 19, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.4),
          inset 0 -1px 0 rgba(139, 69, 19, 0.2)
        `,
        fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
        letterSpacing: '0.05em'
      }}
    >
      {/* Vintage texture overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, transparent 30%, rgba(139, 69, 19, 0.05) 50%, transparent 70%)
          `,
          backgroundSize: '20px 20px, 15px 15px, 30px 30px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-2">
        {children}
      </div>

      {/* Subtle shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        whileHover={{
          x: '100%',
          transition: { duration: 0.6, ease: 'easeInOut' }
        }}
      />
    </motion.button>
  );
}

// Specific navigation button components for clarity
interface NavigationButtonProps {
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  delay?: number;
}

export function VintageNavigationButtons({
  onBack,
  onForward,
  canGoBack = true,
  canGoForward = true,
  delay = 0
}: NavigationButtonProps) {
  return (
    <>
      {onBack && canGoBack && (
        <VintageNavButton
          onClick={onBack}
          position="bottom-left"
          delay={delay}
        >
          <span className="text-sm">⬅</span>
          <span>BACK</span>
        </VintageNavButton>
      )}

      {onForward && canGoForward && (
        <VintageNavButton
          onClick={onForward}
          position="bottom-right"
          delay={delay + 0.1}
        >
          <span>NEXT</span>
          <span className="text-sm">➡</span>
        </VintageNavButton>
      )}
    </>
  );
}

