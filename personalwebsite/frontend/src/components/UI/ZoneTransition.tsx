import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { use3DStore, ZoneType } from '@/stores/use3DStore';

const ZONE_TRANSITIONS: Record<Exclude<ZoneType, null>, {
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  description: string;
}> = {
  about: {
    title: "About Zone",
    subtitle: "Welcome to Jae's Story",
    color: "#4ecdc4",
    icon: "🎯",
    description: "Learn about Jae's background and journey"
  },
  education: {
    title: "🏛️ Cornell University",
    subtitle: "Ivy League Excellence",
    color: "#B31B1B",
    icon: "🎓",
    description: "Discover world-class computer science education and AI research at Cornell University"
  },
  projects: {
    title: "Projects Zone",
    subtitle: "Innovation Showcase",
    color: "#ff6b6b",
    icon: "💼",
    description: "Discover Jae's portfolio of impactful projects"
  },
  skills: {
    title: "Skills Zone",
    subtitle: "Technical Expertise",
    color: "#a78bfa",
    icon: "🛠️",
    description: "Examine Jae's technical skills and competencies"
  },
  contact: {
    title: "Contact Zone",
    subtitle: "Let's Connect",
    color: "#f87171",
    icon: "📧",
    description: "Get in touch and start a conversation"
  },
  chat: {
    title: "AI Chat Zone",
    subtitle: "Interactive Assistant",
    color: "#34d399",
    icon: "🤖",
    description: "Have a conversation with Jae's AI assistant"
  }
};

export function ZoneTransition() {
  const { currentZone } = use3DStore();
  const [showTransition, setShowTransition] = useState(false);
  const [currentTransitionData, setCurrentTransitionData] = useState<typeof ZONE_TRANSITIONS.about | null>(null);

  useEffect(() => {
    if (currentZone && ZONE_TRANSITIONS[currentZone]) {
      setCurrentTransitionData(ZONE_TRANSITIONS[currentZone]);
      setShowTransition(true);

      // Hide transition after 3 seconds
      const timer = setTimeout(() => {
        setShowTransition(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentZone]);

  return (
    <AnimatePresence>
      {showTransition && currentTransitionData && (
        <>
          {/* Full screen overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: currentTransitionData.color,
              zIndex: 3000,
              pointerEvents: 'none',
            }}
          />

          {/* Transition content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
              exit: { duration: 0.3 }
            }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 3001,
              pointerEvents: 'none',
              textAlign: 'center',
            }}
          >
            {/* Large icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              style={{
                fontSize: '120px',
                marginBottom: '20px',
                filter: `drop-shadow(0 0 30px ${currentTransitionData.color})`,
                animation: 'float 2s ease-in-out infinite'
              }}
            >
              {currentTransitionData.icon}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: '0 0 10px 0',
                textShadow: `0 0 20px ${currentTransitionData.color}`,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {currentTransitionData.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                fontSize: '24px',
                color: '#ffffff',
                margin: '0 0 20px 0',
                opacity: 0.9,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {currentTransitionData.subtitle}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{
                fontSize: '18px',
                color: '#ffffff',
                margin: '0',
                maxWidth: '400px',
                lineHeight: '1.4',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {currentTransitionData.description}
            </motion.p>

            {/* Progress indicator */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '200px' }}
              transition={{ delay: 1, duration: 2 }}
              style={{
                height: '3px',
                backgroundColor: '#ffffff',
                margin: '30px auto 0',
                borderRadius: '2px',
                opacity: 0.8,
              }}
            />
          </motion.div>

          {/* Floating particles effect */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                delay: Math.random() * 2,
                duration: 2,
                ease: "easeOut"
              }}
              style={{
                position: 'fixed',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: currentTransitionData.color,
                zIndex: 2999,
                pointerEvents: 'none',
              }}
            />
          ))}

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
