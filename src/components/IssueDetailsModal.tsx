import React from 'react';
import { X, Bug, CheckCircle, Clock, AlertCircle, User, Calendar, Tag, FileText, ExternalLink } from 'lucide-react';
import { JiraIssue, JiraCredentials } from '../types/jira';

interface IssueDetailsModalProps {
  issue: JiraIssue;
  credentials: JiraCredentials;
  onClose: () => void;
}

export function IssueDetailsModal({ issue, credentials, onClose }: IssueDetailsModalProps) {
  const getStatusColor = (statusCategory: string) => {
    switch (statusCategory.toLowerCase()) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'to do':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (statusCategory: string) => {
    switch (statusCategory.toLowerCase()) {
      case 'done':
        return <CheckCircle className="w-4 h-4" />;
      case 'in progress':
        return <Clock className="w-4 h-4" />;
      case 'to do':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bug className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown';
    }
  };

  const getIssueUrl = () => {
    const baseUrl = credentials.domain.startsWith('http') ? credentials.domain : `https://${credentials.domain}`;
    return `${baseUrl}/browse/${issue.key}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {issue.fields.issuetype.iconUrl && (
                <img
                  src={issue.fields.issuetype.iconUrl}
                  alt={issue.fields.issuetype.name}
                  className="w-12 h-12 bg-white rounded-lg p-2"
                />
              )}
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold">{issue.key}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(issue.fields.status.statusCategory.name)}`}>
                    {getStatusIcon(issue.fields.status.statusCategory.name)}
                    <span>{issue.fields.status.name}</span>
                  </span>
                </div>
                <h3 className="text-lg text-white text-opacity-90 mb-2">{issue.fields.summary}</h3>
                <div className="flex items-center space-x-4 text-sm text-white text-opacity-80">
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                    {issue.fields.issuetype.name}
                  </span>
                  {issue.fields.priority && (
                    <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-2 py-1 rounded">
                      <img src={issue.fields.priority.iconUrl} alt={issue.fields.priority.name} className="w-4 h-4" />
                      <span>{issue.fields.priority.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={getIssueUrl()}
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* Description */}
            {issue.fields.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Description
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {issue.fields.description}
                  </p>
                </div>
              </div>
            )}

            {/* Issue Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* People */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  People
                </h3>
                <div className="space-y-4">
                  {issue.fields.assignee && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Assignee</p>
                      <div className="flex items-center space-x-3">
                        {issue.fields.assignee.avatarUrls?.['32x32'] && (
                          <img
                            src={issue.fields.assignee.avatarUrls['32x32']}
                            alt={issue.fields.assignee.displayName}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="font-medium text-gray-900">
                          {issue.fields.assignee.displayName}
                        </span>
                      </div>
                    </div>
                  )}
                  {issue.fields.reporter && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Reporter</p>
                      <div className="flex items-center space-x-3">
                        {issue.fields.reporter.avatarUrls?.['32x32'] && (
                          <img
                            src={issue.fields.reporter.avatarUrls['32x32']}
                            alt={issue.fields.reporter.displayName}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="font-medium text-gray-900">
                          {issue.fields.reporter.displayName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(issue.fields.created)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(issue.fields.updated)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Labels */}
            {issue.fields.labels && issue.fields.labels.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Labels
                </h3>
                <div className="flex flex-wrap gap-2">
                  {issue.fields.labels.map((label, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Components */}
            {issue.fields.components && issue.fields.components.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Bug className="w-5 h-5 mr-2" />
                  Components
                </h3>
                <div className="flex flex-wrap gap-2">
                  {issue.fields.components.map((component) => (
                    <span
                      key={component.id}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {component.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}