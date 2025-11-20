import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { use3DStore, ZoneType } from '@/stores/use3DStore';

interface ZoneInfo {
  title: string;
  description: string;
  icon: string;
  color: string;
  tips: string[];
}

const ZONE_INFO: Record<Exclude<ZoneType, null>, ZoneInfo> = {
  about: {
    title: "About Zone",
    description: "Learn about Jae's background, experience, and journey in AI/ML and software engineering.",
    icon: "🎯",
    color: "#4ecdc4",
    tips: [
      "Press E to open detailed information",
      "Explore the voxel house structure",
      "Read Jae's professional story"
    ]
  },
  education: {
    title: "Education Zone",
    description: "Discover Jae's academic background, research experience, and educational achievements.",
    icon: "🎓",
    color: "#ffe66d",
    tips: [
      "Learn about Cornell University background",
      "See research publications",
      "Explore academic achievements"
    ]
  },
  projects: {
    title: "Projects Zone",
    description: "Explore Jae's portfolio of AI/ML projects, web applications, and innovative solutions.",
    icon: "💼",
    color: "#ff6b6b",
    tips: [
      "Browse featured projects",
      "See project technologies",
      "View live demos and code"
    ]
  },
  skills: {
    title: "Skills Zone",
    description: "Examine Jae's technical expertise across AI/ML, development tools, and professional competencies.",
    icon: "🛠️",
    color: "#a78bfa",
    tips: [
      "View skill proficiency levels",
      "Explore technology categories",
      "See certifications and expertise"
    ]
  },
  contact: {
    title: "Contact Zone",
    description: "Get in touch with Jae for opportunities, collaborations, or just to say hello!",
    icon: "📧",
    color: "#f87171",
    tips: [
      "Find contact information",
      "Send messages directly",
      "Connect on professional networks"
    ]
  },
  chat: {
    title: "AI Chat Zone",
    description: "Have a conversation with Jae's AI assistant to learn more about his work and experience.",
    icon: "🤖",
    color: "#34d399",
    tips: [
      "Ask questions about Jae's background",
      "Get detailed project information",
      "Interactive AI-powered conversations"
    ]
  }
};

export function ZoneInfoBubble() {
  const { currentZone } = use3DStore();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState<Record<Exclude<ZoneType, null>, boolean>>({
    about: false,
    education: false,
    projects: false,
    skills: false,
    contact: false,
    chat: false
  });

  useEffect(() => {
    if (currentZone && !hasShown[currentZone]) {
      setIsVisible(true);
      setHasShown(prev => ({ ...prev, [currentZone]: true }));

      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);

      return () => clearTimeout(timer);
    } else if (!currentZone) {
      setIsVisible(false);
    }
  }, [currentZone, hasShown]);

  if (!currentZone || !ZONE_INFO[currentZone]) {
    return null;
  }

  const info = ZONE_INFO[currentZone];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
            exit: { duration: 0.3 }
          }}
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            pointerEvents: 'none'
          }}
          role="dialog"
          aria-labelledby="zone-info-title"
          aria-describedby="zone-info-description"
          aria-live="polite"
        >
          <div
            style={{
              background: `linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,20,0.9))`,
              border: `3px solid ${info.color}`,
              borderRadius: '16px',
              padding: '20px',
              color: 'white',
              fontFamily: '"Courier New", monospace',
              fontSize: '14px',
              boxShadow: `0 0 30px ${info.color}40, 0 0 60px ${info.color}20`,
              backdropFilter: 'blur(15px)',
              maxWidth: '400px',
              minWidth: '320px',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div
                style={{
                  fontSize: '24px',
                  filter: `drop-shadow(0 0 8px ${info.color})`
                }}
                aria-hidden="true"
              >
                {info.icon}
              </div>
              <div>
                <h3
                  id="zone-info-title"
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: info.color,
                    margin: 0,
                    textShadow: `0 0 8px ${info.color}`
                  }}
                >
                  {info.title}
                </h3>
                <div
                  style={{
                    width: '100%',
                    height: '2px',
                    background: `linear-gradient(90deg, ${info.color}, transparent)`,
                    marginTop: '4px'
                  }}
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Description */}
            <p
              id="zone-info-description"
              style={{
                margin: '0 0 16px 0',
                lineHeight: '1.4',
                color: '#e5e7eb'
              }}
            >
              {info.description}
            </p>

            {/* Tips */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '12px',
                color: info.color,
                fontWeight: 'bold',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                💡 Tips:
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '16px',
                listStyle: 'none'
              }}>
                {info.tips.map((tip, index) => (
                  <li
                    key={index}
                    style={{
                      marginBottom: '4px',
                      color: '#d1d5db',
                      fontSize: '12px',
                      lineHeight: '1.3'
                    }}
                  >
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action hint */}
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              textAlign: 'center',
              paddingTop: '8px',
              borderTop: '1px solid rgba(156, 163, 175, 0.3)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              Press E to interact • ESC to close overlays
            </div>
          </div>

          {/* Speech bubble pointer */}
          <div
            style={{
              position: 'absolute',
              bottom: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: `12px solid ${info.color}`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
