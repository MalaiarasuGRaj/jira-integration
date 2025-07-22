import React, { useState, useEffect } from 'react';
import { X, Bug, CheckCircle, Clock, AlertCircle, User, Calendar } from 'lucide-react';
import { JiraIssueType, JiraIssue, JiraCredentials } from '../types/jira';
import { jiraApi } from '../services/jiraApi';
import { IssueDetailsModal } from './IssueDetailsModal';

interface IssueTypeModalProps {
  issueType: JiraIssueType;
  projectKey: string;
  credentials: JiraCredentials;
  onClose: () => void;
}

export function IssueTypeModal({ issueType, projectKey, credentials, onClose }: IssueTypeModalProps) {
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<JiraIssue | null>(null);

  useEffect(() => {
    fetchIssues();
  }, [issueType.id, projectKey]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedIssues = await jiraApi.fetchIssuesByType(credentials, projectKey, issueType.id);
      setIssues(fetchedIssues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

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
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  const getIssueUrl = (issueKey: string) => {
    const baseUrl = credentials.domain.startsWith('http') ? credentials.domain : `https://${credentials.domain}`;
    return `${baseUrl}/browse/${issueKey}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {issueType.iconUrl && (
                <img
                  src={issueType.iconUrl}
                  alt={issueType.name}
                  className="w-12 h-12 bg-white rounded-lg p-2"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold mb-1">{issueType.name}</h2>
                <div className="flex items-center space-x-3">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {projectKey}
                  </span>
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {issueType.subtask ? 'Subtask' : 'Standard Issue'}
                  </span>
                </div>
                {issueType.description && (
                  <p className="text-white text-opacity-90 mt-2">{issueType.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading issues...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 text-red-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-semibold">Error Loading Issues</h3>
              </div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchIssues}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Issue Summary</h3>
                <div className="text-3xl font-bold text-indigo-600">
                  {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'}
                </div>
                <p className="text-gray-600">Found in project {projectKey}</p>
              </div>

              {/* Issues List */}
              {issues.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bug className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Issues Found</h3>
                  <p className="text-gray-500">
                    There are no issues of type "{issueType.name}" in this project.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Bug className="w-5 h-5 mr-2" />
                    Issues ({issues.length})
                  </h3>
                  <div className="space-y-3">
                    {issues.map((issue) => (
                      <div key={issue.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <button
                                onClick={() => setSelectedIssue(issue)}
                                className="text-lg font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                              >
                                {issue.key}
                              </button>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(issue.fields.status.statusCategory.name)}`}>
                                {getStatusIcon(issue.fields.status.statusCategory.name)}
                                <span>{issue.fields.status.name}</span>
                              </span>
                              {issue.fields.priority && (
                                <div className="flex items-center space-x-1">
                                  <img src={issue.fields.priority.iconUrl} alt={issue.fields.priority.name} className="w-4 h-4" />
                                  <span className="text-xs text-gray-600">{issue.fields.priority.name}</span>
                                </div>
                              )}
                            </div>
                            <h4 className="text-gray-900 font-medium mb-3">{issue.fields.summary}</h4>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              {issue.fields.assignee && (
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4" />
                                  <span>Assigned to:</span>
                                  <div className="flex items-center space-x-1">
                                    {issue.fields.assignee.avatarUrls?.['24x24'] && (
                                      <img
                                        src={issue.fields.assignee.avatarUrls['24x24']}
                                        alt={issue.fields.assignee.displayName}
                                        className="w-5 h-5 rounded-full"
                                      />
                                    )}
                                    <span className="font-medium">{issue.fields.assignee.displayName}</span>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>Created: {formatDate(issue.fields.created)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>Updated: {formatDate(issue.fields.updated)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Issue Details Modal */}
      {selectedIssue && (
        <IssueDetailsModal
          issue={selectedIssue}
          credentials={credentials}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
}