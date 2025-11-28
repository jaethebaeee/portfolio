import { motion } from 'framer-motion';

export type StartExperienceButtonVariant = 'teal' | 'vintage';
export type StartExperienceButtonSize = 'sm' | 'md' | 'lg';

export interface StartExperienceButtonProps {
  onClick: () => void;
  icon?: string;
  label: string;
  subtitle?: string;
  variant?: StartExperienceButtonVariant;
  size?: StartExperienceButtonSize;
  className?: string;
}

const VARIANT_CLASSES: Record<StartExperienceButtonVariant, string> = {
  teal: 'bg-gradient-to-br from-cyan-500 via-teal-500 to-slate-800 border-white/30 shadow-[0_15px_40px_rgba(16,185,129,0.35)] text-white',
  vintage: 'pixel-panel bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800 border-amber-300/50 shadow-[0_20px_50px_rgba(251,191,36,0.4)] text-amber-50 hover:border-amber-200 hover:shadow-[0_25px_60px_rgba(251,191,36,0.6)]',
};

const SIZE_CLASSES: Record<StartExperienceButtonSize, string> = {
  sm: 'px-3 py-2 text-[0.55rem]',
  md: 'px-5 py-3 text-[0.65rem]',
  lg: 'px-6 py-3.5 text-[0.75rem]',
};

export function StartExperienceButton({
  onClick,
  icon = '🚀',
  label,
  subtitle,
  variant = 'teal',
  size = 'md',
  className = '',
}: StartExperienceButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative z-10 flex flex-col items-center gap-1 border-2 font-bold uppercase tracking-[0.45em] pixel-font ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      style={{
        textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
        boxShadow: variant === 'vintage' ?
          '0 8px 20px rgba(251,191,36,0.3), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.3)' :
          '0 8px 20px rgba(16,185,129,0.3), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.3)',
      }}
    >
      {/* Pixel art border effect */}
      <div className="absolute inset-0 border-2 border-transparent rounded-lg"
           style={{
             background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
             mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
             maskComposite: 'xor'
           }} />

      <span className="text-xl drop-shadow-lg">{icon}</span>
      <span className="drop-shadow-md">{label}</span>
      {subtitle && <span className="text-[0.45rem] tracking-[0.8em] drop-shadow-md opacity-90">{subtitle}</span>}

      {/* Animated shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />
    </motion.button>
  );
}
