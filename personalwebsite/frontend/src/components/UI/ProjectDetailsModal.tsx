import React from 'react';
import { Project } from '@/data/projects';
import { X, ExternalLink, Github, Calendar, Users, Star } from 'lucide-react';

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  isOpen,
  onClose
}) => {

  if (!isOpen || !project) return null;

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'planned': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'planned': return 'Planned';
      default: return 'Unknown';
    }
  };

  const getCategoryIcon = (category: Project['category']) => {
    switch (category) {
      case 'ai-ml': return '🤖';
      case 'web-dev': return '💻';
      case 'research': return '🔬';
      case 'mobile': return '📱';
      case 'full-stack': return '⚡';
      default: return '📁';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getCategoryIcon(project.category)}</span>
                <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </div>
              <p className="text-lg text-gray-300 mb-4">{project.subtitle}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{project.year}</span>
                </div>
                {project.duration && (
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{project.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star size={16} />
                  <span>{project.category.replace('-', ' ').toUpperCase()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* App Preview/Images */}
          {project.imageUrl && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">App Preview</h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <p className="text-gray-300">Interactive app preview would be displayed here</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Connect to live demo or display screenshots
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Project Overview</h3>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-300 leading-relaxed">{project.description}</p>
            </div>
          </div>

          {/* Long Description */}
          {project.longDescription && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Technical Details</h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {project.longDescription}
                </div>
              </div>
            </div>
          )}

          {/* Technologies */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full border border-blue-500"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Impact */}
          {project.impact && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Impact & Results</h3>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-300 font-medium">{project.impact}</p>
              </div>
            </div>
          )}

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Links & Resources</h3>
            <div className="flex flex-wrap gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <ExternalLink size={16} />
                  Live Demo
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Github size={16} />
                  Source Code
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6 bg-gray-900/50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Featured: {project.featured ? 'Yes' : 'No'}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
