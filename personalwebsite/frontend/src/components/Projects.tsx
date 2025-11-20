import { motion } from 'framer-motion';
import { useState } from 'react';
import { ExternalLink, Github, Calendar, Clock, Award, Grid3X3, List } from 'lucide-react';
import { projects, projectCategories } from '@/data/projects';

type ViewMode = 'grid' | 'list';

export function Projects() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(project => project.category === selectedCategory);

  const featuredProjects = filteredProjects.filter(p => p.featured);
  const otherProjects = filteredProjects.filter(p => !p.featured);

  const ProjectCard = ({ project, index, isCompact = false }: { project: typeof projects[0], index: number, isCompact?: boolean }) => {
    const categoryInfo = projectCategories[project.category];

  return (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
        className={`bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 group ${
          isCompact ? 'p-4' : 'p-6'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`flex-1 min-w-0 ${isCompact ? 'space-y-2' : 'space-y-3'}`}>
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full`}
                style={{ backgroundColor: categoryInfo.color }}
              />
              <h3 className={`font-bold text-white group-hover:text-cyan-400 transition-colors ${isCompact ? 'text-lg' : 'text-xl'}`}>
                {project.title}
              </h3>
            </div>

            <p className={`text-gray-300 ${isCompact ? 'text-sm' : 'text-base'}`}>
              {project.subtitle}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {project.year}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {project.duration || 'Ongoing'}
              </div>
              <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                {categoryInfo.name}
              </span>
                  </div>
                </div>

          <span className={`px-2 py-1 rounded text-xs font-medium ${
            project.status === 'completed' ? 'bg-green-600/20 text-green-400 border border-green-600/30' :
            project.status === 'in-progress' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' :
            'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
          }`}>
            {project.status.replace('-', ' ').toUpperCase()}
          </span>
                  </div>

        {!isCompact && (
          <p className="text-gray-400 mb-4 leading-relaxed">
                    {project.description}
                  </p>
        )}

        {!isCompact && project.impact && (
          <div className="bg-gray-700/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Impact</span>
            </div>
            <p className="text-sm text-gray-300">{project.impact}</p>
          </div>
        )}

        {!isCompact && (
          <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
              {project.technologies.slice(0, 6).map((tech, techIndex) => (
                      <span
                        key={techIndex}
                  className="px-2 py-1 bg-gray-700 text-cyan-300 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
              {project.technologies.length > 6 && (
                <span className="px-2 py-1 bg-gray-600 text-gray-400 rounded text-xs">
                  +{project.technologies.length - 6} more
                </span>
              )}
                </div>
          </div>
        )}

        <div className="flex gap-3">
          {project.liveUrl && (
            <motion.a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 rounded-lg transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink className="w-4 h-4" />
              Live Demo
            </motion.a>
          )}
          {project.githubUrl && (
            <motion.a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-4 h-4" />
              Source
            </motion.a>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <section className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            My <span className="bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">Projects</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A showcase of my work in AI/ML, web development, and healthcare technology
          </p>
        </motion.div>

        {/* Filters and Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-12"
        >
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              All Projects ({projects.length})
            </button>
            {Object.entries(projectCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name} ({projects.filter(p => p.category === key).length})
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-cyan-400/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-cyan-400/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              Featured Projects
            </h3>

            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-8'
                : 'space-y-6'
            }>
              {featuredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isCompact={viewMode === 'list'}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Other Projects */}
        {otherProjects.length > 0 && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-white mb-8">
              Other Projects
            </h3>

            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {otherProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isCompact={true}
                />
              ))}
            </div>
          </motion.div>
        )}

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No projects found</h3>
            <p className="text-gray-500">Try adjusting your filter criteria</p>
        </motion.div>
        )}
      </div>
    </section>
  );
}