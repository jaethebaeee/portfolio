import { useEffect, useState } from 'react';
import { use3DStore } from '@/stores/use3DStore';

interface ZonePreview {
  title: string;
  description: string;
  icon: string;
  color: string;
  previewImage?: string;
  narrative: string[];
}

const ZONE_PREVIEWS: Record<string, ZonePreview> = {
  about: {
    title: 'About Jae',
    description: 'Personal background and journey',
    icon: '👤',
    color: '#ff1493',
    narrative: [
      'Welcome to my digital sanctuary...',
      'Here you\'ll discover the story behind Jae\'s journey',
      'From Seoul to Cornell, from research to innovation',
      'A passionate AI researcher with a vision for healthcare'
    ]
  },
  education: {
    title: 'Education',
    description: 'Academic journey and achievements',
    icon: '🎓',
    color: '#B31B1B',
    narrative: [
      'The foundation of knowledge...',
      'From Seoul National University\'s rigorous programs',
      'To Cornell\'s cutting-edge AI research',
      'Building the expertise that drives innovation'
    ]
  },
  skills: {
    title: 'Skills & Expertise',
    description: 'Technical capabilities and tools',
    icon: '⚡',
    color: '#a78bfa',
    narrative: [
      'The arsenal of innovation...',
      'Machine Learning, Deep Learning, Computer Vision',
      'Full-stack development, cloud architecture',
      'Healthcare AI, research methodology, leadership'
    ]
  },
  projects: {
    title: 'Projects',
    description: 'Innovative solutions and research',
    icon: '🚀',
    color: '#4ecdc4',
    narrative: [
      'Where ideas become reality...',
      'Healthcare AI applications, ML research projects',
      'Full-stack web applications, data visualization',
      'Open-source contributions and academic publications'
    ]
  },
  contact: {
    title: 'Contact & Connect',
    description: 'Let\'s collaborate and build together',
    icon: '📡',
    color: '#4ecdc4',
    narrative: [
      'The gateway to collaboration...',
      'Ready to discuss opportunities and partnerships',
      'From research collaborations to professional opportunities',
      'Let\'s connect and build something amazing together'
    ]
  },
  chat: {
    title: 'AI Assistant',
    description: 'Interactive conversation and guidance',
    icon: '🤖',
    color: '#4ecdc4',
    narrative: [
      'Your intelligent companion...',
      'Powered by advanced AI to assist and guide',
      'Ask questions, explore possibilities',
      'Experience the future of interactive portfolios'
    ]
  }
};

interface NarrativeTextProps {
  lines: string[];
  progress: number;
}

function NarrativeText({ lines, progress }: NarrativeTextProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (progress < 0.2) return; // Wait for initial transition

    const lineIndex = Math.floor((progress - 0.2) / 0.8 * lines.length);
    const clampedLineIndex = Math.min(lineIndex, lines.length - 1);

    if (clampedLineIndex !== currentLine) {
      setCurrentLine(clampedLineIndex);
      setCharIndex(0);
      setDisplayText('');
    }

    if (clampedLineIndex === currentLine && charIndex < lines[currentLine].length) {
      const timer = setTimeout(() => {
        setDisplayText(lines[currentLine].substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 50); // Typing speed

      return () => clearTimeout(timer);
    }
  }, [progress, currentLine, charIndex, lines]);

  return (
    <div className="text-center mb-8">
      <p className="text-xl text-white font-light leading-relaxed min-h-[3rem]">
        {displayText}
        <span className="animate-pulse text-blue-400">|</span>
      </p>
    </div>
  );
}

interface ZonePreviewCardProps {
  preview: ZonePreview;
  progress: number;
}

function ZonePreviewCard({ preview, progress }: ZonePreviewCardProps) {
  const opacity = Math.min(progress * 2, 1);
  const scale = 0.8 + progress * 0.2;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border transition-all duration-1000 ease-out"
      style={{
        opacity,
        transform: `scale(${scale})`,
        borderColor: preview.color,
        boxShadow: `0 0 40px ${preview.color}40`
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at center, ${preview.color}20, transparent 70%)`
        }}
      />

      {/* Content */}
      <div className="relative p-8 text-center">
        <div
          className="text-6xl mb-4 transition-transform duration-1000"
          style={{
            transform: `rotate(${progress * 360}deg) scale(${1 + progress * 0.2})`
          }}
        >
          {preview.icon}
        </div>

        <h2
          className="text-3xl font-bold mb-2 transition-all duration-1000"
          style={{ color: preview.color }}
        >
          {preview.title}
        </h2>

        <p className="text-gray-300 text-lg mb-4">
          {preview.description}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-out rounded-full"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: preview.color
            }}
          />
        </div>
      </div>

      {/* Particle effects */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full opacity-60"
          style={{
            backgroundColor: preview.color,
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${i * 0.2}s`,
            animation: `float 3s ease-in-out infinite ${i * 0.2}s`
          }}
        />
      ))}
    </div>
  );
}

export function ZoneCinematic() {
  const { transition } = use3DStore();

  // Only show during portal and cinematic transitions
  if (transition.state === 'idle' || transition.state === 'atmosphere-transition') {
    return null;
  }

  const preview = ZONE_PREVIEWS[transition.toZone || 'about'];
  if (!preview) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="max-w-2xl w-full mx-4">
        {/* Narrative text */}
        <NarrativeText lines={preview.narrative} progress={transition.progress} />

        {/* Zone preview card */}
        <ZonePreviewCard preview={preview} progress={transition.progress} />

        {/* Loading indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
            <span className="text-sm">Transitioning to {preview.title}...</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
