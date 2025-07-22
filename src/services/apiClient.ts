import { JiraCredentials, JiraProject, JiraIssue, ApiResponse } from '../types/jira';

class ApiClient {
  private baseUrl = '/api';

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async verifyCredentials(credentials: JiraCredentials): Promise<boolean> {
    const response = await this.makeRequest<{ isValid: boolean }>('/jira/verify', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    return response.data?.isValid || false;
  }

  async fetchProjects(credentials: JiraCredentials): Promise<JiraProject[]> {
    const response = await this.makeRequest<JiraProject[]>('/jira/projects', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    return response.data || [];
  }

  async fetchProjectDetails(credentials: JiraCredentials, projectKey: string): Promise<JiraProject> {
    const response = await this.makeRequest<JiraProject>(`/jira/projects/${projectKey}`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.data) {
      throw new Error('No project data received');
    }

    return response.data;
  }

  async fetchIssuesByType(
    credentials: JiraCredentials,
    projectKey: string,
    issueTypeId: string
  ): Promise<JiraIssue[]> {
    const response = await this.makeRequest<JiraIssue[]>(
      `/jira/projects/${projectKey}/issues/${issueTypeId}`,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    return response.data || [];
  }
}

export const apiClient = new ApiClient();