import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { StartExperienceButton } from './UI/StartExperienceButton';

interface HeaderProps {
  onNavigate: (_sectionId: string) => void;
  currentSection: string;
  onLaunchPortfolio?: () => void;
}

export function Header({ onNavigate, currentSection, onLaunchPortfolio }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavigate = (sectionId: string) => {
    onNavigate(sectionId);
    setIsOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">JK</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">
              Jae Kim
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-between w-full gap-8">
            <div className="flex items-center gap-4">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                    currentSection === item.id
                      ? 'text-cyan-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                  {currentSection === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-yellow-400 rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {onLaunchPortfolio && (
              <div className="flex items-center">
                <StartExperienceButton
                  onClick={onLaunchPortfolio}
                  icon="🔥"
                  label="MAP"
                  subtitle="ENTER"
                  variant="vintage"
                  className="min-w-[110px] px-4 py-3 text-[0.75rem] uppercase tracking-[0.35em]"
                />
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <motion.button
            className="md:hidden p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800"
          >
              <div className="px-4 py-6 space-y-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`block w-full text-left px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      currentSection === item.id
                        ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.button>
                ))}
                {onLaunchPortfolio && (
                  <div className="mt-2">
                    <StartExperienceButton
                      onClick={onLaunchPortfolio}
                      icon="🔥"
                      label="3D"
                      subtitle="LIVE"
                      variant="vintage"
                      className="w-full text-[0.75rem] px-3 py-2"
                    />
                  </div>
                )}
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
