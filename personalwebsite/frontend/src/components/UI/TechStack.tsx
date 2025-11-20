import { motion } from 'framer-motion';
import { useState } from 'react';
import { technologies, technologyCategories, getTechnologiesByCategory, getTopTechnologies } from '@/data/technologies';
import { Code, Star, TrendingUp, Award, Clock, FolderOpen } from 'lucide-react';

export function TechStack() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof technologyCategories | 'all'>('all');

  const displayTechnologies = selectedCategory === 'all'
    ? getTopTechnologies(12)
    : getTechnologiesByCategory(selectedCategory as any);

  const TechnologyCard = ({ tech, index }: { tech: typeof technologies[0]; index: number }) => {
    const categoryInfo = technologyCategories[tech.category];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="pixel-panel p-4 bg-gray-800 hover:bg-gray-750 transition-colors group"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-2"
              style={{
                backgroundColor: `${tech.color}20`,
                borderColor: tech.color
              }}
            >
              {tech.icon}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="pixel-font text-lg text-white group-hover:text-cyan-400 transition-colors truncate">
              {tech.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="pixel-font text-xs text-gray-400">{categoryInfo.name}</span>
              <span className="text-xs">{categoryInfo.icon}</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {tech.experience}
              </div>
              <div className="flex items-center gap-1">
                <FolderOpen className="w-3 h-3" />
                {tech.projects} projects
              </div>
            </div>

            {/* Proficiency Bar */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="pixel-font text-xs text-gray-300">Proficiency</span>
                <span className="pixel-font text-xs text-cyan-400">{tech.proficiency}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded pixel-border">
                <motion.div
                  className="h-2 rounded"
                  style={{ backgroundColor: tech.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${tech.proficiency}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
                />
              </div>
            </div>

            <p className="pixel-font text-xs text-gray-400 leading-relaxed">
              {tech.description}
            </p>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded pointer-events-none" />
      </motion.div>
    );
  };

  const CategoryButton = ({
    categoryKey,
    category,
    isSelected,
    onClick
  }: {
    categoryKey: string;
    category: typeof technologyCategories[keyof typeof technologyCategories];
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <motion.button
      onClick={onClick}
      className={`pixel-button px-4 py-2 flex items-center gap-2 transition-colors ${
        isSelected ? 'bg-cyan-600 text-white' : 'hover:bg-gray-700 text-gray-300'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-lg">{category.icon}</span>
      <span className="pixel-font text-sm">{category.name}</span>
      <span className="pixel-font text-xs bg-gray-600 px-1 py-0.5 rounded ml-1">
        {getTechnologiesByCategory(categoryKey as any).length}
      </span>
    </motion.button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="pixel-font text-2xl text-yellow-400 mb-2 flex items-center justify-center gap-2">
          <Code className="w-8 h-8" />
          Technology Stack
        </h2>
        <p className="pixel-font text-sm text-gray-400">
          Core technologies and tools I work with
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        <motion.button
          onClick={() => setSelectedCategory('all')}
          className={`pixel-button px-4 py-2 flex items-center gap-2 transition-colors ${
            selectedCategory === 'all' ? 'bg-yellow-600 text-white' : 'hover:bg-gray-700 text-gray-300'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Star className="w-4 h-4" />
          <span className="pixel-font text-sm">All ({technologies.length})</span>
        </motion.button>

        {Object.entries(technologyCategories).map(([key, category]) => (
          <CategoryButton
            key={key}
            categoryKey={key}
            category={category}
            isSelected={selectedCategory === key}
            onClick={() => setSelectedCategory(key as keyof typeof technologyCategories)}
          />
        ))}
      </div>

      {/* Technologies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayTechnologies.map((tech, index) => (
          <TechnologyCard key={tech.id} tech={tech} index={index} />
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pixel-panel p-6 bg-gray-800"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="pixel-font text-lg text-green-400">
                {technologies.reduce((sum, tech) => sum + tech.proficiency, 0) / technologies.length}%
              </span>
            </div>
            <p className="pixel-font text-xs text-gray-400">Avg Proficiency</p>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Code className="w-5 h-5 text-cyan-400" />
              <span className="pixel-font text-lg text-cyan-400">{technologies.length}</span>
            </div>
            <p className="pixel-font text-xs text-gray-400">Technologies</p>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <FolderOpen className="w-5 h-5 text-yellow-400" />
              <span className="pixel-font text-lg text-yellow-400">
                {technologies.reduce((sum, tech) => sum + tech.projects, 0)}
              </span>
            </div>
            <p className="pixel-font text-xs text-gray-400">Total Projects</p>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span className="pixel-font text-lg text-purple-400">
                {Object.keys(technologyCategories).length}
              </span>
            </div>
            <p className="pixel-font text-xs text-gray-400">Categories</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


