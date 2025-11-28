import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gamepad2 } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isReturningVisitor?: boolean;
}

export function WelcomeModal({ isOpen, onClose, isReturningVisitor: _isReturningVisitor = false }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Jae's Portfolio",
      content: "Hi! I'm Jae, a healthcare AI engineer. This is my digital space where you can explore my work, experience, and get to know me better.",
      icon: <Gamepad2 className="w-12 h-12 text-blue-400" />,
      tips: ["WASD - Move around", "E - Click on areas to learn more", "C - Chat with me"]
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
            className="absolute top-4 right-4 p-2 bg-amber-100 border border-amber-800 text-amber-900 hover:bg-amber-200 transition-colors rounded-sm pixel-font font-bold text-sm"
            style={{
              textShadow: '1px 1px 0px rgba(101, 67, 33, 0.2)',
              boxShadow: '0 2px 4px rgba(139, 69, 19, 0.2)'
            }}
            aria-label="Close welcome modal"
          >
            <X className="w-6 h-6" />
          </button>


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
              <h1 className="pixel-font text-2xl mb-4 text-yellow-400 font-bold uppercase tracking-wider"
                  style={{
                    textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
                    fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace"
                  }}>
                {steps[currentStep].title}
              </h1>

              {/* Content */}
              <p className="pixel-font text-sm leading-relaxed text-gray-200 mb-6 max-w-lg mx-auto"
                 style={{ fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace" }}>
                {steps[currentStep].content}
              </p>


              {/* Tips for step 0 */}
              {steps[currentStep].tips && (
                <div className="pixel-panel border-yellow-400/30 bg-black/60 p-4 mb-6 max-w-md mx-auto backdrop-blur-sm">
                  <h3 className="pixel-font text-sm text-yellow-400 mb-2 uppercase tracking-wider font-bold"
                      style={{
                        textShadow: '1px 1px 0px rgba(0,0,0,0.5)',
                        fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace"
                      }}>
                    Quick Tips:
                  </h3>
                  <div className="space-y-1">
                    {steps[currentStep].tips.map((tip, index) => (
                      <div key={index} className="pixel-font text-xs text-gray-200 text-left"
                           style={{ fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace" }}>
                        • {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Start button */}
          <div className="mt-8">
            <motion.button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-b from-amber-100 via-amber-50 to-yellow-100 border-2 border-amber-800 text-amber-900 font-bold text-sm uppercase tracking-wider shadow-lg rounded-sm pixel-font transition-all duration-200 hover:shadow-xl"
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Exploring
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
