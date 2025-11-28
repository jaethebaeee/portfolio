import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ExternalLink, Github, Calendar, Clock, Award, Grid3X3, List, Search, X, Filter } from 'lucide-react';
import { projects, projectCategories } from '@/data/projects';

type ViewMode = 'grid' | 'list';

export function Projects() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProjects = useMemo(() => {
    let filtered = selectedCategory === 'all'
      ? projects
      : projects.filter(project => project.category === selectedCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.subtitle.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.technologies.some(tech => tech.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const filteredFeaturedProjects = useMemo(() => filteredProjects.filter(p => p.featured), [filteredProjects]);
  const filteredOtherProjects = useMemo(() => filteredProjects.filter(p => !p.featured), [filteredProjects]);

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

        {/* Enhanced Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-12 space-y-6"
        >
          {/* Search and Filter Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Filter Toggle */}
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  showFilters
                    ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                    : 'bg-gray-800/80 text-gray-400 hover:text-white border border-gray-600/30 hover:border-gray-500/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Filter className="w-4 h-4" />
              </motion.button>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-800/80 rounded-xl p-1 border border-gray-600/30">
                <motion.button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-cyan-400/20 text-cyan-400 shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-cyan-400/20 text-cyan-400 shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Expandable Category Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter by Category
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedCategory === 'all'
                          ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 shadow-lg'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white border border-transparent'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      All Projects ({projects.length})
                    </motion.button>
                    {Object.entries(projectCategories).map(([key, category]) => (
                      <motion.button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedCategory === key
                            ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 shadow-lg'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white border border-transparent'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name} ({projects.filter(p => p.category === key).length})
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between text-sm text-gray-400"
          >
            <span>
              Showing {filteredProjects.length} of {projects.length} projects
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in ${projectCategories[selectedCategory].name}`}
            </span>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear search
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* Featured Projects */}
        {filteredFeaturedProjects.length > 0 && (
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
              {filteredFeaturedProjects.map((project, index) => (
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
        {filteredOtherProjects.length > 0 && (
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
              {filteredOtherProjects.map((project, index) => (
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