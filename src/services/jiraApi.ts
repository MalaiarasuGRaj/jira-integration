import { JiraCredentials, JiraProject } from '../types/jira';

class JiraApiService {
  private createAuthHeader(credentials: JiraCredentials): string {
    const auth = btoa(`${credentials.email}:${credentials.apiToken}`);
    return `Basic ${auth}`;
  }

  // Use a fixed proxy base URL for all API calls
  private getProxyBaseUrl(): string {
    return '/api/jira';
  }

  async verifyCredentials(credentials: JiraCredentials): Promise<boolean> {
    try {
      const baseUrl = this.getProxyBaseUrl(); // Use the proxy base URL
      const response = await fetch(`${baseUrl}/rest/api/3/myself`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(credentials),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Credential verification failed:', error);
      return false;
    }
  }

  async fetchProjects(credentials: JiraCredentials): Promise<JiraProject[]> {
    try {
      const baseUrl = this.getProxyBaseUrl(); // Use the proxy base URL
      const response = await fetch(`${baseUrl}/rest/api/3/project`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(credentials),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const projects: JiraProject[] = await response.json();
      return projects;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw new Error('Failed to fetch projects. Please check your credentials and try again.');
    }
  }

  async fetchProjectDetails(credentials: JiraCredentials, projectKey: string): Promise<JiraProject> {
    try {
      const baseUrl = this.getProxyBaseUrl(); // Use the proxy base URL
      const response = await fetch(`${baseUrl}/rest/api/3/project/${projectKey}`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(credentials),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project details: ${response.status}`);
      }

      const project: JiraProject = await response.json();
      return project;
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      throw error;
    }
  }

  async fetchIssuesByType(credentials: JiraCredentials, projectKey: string, issueTypeId: string): Promise<JiraIssue[]> {
    try {
      const baseUrl = this.getProxyBaseUrl();
      const jql = `project = ${projectKey} AND issuetype = ${issueTypeId}`;
      const response = await fetch(`${baseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=summary,status,priority,assignee,reporter,created,updated,issuetype,description,labels,components`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(credentials),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch issues: ${response.status}`);
      }

      const data = await response.json();
      return data.issues || [];
    } catch (error) {
      console.error('Failed to fetch issues by type:', error);
      throw error;
    }
  }

  async fetchIssueDetails(credentials: JiraCredentials, issueKey: string): Promise<JiraIssue> {
    try {
      const baseUrl = this.getProxyBaseUrl();
      const response = await fetch(`${baseUrl}/rest/api/3/issue/${issueKey}?fields=summary,status,priority,assignee,reporter,created,updated,issuetype,description,labels,components`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(credentials),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch issue details: ${response.status}`);
      }

      const issue: JiraIssue = await response.json();
      return issue;
    } catch (error) {
      console.error('Failed to fetch issue details:', error);
      throw error;
    }
  }
}

export const jiraApi = new JiraApiService();