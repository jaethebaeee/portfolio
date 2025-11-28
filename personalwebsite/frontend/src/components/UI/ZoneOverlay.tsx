import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { use3DStore } from '@/stores/use3DStore';
import { aboutContent } from '../3D/zones/constants/aboutContent';
import { educationContent } from '../3D/zones/constants/educationContent';
import { projectsContent } from '../3D/zones/constants/projectsContent';
import { skillsContent } from '../3D/zones/constants/skillsContent';
import { contactContent } from '../3D/zones/constants/contactContent';

export function ZoneOverlay() {
  const { activeOverlay, setActiveOverlay } = use3DStore();

  const getContent = (): any => {
    switch (activeOverlay) {
      case 'about':
        return aboutContent;
      case 'education':
        return educationContent;
      case 'projects':
        return projectsContent;
      case 'skills':
        return skillsContent;
      case 'contact':
        return contactContent;
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
      onClick={() => setActiveOverlay(null)}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="pixel-panel max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setActiveOverlay(null)}
          className="absolute top-4 right-4 pixel-button p-2 hover:bg-red-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <h1 className="pixel-font text-3xl mb-6 text-yellow-400">{content.title}</h1>
        {'subtitle' in content && content.subtitle && (
          <h2 className="pixel-font text-xl mb-4 text-blue-400">{content.subtitle}</h2>
        )}

        {/* Render content based on active overlay type */}
        {activeOverlay === 'about' && (
          <>
            {(content as any).content && (
              <div className="pixel-font text-sm leading-relaxed whitespace-pre-line text-white mb-6">
                {(content as any).content}
              </div>
            )}
            {(content as any).highlights && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {(content as any).highlights.map((highlight: any, index: number) => (
                  <div key={index} className="pixel-panel p-4 bg-gray-800">
                    <div className="text-2xl mb-2">{highlight.icon}</div>
                    <h4 className="pixel-font text-sm text-yellow-400 mb-1">{highlight.title}</h4>
                    <p className="pixel-font text-xs text-gray-300">{highlight.description}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeOverlay === 'education' && (content as any).content && (
          <div className="pixel-font text-sm leading-relaxed whitespace-pre-line text-white mb-6">
            {(content as any).content}
          </div>
        )}

        {activeOverlay === 'projects' && (content as any).projects && (
          <div className="space-y-6">
            {(content as any).projects.map((project: any) => (
              <div key={project.id} className="pixel-panel p-4 bg-gray-800">
                <h3 className="pixel-font text-lg text-yellow-400 mb-2">{project.title}</h3>
                <p className="pixel-font text-sm text-gray-300 mb-2">{project.subtitle}</p>
                <p className="pixel-font text-xs text-white mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.technologies.map((tech: string) => (
                    <span key={tech} className="pixel-font text-xs bg-blue-600 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
                <p className="pixel-font text-xs text-green-400">Impact: {project.impact}</p>
              </div>
            ))}
          </div>
        )}

        {activeOverlay === 'skills' && (content as any).skillCategories && (
          <div className="space-y-4">
            {(content as any).skillCategories.map((category: any) => (
              <div key={category.id} className="pixel-panel p-4 bg-gray-800">
                <h3 className="pixel-font text-lg text-yellow-400 mb-2">
                  {category.icon} {category.title}
                </h3>
                <p className="pixel-font text-xs text-gray-300 mb-3">{category.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {category.skills.map((skill: any) => (
                    <div key={skill.name} className="flex justify-between">
                      <span className="pixel-font text-xs text-white">{skill.name}</span>
                      <span className="pixel-font text-xs text-blue-400">{skill.level}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeOverlay === 'contact' && (content as any).content && (
          <div className="pixel-font text-sm leading-relaxed whitespace-pre-line text-white mb-6">
            {(content as any).content}
          </div>
        )}

        {/* Press ESC hint */}
        <div className="mt-8 pt-4 border-t-4 border-gray-700">
          <p className="pixel-font text-xs text-gray-400 text-center">
            Press ESC or click outside to close
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

