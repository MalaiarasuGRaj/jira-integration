import React from 'react';
import { Folder, User, Settings, ExternalLink } from 'lucide-react';
import { JiraProject } from '../types/jira';

interface ProjectCardProps {
  project: JiraProject;
  domain: string;
  onClick: () => void;
}

export function ProjectCard({ project, domain, onClick }: ProjectCardProps) {
  const getProjectTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'software':
        return '💻';
      case 'business':
        return '📊';
      case 'service_desk':
        return '🎧';
      default:
        return '📁';
    }
  };

  const getProjectUrl = () => {
    const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
    return `${baseUrl}/browse/${project.key}`;
  };

  const handleCardClick = () => {
    // Open project in new tab instead of modal
    window.open(getProjectUrl(), '_blank');
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {project.avatarUrls?.['48x48'] ? (
              <img
                src={project.avatarUrls['48x48']}
                alt={`${project.name} avatar`}
                className="w-12 h-12 rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-lg font-semibold">
                {getProjectTypeIcon(project.projectTypeKey)}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                  {project.key}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {project.projectTypeKey.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          <a
            href={getProjectUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Folder className="w-4 h-4" />
              <span>Style</span>
            </div>
            <span className="text-gray-900 font-medium capitalize">
              {project.style || 'Classic'}
            </span>
          </div>

          {project.lead && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>Project Lead</span>
              </div>
              <div className="flex items-center space-x-2">
                {project.lead.avatarUrls?.['24x24'] && (
                  <img
                    src={project.lead.avatarUrls['24x24']}
                    alt={project.lead.displayName}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span className="text-gray-900 font-medium">
                  {project.lead.displayName}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Settings className="w-4 h-4" />
              <span>Access</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              project.isPrivate 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {project.isPrivate ? 'Private' : 'Public'}
            </span>
          </div>

          {project.projectCategory && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Category</span>
              <span className="text-gray-900 font-medium">
                {project.projectCategory.name}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Components: {project.components?.length || 0}</span>
            <span>Issue Types: {project.issueTypes?.length || 0}</span>
            <span>Versions: {project.versions?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}