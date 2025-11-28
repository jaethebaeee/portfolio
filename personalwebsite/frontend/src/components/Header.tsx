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
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-gray-900/98 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl shadow-gray-900/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Enhanced Logo */}
          <motion.div
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-400/40 border-2 border-cyan-300/30 relative overflow-hidden">
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse"></div>
                <span className="text-gray-900 font-black text-sm drop-shadow-lg relative z-10 tracking-wider">JK</span>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-yellow-400 rounded-2xl blur-lg opacity-30 -z-10"></div>
            </div>

            <div className="flex flex-col">
              <span className="text-2xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg leading-tight">
                Jae Kim
              </span>
              <span className="text-xs text-cyan-300 font-bold tracking-[0.3em] uppercase bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">
                PORTFOLIO
              </span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center w-full">
            <div className="flex items-center gap-8">
              {/* Left Navigation Items */}
              <div className="flex items-center gap-4">
                {navItems.slice(0, 3).map((item) => (
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

              {/* Central MAP ENTER Button */}
              {onLaunchPortfolio && (
                <motion.div
                  className="mx-6"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <StartExperienceButton
                    onClick={onLaunchPortfolio}
                    icon="🗺️"
                    label="ENTER"
                    subtitle="3D WORLD"
                    variant="vintage"
                    className="min-w-[140px] px-6 py-3 text-[0.8rem] uppercase tracking-[0.4em] shadow-2xl"
                  />
                </motion.div>
              )}

              {/* Right Navigation Items */}
              <div className="flex items-center gap-4">
                {navItems.slice(3).map((item) => (
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
            </div>
          </nav>

          {/* Mobile menu button */}
          <motion.button
            className="md:hidden p-3 rounded-xl bg-gray-800/80 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all duration-300 border border-gray-600/30 shadow-lg"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
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
            className="md:hidden bg-gray-900/98 backdrop-blur-xl border-t border-gray-700/50 shadow-2xl"
          >
              <div className="px-4 py-6 space-y-3">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`block w-full text-left px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                      currentSection === item.id
                        ? 'bg-gradient-to-r from-cyan-400/20 to-blue-400/20 text-cyan-400 border border-cyan-400/40 shadow-lg shadow-cyan-400/20'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent hover:border-gray-600/30'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.label}
                  </motion.button>
                ))}
                {onLaunchPortfolio && (
                  <div className="mt-4 px-2">
                    <StartExperienceButton
                      onClick={onLaunchPortfolio}
                      icon="🗺️"
                      label="ENTER"
                      subtitle="3D WORLD"
                      variant="vintage"
                      className="w-full text-[0.8rem] px-4 py-3 tracking-[0.3em]"
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
