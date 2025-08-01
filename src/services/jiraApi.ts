import { JiraCredentials, JiraProject, JiraIssue, ApiResponse } from '../types/jira';
import { apiClient } from './apiClient';

class JiraApiService {
  async verifyCredentials(credentials: JiraCredentials): Promise<boolean> {
    try {
      const response = await apiClient.post<any>('/myself', credentials);
      return response.status === 200;
    } catch (error) {
      console.error('Credential verification failed:', error);
      return false;
    }
  }

  async fetchProjects(credentials: JiraCredentials): Promise<JiraProject[]> {
    try {
      const response = await apiClient.post<JiraProject[]>('/project', credentials);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchProjectDetails(credentials: JiraCredentials, projectKey: string): Promise<JiraProject> {
    try {
      const baseUrl = this.getProxyBaseUrl(); // Use the proxy base URL
      const response = await apiClient.post<JiraProject>(`/project/${projectKey}`, { 
        ...credentials, 
        projectKey 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      throw new Error(`Failed to fetch project details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchIssuesByType(credentials: JiraCredentials, projectKey: string, issueTypeId: string): Promise<JiraIssue[]> {
    try {
      const baseUrl = this.getProxyBaseUrl(); // Use the proxy base URL
      const jql = `project = ${projectKey} AND issuetype = ${issueTypeId}`;
      const response = await apiClient.post<{issues: JiraIssue[]}>(`/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=summary,status,priority,assignee,reporter,created,updated,issuetype`, { 
        ...credentials, 
        projectKey, 
        issueTypeId 
      });
      return response.data.issues || [];
    } catch (error) {
      console.error('Failed to fetch issues by type:', error);
      throw new Error(`Failed to fetch issues by type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

}

export const jiraApi = new JiraApiService();