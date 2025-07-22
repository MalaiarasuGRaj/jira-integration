import React, { useState, useEffect } from 'react';
import { X, ExternalLink, User, Calendar, Settings, Folder, Hash, Tag, Clock, AlertCircle, Users } from 'lucide-react';
import { JiraProject, JiraCredentials, JiraIssueType } from '../types/jira';
import { jiraApi } from '../services/jiraApi';
import { IssueTypeModal } from './IssueTypeModal';

interface ProjectDetailsModalProps {
  project: JiraProject;
  credentials: JiraCredentials;
  onClose: () => void;
}

export function ProjectDetailsModal({ project, credentials, onClose }: ProjectDetailsModalProps) {
  const [detailedProject, setDetailedProject] = useState<JiraProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssueType, setSelectedIssueType] = useState<JiraIssueType | null>(null);

  useEffect(() => {
    fetchProjectDetails();
  }, [project.key]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const details = await jiraApi.fetchProjectDetails(credentials, project.key);
      setDetailedProject(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const getProjectUrl = () => {
    const baseUrl = credentials.domain.startsWith('http') ? credentials.domain : `https://${credentials.domain}`;
    return `${baseUrl}/browse/${project.key}`;
  };

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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  const displayProject = detailedProject || project;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {displayProject.avatarUrls?.['48x48'] ? (
                <img
                  src={displayProject.avatarUrls['48x48']}
                  alt={`${displayProject.name} avatar`}
                  className="w-16 h-16 rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">
                  {getProjectTypeIcon(displayProject.projectTypeKey)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold mb-1">{displayProject.name}</h2>
                <div className="flex items-center space-x-3">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-mono">
                    {displayProject.key}
                  </span>
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm capitalize">
                    {displayProject.projectTypeKey.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={getProjectUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
                title="Open in Jira"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                onClick={onClose}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading project details...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-center space-x-2 text-red-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-semibold">Error Loading Details</h3>
              </div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchProjectDetails}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Description */}
              {displayProject.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                    {displayProject.description}
                  </p>
                </div>
              )}

              {/* Project Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Project Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project ID</span>
                      <span className="font-medium text-gray-900">{displayProject.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Style</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {displayProject.style || 'Classic'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Access Level</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        displayProject.isPrivate 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {displayProject.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Simplified</span>
                      <span className="font-medium text-gray-900">
                        {displayProject.simplified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {displayProject.projectCategory && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category</span>
                        <span className="font-medium text-gray-900">
                          {displayProject.projectCategory.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Lead */}
                {displayProject.lead && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Project Lead
                    </h3>
                    <div className="flex items-center space-x-4">
                      {displayProject.lead.avatarUrls?.['48x48'] && (
                        <img
                          src={displayProject.lead.avatarUrls['48x48']}
                          alt={displayProject.lead.displayName}
                          className="w-12 h-12 rounded-full shadow-sm"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {displayProject.lead.displayName}
                        </p>
                        <p className="text-sm text-gray-600">{displayProject.lead.name}</p>
                        <p className="text-xs text-gray-500">
                          Account ID: {displayProject.lead.accountId}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  Project Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {displayProject.components?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Components</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {displayProject.issueTypes?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Issue Types</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {displayProject.versions?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Versions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Object.keys(displayProject.roles || {}).length}
                    </div>
                    <div className="text-sm text-gray-600">Roles</div>
                  </div>
                </div>
              </div>

              {/* Issue Types */}
              {displayProject.issueTypes && displayProject.issueTypes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Issue Types
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {displayProject.issueTypes.map((issueType: any) => (
                      <div 
                        key={issueType.id} 
                        className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all duration-200"
                        onClick={() => setSelectedIssueType(issueType)}
                      >
                        {issueType.iconUrl && (
                          <img src={issueType.iconUrl} alt={issueType.name} className="w-6 h-6" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{issueType.name}</p>
                          {issueType.description && (
                            <p className="text-xs text-gray-500">{issueType.description}</p>
                          )}
                        </div>
                        <div className="ml-auto">
                          <span className="text-xs text-indigo-600 font-medium">View Issues →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Roles */}
              {displayProject.roles && Object.keys(displayProject.roles).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Project Roles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(displayProject.roles).map(([role, url]) => (
                      <div key={role} className="bg-white border border-gray-200 rounded-lg p-3">
                        <span className="font-medium text-gray-900">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Issue Type Modal */}
      {selectedIssueType && (
        <IssueTypeModal
          issueType={selectedIssueType}
          projectKey={displayProject.key}
          credentials={credentials}
          onClose={() => setSelectedIssueType(null)}
        />
      )}
    </div>
  );
}