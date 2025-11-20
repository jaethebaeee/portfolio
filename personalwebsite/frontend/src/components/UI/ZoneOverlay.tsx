import { motion } from 'framer-motion';
import { X, Mail, Github, Linkedin, ExternalLink, Code, Globe, Star, Award, Trophy, Expand } from 'lucide-react';
import { useState, useEffect } from 'react';
import { use3DStore } from '@/stores/use3DStore';
import { ZoneContent } from '@/types';
import { aboutContent } from '../3D/zones/constants/aboutContent';
import { educationContent } from '../3D/zones/constants/educationContent';
import { projectsContent } from '../3D/zones/constants/projectsContent';
import { skillsContent } from '../3D/zones/constants/skillsContent';
import { contactContent } from '../3D/zones/constants/contactContent';
import { ProjectsPage } from './ProjectsPage';
import { TechStack } from './TechStack';

export function ZoneOverlay() {
  const { activeOverlay, setActiveOverlay } = use3DStore();
  const [showProjectsPage, setShowProjectsPage] = useState(false);
  const [showTechStack, setShowTechStack] = useState(false);

  // Handle ESC key to close overlay
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showTechStack) {
          setShowTechStack(false);
        } else if (showProjectsPage) {
          setShowProjectsPage(false);
        } else {
          setActiveOverlay(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setActiveOverlay, showTechStack, showProjectsPage]);

  const getContent = (): ZoneContent | null => {
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
        className="pixel-panel max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zone-overlay-title"
        aria-describedby="zone-overlay-content"
      >
        {/* Close button */}
        <button
          onClick={() => setActiveOverlay(null)}
          className="absolute top-4 right-4 pixel-button p-2 hover:bg-red-600 transition-colors z-10"
          aria-label="Close zone information"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveOverlay(null);
            }
          }}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <header className="mb-8">
          <h1 id="zone-overlay-title" className="pixel-font text-3xl mb-2 text-yellow-400">{content.title}</h1>
          {'subtitle' in content && content.subtitle && (
            <p className="pixel-font text-lg text-cyan-400" aria-describedby="zone-overlay-title">{content.subtitle}</p>
          )}
        </header>

        {/* Main Content */}
        {'content' in content && content.content && (
          <section className="mb-8" aria-labelledby="content-heading">
            <h2 id="content-heading" className="sr-only">Content</h2>
            <div id="zone-overlay-content" className="pixel-font text-sm leading-relaxed whitespace-pre-line text-white">
              {content.content}
            </div>
          </section>
        )}

        {/* Highlights Grid */}
        {'highlights' in content && content.highlights && (
          <div className="mb-8">
            <h2 className="pixel-font text-xl mb-4 text-yellow-400">Key Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(content as any).highlights.map((highlight: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="pixel-panel p-4 bg-gray-800"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{highlight.icon}</span>
                    <div>
                      <h3 className="pixel-font text-sm text-cyan-400 mb-1">{highlight.title}</h3>
                      <p className="pixel-font text-xs text-gray-300 leading-relaxed">{highlight.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {'skills' in content && content.skills && (
          <div className="mb-8">
            <h2 className="pixel-font text-xl mb-4 text-yellow-400">Core Skills</h2>
            <div className="space-y-3">
              {(content as any).skills.map((skill: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="pixel-font text-sm text-white">{skill.name}</span>
                    <span className="pixel-font text-xs text-cyan-400">{skill.level}%</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded pixel-border">
                    <motion.div
                      className="h-3 bg-gradient-to-r from-cyan-400 to-yellow-400 rounded"
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {'projects' in content && content.projects && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="pixel-font text-xl text-yellow-400">Featured Projects</h2>
              <motion.button
                onClick={() => setShowProjectsPage(true)}
                className="pixel-button px-3 py-2 flex items-center gap-2 hover:bg-cyan-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Expand className="w-4 h-4" />
                <span className="pixel-font text-xs">View All</span>
              </motion.button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {content.projects.map((project: any, index: number) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="pixel-panel p-6 bg-gray-800"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="pixel-font text-lg text-cyan-400 mb-1">{project.title}</h3>
                        <p className="pixel-font text-sm text-gray-300">{project.subtitle}</p>
                      </div>
                      <span className={`pixel-font text-xs px-2 py-1 rounded ${
                        project.status === 'Live' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="pixel-font text-xs text-gray-400 leading-relaxed mb-4">
                      {project.description}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="pixel-font text-sm text-yellow-400 mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech: string, techIndex: number) => (
                        <span
                          key={techIndex}
                          className="pixel-font text-xs px-2 py-1 bg-gray-700 text-cyan-300 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="pixel-font text-sm text-yellow-400 mb-2">Key Features</h4>
                    <ul className="pixel-font text-xs text-gray-300 space-y-1">
                      {project.features.map((feature: string, featureIndex: number) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="pixel-font text-sm text-yellow-400">Impact</span>
                    </div>
                    <p className="pixel-font text-xs text-gray-300">{project.impact}</p>
                  </div>

                  <div className="flex gap-2">
                    {project.links.demo && (
                      <motion.a
                        href={project.links.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pixel-button px-3 py-2 flex items-center gap-2 hover:bg-green-600 transition-colors flex-1 justify-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Globe className="w-4 h-4" />
                        <span className="pixel-font text-xs">Demo</span>
                      </motion.a>
                    )}
                    {project.links.github && (
                      <motion.a
                        href={project.links.github.startsWith('http') ? project.links.github : `https://${project.links.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pixel-button px-3 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors flex-1 justify-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Github className="w-4 h-4" />
                        <span className="pixel-font text-xs">Code</span>
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Open Source Section */}
        {'openSource' in content && content.openSource && (
          <div className="mb-8">
            <h2 className="pixel-font text-xl mb-4 text-yellow-400">{content.openSource.title}</h2>
            <div className="pixel-panel p-6 bg-gray-800 mb-4">
              <p className="pixel-font text-sm text-gray-300 mb-4">{content.openSource.description}</p>
              <div className="space-y-2">
                {content.openSource.contributions.map((contribution: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <Code className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="pixel-font text-sm text-gray-300">{contribution}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skill Categories Section */}
        {'skillCategories' in content && content.skillCategories && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="pixel-font text-xl text-yellow-400">Skill Categories</h2>
              {!showTechStack && (
                <motion.button
                  onClick={() => setShowTechStack(true)}
                  className="pixel-button px-3 py-2 flex items-center gap-2 hover:bg-cyan-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Code className="w-4 h-4" />
                  <span className="pixel-font text-xs">View Tech Stack</span>
                </motion.button>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(content as any).skillCategories.map((category: any, index: number) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="pixel-panel p-6 bg-gray-800"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="pixel-font text-lg text-cyan-400 mb-1">{category.title}</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-gray-700 rounded flex-1 pixel-border">
                          <motion.div
                            className="h-2 bg-gradient-to-r from-cyan-400 to-yellow-400 rounded"
                            initial={{ width: 0 }}
                            animate={{ width: `${category.proficiency}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
                          />
                        </div>
                        <span className="pixel-font text-xs text-yellow-400">{category.proficiency}%</span>
                      </div>
                    </div>
                  </div>

                  <p className="pixel-font text-xs text-gray-300 mb-4 leading-relaxed">
                    {category.description}
                  </p>

                  <div className="space-y-2">
                    {category.skills.map((skill: any, skillIndex: number) => (
                      <div key={skillIndex} className="flex justify-between items-center">
                        <span className="pixel-font text-sm text-gray-200">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-gray-700 rounded flex-1 w-16 pixel-border">
                            <motion.div
                              className="h-1.5 bg-cyan-400 rounded"
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.level}%` }}
                              transition={{ delay: index * 0.1 + skillIndex * 0.05 + 0.5, duration: 0.8 }}
                            />
                          </div>
                          <span className="pixel-font text-xs text-cyan-400 w-8">{skill.level}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {'certifications' in content && content.certifications && (
          <div className="mb-8">
            <h2 className="pixel-font text-xl mb-4 text-yellow-400 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Certifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(content as any).certifications.map((cert: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="pixel-panel p-4 bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="pixel-font text-sm text-cyan-400 mb-1">{cert.name}</h3>
                      <p className="pixel-font text-xs text-gray-400">{cert.issuer}</p>
                    </div>
                    <span className={`pixel-font text-xs px-2 py-1 rounded ${
                      cert.status === 'Certified' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                    }`}>
                      {cert.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        {'contact' in content && content.contact && (
          <div className="mb-8">
            <h2 className="pixel-font text-xl mb-4 text-yellow-400">Get In Touch</h2>
            <div className="flex flex-wrap gap-3">
              {content.contact.email && (
                <motion.a
                  href={`mailto:${content.contact.email}`}
                  className="pixel-button px-4 py-2 flex items-center gap-2 hover:bg-blue-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail className="w-4 h-4" />
                  <span className="pixel-font text-xs">Email</span>
                </motion.a>
              )}
              {content.contact.linkedin && (
                <motion.a
                  href={`https://${content.contact.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pixel-button px-4 py-2 flex items-center gap-2 hover:bg-blue-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="pixel-font text-xs">LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </motion.a>
              )}
              {content.contact.github && (
                <motion.a
                  href={`https://${content.contact.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pixel-button px-4 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github className="w-4 h-4" />
                  <span className="pixel-font text-xs">GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </motion.a>
              )}
            </div>
          </div>
        )}

        {/* Legacy content for other zones */}
        {!('highlights' in content) && !('skills' in content) && !('contact' in content) && 'content' in content && content.content && (
        <div className="pixel-font text-sm leading-relaxed whitespace-pre-line text-white">
          {content.content}
        </div>
        )}

        {/* Press ESC hint */}
        <div className="mt-8 pt-4 border-t-4 border-gray-700">
          <p className="pixel-font text-xs text-gray-400 text-center">
            Press ESC or click outside to close
          </p>
        </div>
      </motion.div>

      {/* Projects Page Overlay */}
      {showProjectsPage && (
        <ProjectsPage onClose={() => setShowProjectsPage(false)} />
      )}

      {/* Tech Stack Overlay */}
      {showTechStack && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
          onClick={() => setShowTechStack(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="pixel-panel w-full max-w-6xl h-[90vh] overflow-hidden bg-gray-900 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b-4 border-gray-700">
              <div>
                <h1 className="pixel-font text-3xl text-yellow-400 mb-1">Technology Stack</h1>
                <p className="pixel-font text-sm text-gray-400">
                  Detailed view of my technical expertise
                </p>
              </div>
              <button
                onClick={() => setShowTechStack(false)}
                className="pixel-button p-3 hover:bg-red-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <TechStack />
            </div>

            <div className="p-4 border-t-4 border-gray-700 bg-gray-800">
              <p className="pixel-font text-xs text-gray-400 text-center">
                Press ESC to close
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

