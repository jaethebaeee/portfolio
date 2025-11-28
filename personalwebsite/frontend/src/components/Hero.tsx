import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { ChevronDown, Linkedin, Mail, Download } from 'lucide-react';

interface HeroProps {
  onNavigate: (_sectionId: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Enter key to navigate to projects
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        onNavigate('projects');
      }
      // Arrow down or space to scroll to projects
      if (event.key === 'ArrowDown' || event.key === ' ') {
        event.preventDefault();
        onNavigate('projects');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      <section
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden"
        role="banner"
        aria-labelledby="hero-heading"
      >
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-yellow-400/5" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/3 via-transparent to-purple-500/3" />

        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.15)_1px,_transparent_0)] bg-[length:20px_20px] animate-pulse" />

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 border border-cyan-400/20 rounded-full"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        />

        <motion.div
          className="absolute top-40 right-20 w-24 h-24 border border-yellow-400/20 rounded-lg"
          animate={{
            rotate: -360,
            scale: [1, 0.9, 1],
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }
          }}
        />

        <motion.div
          className="absolute bottom-32 left-1/4 w-16 h-16 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-sm"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute bottom-20 right-1/3 w-20 h-20 border border-purple-400/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-yellow-400 p-1"
          >
            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">
                JK
              </span>
            </div>
          </motion.div>

          {/* Main heading */}
          <div className="space-y-4">
            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold"
              role="heading"
              aria-level={1}
            >
              <span className="block">Hi, I'm</span>
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-yellow-400 bg-clip-text text-transparent">
                Jae Kim
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4 text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto mb-6"
            >
              <span className="flex items-center gap-2 px-4 py-2 bg-cyan-400/10 rounded-full border border-cyan-400/20">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                AI Engineer
              </span>
              <span className="flex items-center gap-2 px-4 py-2 bg-blue-400/10 rounded-full border border-blue-400/20">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                Healthcare ML
              </span>
              <span className="flex items-center gap-2 px-4 py-2 bg-yellow-400/10 rounded-full border border-yellow-400/20">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                Cornell '25
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-lg text-gray-400 max-w-3xl mx-auto space-y-3"
            >
              <p className="leading-relaxed">
                I build <span className="text-cyan-400 font-semibold">machine learning systems</span> that healthcare providers actually use.
                From cancer subtype classification to clinical NLP, my work bridges research and real-world impact.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Available for collaborations
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  2+ peer-reviewed publications
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              onClick={() => onNavigate('projects')}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-600 hover:from-cyan-500 hover:via-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-cyan-400/25 transform transition-all duration-300 flex items-center gap-3 overflow-hidden"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <span className="relative z-10">Explore My Work</span>
              <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
            </motion.button>

            <motion.a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('contact');
              }}
              className="group px-8 py-4 border-2 border-gray-500/50 hover:border-cyan-400/70 text-gray-300 hover:text-cyan-300 font-semibold rounded-xl bg-gray-800/30 hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 relative overflow-hidden"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Let's Collaborate</span>
            </motion.a>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap justify-center gap-3 mt-8"
          >

            <motion.a
              href="mailto:jk2765@cornell.edu"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </motion.a>

            <motion.button
              onClick={() => onNavigate('about')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="w-4 h-4 rounded-full border-2 border-current"></span>
              <span className="hidden sm:inline">About Me</span>
            </motion.button>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center space-x-6"
          >
            {[
              { Icon: Linkedin, href: 'https://linkedin.com/in/jaekim', label: 'LinkedIn' },
              { Icon: Mail, href: 'mailto:jk2765@cornell.edu', label: 'Email' },
              { Icon: Download, href: '#', label: 'Resume' },
            ].map(({ Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-cyan-400 rounded-full transition-colors duration-200"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label={label}
              >
                <Icon className="w-6 h-6" />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-cyan-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
    </>
  );
}