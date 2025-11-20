import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Gamepad2, MessageSquare, Briefcase } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isReturningVisitor?: boolean;
}

export function WelcomeModal({ isOpen, onClose, isReturningVisitor = false }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = isReturningVisitor ? [
    {
      title: "Welcome Back!",
      content: "Great to see you again! The portfolio has evolved with new gamification features. Check out your achievements and complete daily challenges for rewards!",
      icon: <Gamepad2 className="w-12 h-12 text-green-400" />,
      tips: ["Check achievements (press Tab)", "Complete daily challenges", "Explore new content"]
    },
    {
      title: "New Features",
      content: "We've added daily challenges, achievements, and dynamic collectibles that change every day. Your progress and streak are being tracked!",
      icon: <Briefcase className="w-12 h-12 text-purple-400" />,
      features: ["Daily rotating challenges", "Achievement system", "Visit streaks", "Dynamic collectibles"]
    }
  ] : [
    {
      title: "Welcome to Jae's Portfolio!",
      content: "Explore this unique 3D voxel world where each zone tells a different part of my story. Use WASD or arrow keys to move around, and press E to interact with zones.",
      icon: <Gamepad2 className="w-12 h-12 text-cyan-400" />,
      tips: ["WASD/Arrows - Move", "E/Space - Interact", "ESC - Close menus"]
    },
    {
      title: "Meet the Zones",
      content: "Each colored structure represents a different area of expertise. Walk up to them and press E to learn more!",
      icon: <Briefcase className="w-12 h-12 text-yellow-400" />,
      zones: [
        { name: "About", icon: "🏠", color: "Blue house - Learn about Jae" },
        { name: "Education", icon: "📚", color: "Bookshelf - Academic background" },
        { name: "Projects", icon: "💻", color: "Computer - Featured work" },
        { name: "Skills", icon: "🔧", color: "Toolbox - Technical expertise" },
        { name: "Contact", icon: "📮", color: "Mailbox - Get in touch" },
        { name: "AI Chat", icon: "🤖", color: "Robot - Ask questions" }
      ]
    },
    {
      title: "AI Assistant Ready",
      content: "The glowing robot in the AI Chat zone is powered by advanced RAG technology. Ask about Jae's experience, skills, or anything else!",
      icon: <MessageSquare className="w-12 h-12 text-green-400" />,
      features: ["Real-time conversations", "Knowledge about Jae", "Powered by AI & vector search"]
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevStep();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="pixel-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 pixel-button p-2 hover:bg-red-600 transition-colors"
            aria-label="Close welcome modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStep ? 'bg-cyan-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                {steps[currentStep].icon}
              </div>

              {/* Title */}
              <h1 className="pixel-font text-2xl mb-4 text-yellow-400">
                {steps[currentStep].title}
              </h1>

              {/* Content */}
              <p className="pixel-font text-sm leading-relaxed text-white mb-6 max-w-lg mx-auto">
                {steps[currentStep].content}
              </p>

              {/* Zone grid for step 1 */}
              {steps[currentStep].zones && (
                <div className="grid grid-cols-2 gap-3 mb-6 max-w-md mx-auto">
                  {steps[currentStep].zones.map((zone, index) => (
                    <motion.div
                      key={zone.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="pixel-panel p-3 bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{zone.icon}</span>
                        <div className="text-left">
                          <div className="pixel-font text-xs text-cyan-400 font-bold">{zone.name}</div>
                          <div className="pixel-font text-xs text-gray-300">{zone.color}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Features list for step 2 */}
              {steps[currentStep].features && (
                <div className="space-y-2 mb-6 max-w-md mx-auto">
                  {steps[currentStep].features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 text-left"
                    >
                      <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0" />
                      <span className="pixel-font text-sm text-gray-200">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Tips for step 0 */}
              {steps[currentStep].tips && (
                <div className="pixel-panel p-4 bg-gray-800 mb-6 max-w-md mx-auto">
                  <h3 className="pixel-font text-sm text-yellow-400 mb-2">Quick Tips:</h3>
                  <div className="space-y-1">
                    {steps[currentStep].tips.map((tip, index) => (
                      <div key={index} className="pixel-font text-xs text-gray-300 text-left">
                        • {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="pixel-button px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <span className="pixel-font text-sm">Previous</span>
            </button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStep ? 'bg-cyan-400' : 'bg-gray-600'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <motion.button
              onClick={nextStep}
              className="pixel-button px-6 py-3 bg-cyan-600 hover:bg-cyan-700 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="pixel-font text-sm">
                {currentStep === steps.length - 1 ? 'Start Exploring!' : 'Next'}
              </span>
              <Play className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Skip option */}
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="pixel-font text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              Skip tutorial (ESC)
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
