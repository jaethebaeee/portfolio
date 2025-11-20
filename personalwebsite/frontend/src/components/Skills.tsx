import { motion } from 'framer-motion';
import { useState } from 'react';
import { Code, Brain, Zap, Clock, FolderOpen, TrendingUp } from 'lucide-react';
import { technologies, technologyCategories, getTechnologiesByCategory } from '@/data/technologies';

export function Skills() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof technologyCategories | 'all'>('all');

  const displayTechnologies = selectedCategory === 'all'
    ? technologies.slice(0, 12)
    : getTechnologiesByCategory(selectedCategory as any);

  const stats = {
    totalTechnologies: technologies.length,
    avgProficiency: Math.round(technologies.reduce((sum, tech) => sum + tech.proficiency, 0) / technologies.length),
    totalProjects: technologies.reduce((sum, tech) => sum + tech.projects, 0),
    categoriesCount: Object.keys(technologyCategories).length
  };

  const TechnologyCard = ({ tech, index }: { tech: typeof technologies[0], index: number }) => {
    const categoryInfo = technologyCategories[tech.category];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 group"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-2`}
              style={{
                backgroundColor: `${tech.color}20`,
                borderColor: tech.color
              }}
            >
              {tech.icon}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">
              {tech.name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-400">{categoryInfo.name}</span>
              <span className="text-sm">{categoryInfo.icon}</span>
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
          </div>
        </div>

        {/* Proficiency Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Proficiency</span>
            <span className="text-sm text-cyan-400 font-medium">{tech.proficiency}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: tech.color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${tech.proficiency}%` }}
              transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
              viewport={{ once: true }}
            />
          </div>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed">
          {tech.description}
        </p>
      </motion.div>
    );
  };

  const CategoryButton = ({
    category,
    isSelected,
    onClick,
    count
  }: {
    categoryKey: string;
    category: typeof technologyCategories[keyof typeof technologyCategories];
    isSelected: boolean;
    onClick: () => void;
    count: number;
  }) => (
    <motion.button
      onClick={onClick}
      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
        isSelected
          ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 shadow-lg'
          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{category.icon}</span>
        <span>{category.name}</span>
        <span className="bg-gray-600 px-2 py-0.5 rounded text-xs">
          {count}
        </span>
      </div>
    </motion.button>
  );

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Technical <span className="bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">Skills</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A comprehensive overview of my technical expertise and proficiency levels
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { icon: Code, label: 'Technologies', value: stats.totalTechnologies, color: 'text-blue-400' },
            { icon: TrendingUp, label: 'Avg Proficiency', value: `${stats.avgProficiency}%`, color: 'text-green-400' },
            { icon: FolderOpen, label: 'Total Projects', value: stats.totalProjects, color: 'text-purple-400' },
            { icon: Zap, label: 'Categories', value: stats.categoriesCount, color: 'text-yellow-400' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 text-center"
            >
              <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 justify-center mb-12"
        >
          <motion.button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 shadow-lg'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <span>All Skills ({technologies.length})</span>
            </div>
          </motion.button>

          {Object.entries(technologyCategories).map(([key, category]) => (
            <CategoryButton
              key={key}
              categoryKey={key}
              category={category}
              isSelected={selectedCategory === key}
              onClick={() => setSelectedCategory(key as keyof typeof technologyCategories)}
              count={getTechnologiesByCategory(key as any).length}
            />
          ))}
        </motion.div>

        {/* Technologies Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
          {displayTechnologies.map((tech, index) => (
            <TechnologyCard key={tech.id} tech={tech} index={index} />
            ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-cyan-400/10 to-yellow-400/10 p-8 rounded-lg border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4">Always Learning</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Technology evolves rapidly, and I stay current with the latest developments in AI, machine learning,
              and software engineering. I'm always excited to learn new tools and frameworks.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              <span className="bg-gray-700 px-3 py-1 rounded">Continuous Learning</span>
              <span className="bg-gray-700 px-3 py-1 rounded">Research Driven</span>
              <span className="bg-gray-700 px-3 py-1 rounded">Innovation Focused</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}