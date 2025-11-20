import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  X,
  Filter,
  Search,
  Github,
  Clock,
  Award,
  Calendar,
  Code,
  Globe,
  ChevronDown,
  Grid3X3,
  List
} from 'lucide-react';
import { projects, projectCategories, Project } from '@/data/projects';

type ViewMode = 'grid' | 'list';
type SortBy = 'year' | 'title' | 'category';

interface ProjectsPageProps {
  onClose: () => void;
}

export function ProjectsPage({ onClose }: ProjectsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Project['category'] | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<Project['status'] | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('year');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedProjects = useMemo(() => {
    const filtered = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'year':
          return b.year - a.year;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedStatus, sortBy]);

  const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
    const categoryInfo = projectCategories[project.category];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="pixel-panel p-6 bg-gray-800 hover:bg-gray-750 transition-colors cursor-pointer group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{categoryInfo.icon}</span>
              <h3 className="pixel-font text-xl text-cyan-400 group-hover:text-yellow-400 transition-colors">
                {project.title}
              </h3>
            </div>
            <p className="pixel-font text-sm text-gray-300 mb-2">{project.subtitle}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {project.year}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {project.duration || 'Ongoing'}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`pixel-font text-xs px-2 py-1 rounded ${
              project.status === 'completed' ? 'bg-green-600 text-white' :
              project.status === 'in-progress' ? 'bg-blue-600 text-white' : 'bg-yellow-600 text-white'
            }`}>
              {project.status.replace('-', ' ').toUpperCase()}
            </span>
            <div
              className="w-4 h-4 rounded-full border-2 border-gray-600"
              style={{ backgroundColor: categoryInfo.color }}
            />
          </div>
        </div>

        <p className="pixel-font text-sm text-gray-300 mb-4 leading-relaxed">
          {project.description}
        </p>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {project.technologies.slice(0, 4).map((tech, techIndex) => (
              <span
                key={techIndex}
                className="pixel-font text-xs px-2 py-1 bg-gray-700 text-cyan-300 rounded"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="pixel-font text-xs px-2 py-1 bg-gray-600 text-gray-400 rounded">
                +{project.technologies.length - 4} more
              </span>
            )}
          </div>
        </div>

        {project.impact && (
          <div className="mb-4 p-3 bg-gray-700 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="pixel-font text-sm text-yellow-400">Impact</span>
            </div>
            <p className="pixel-font text-xs text-gray-300">{project.impact}</p>
          </div>
        )}

        <div className="flex gap-2">
          {project.liveUrl && (
            <motion.a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-button px-3 py-2 flex items-center gap-2 hover:bg-green-600 transition-colors flex-1 justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="w-4 h-4" />
              <span className="pixel-font text-xs">Live Demo</span>
            </motion.a>
          )}
          {project.githubUrl && (
            <motion.a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-button px-3 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors flex-1 justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-4 h-4" />
              <span className="pixel-font text-xs">Source</span>
            </motion.a>
          )}
        </div>
      </motion.div>
    );
  };

  const ProjectListItem = ({ project, index }: { project: Project; index: number }) => {
    const categoryInfo = projectCategories[project.category];

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="pixel-panel p-4 bg-gray-800 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${categoryInfo.color}20`, border: `2px solid ${categoryInfo.color}` }}
            >
              {categoryInfo.icon}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="pixel-font text-lg text-cyan-400 truncate">{project.title}</h3>
              <span className={`pixel-font text-xs px-2 py-1 rounded ${
                project.status === 'completed' ? 'bg-green-600' :
                project.status === 'in-progress' ? 'bg-blue-600' : 'bg-yellow-600'
              } text-white`}>
                {project.status.replace('-', ' ')}
              </span>
            </div>
            <p className="pixel-font text-sm text-gray-300 truncate mb-2">{project.subtitle}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>{categoryInfo.name}</span>
              <span>{project.year}</span>
              <div className="flex flex-wrap gap-1">
                {project.technologies.slice(0, 3).map((tech, techIndex) => (
                  <span key={techIndex} className="bg-gray-700 text-cyan-300 px-1 py-0.5 rounded text-xs">
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 3 && (
                  <span className="bg-gray-600 text-gray-400 px-1 py-0.5 rounded text-xs">
                    +{project.technologies.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {project.liveUrl && (
              <motion.a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pixel-button p-2 hover:bg-green-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe className="w-4 h-4" />
              </motion.a>
            )}
            {project.githubUrl && (
              <motion.a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pixel-button p-2 hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-4 h-4" />
              </motion.a>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="pixel-panel w-full max-w-7xl h-[90vh] overflow-hidden bg-gray-900 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-gray-700">
          <div>
            <h1 className="pixel-font text-3xl text-yellow-400 mb-1">Project Portfolio</h1>
            <p className="pixel-font text-sm text-gray-400">
              {filteredAndSortedProjects.length} of {projects.length} projects
            </p>
          </div>
          <button
            onClick={onClose}
            className="pixel-button p-3 hover:bg-red-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b-4 border-gray-700">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, technologies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pixel-input pl-10 pr-4 py-2 w-full bg-gray-800 border-2 border-gray-600 focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`pixel-button px-4 py-2 flex items-center gap-2 transition-colors ${
                showFilters ? 'bg-cyan-600' : 'hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="pixel-input px-3 py-2 bg-gray-800 border-2 border-gray-600 focus:border-cyan-400"
            >
              <option value="year">Sort by Year</option>
              <option value="title">Sort by Title</option>
              <option value="category">Sort by Category</option>
            </select>

            {/* View Mode */}
            <div className="flex bg-gray-800 border-2 border-gray-600 rounded">
              <button
                onClick={() => setViewMode('grid')}
                className={`pixel-button px-3 py-2 rounded-l ${
                  viewMode === 'grid' ? 'bg-cyan-600' : 'hover:bg-gray-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`pixel-button px-3 py-2 rounded-r ${
                  viewMode === 'list' ? 'bg-cyan-600' : 'hover:bg-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t-2 border-gray-700"
              >
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="pixel-font text-sm text-gray-400 block mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as Project['category'] | 'all')}
                      className="pixel-input px-3 py-2 bg-gray-800 border-2 border-gray-600 focus:border-cyan-400"
                    >
                      <option value="all">All Categories</option>
                      {Object.entries(projectCategories).map(([key, category]) => (
                        <option key={key} value={key}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="pixel-font text-sm text-gray-400 block mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as Project['status'] | 'all')}
                      className="pixel-input px-3 py-2 bg-gray-800 border-2 border-gray-600 focus:border-cyan-400"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="planned">Planned</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredAndSortedProjects.length === 0 ? (
            <div className="text-center py-12">
              <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="pixel-font text-xl text-gray-400 mb-2">No projects found</h3>
              <p className="pixel-font text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredAndSortedProjects.map((project, index) =>
                viewMode === 'grid' ? (
                  <ProjectCard key={project.id} project={project} index={index} />
                ) : (
                  <ProjectListItem key={project.id} project={project} index={index} />
                )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-4 border-gray-700 bg-gray-800">
          <p className="pixel-font text-xs text-gray-400 text-center">
            Press ESC to close • Use filters to find specific projects
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
