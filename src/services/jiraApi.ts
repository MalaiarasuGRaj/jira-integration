import { JiraCredentials, JiraProject } from '../types/jira';

class JiraApiService {
  async verifyCredentials(credentials: JiraCredentials): Promise<boolean> {
    try {
      const response = await fetch('/api/jira', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          endpoint: '/rest/api/3/myself'
        }),
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
      const response = await fetch('/api/jira', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          endpoint: '/rest/api/3/project'
        }),
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
      const response = await fetch('/api/jira', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          endpoint: `/rest/api/3/project/${projectKey}`
        }),
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
      const jql = `project = ${projectKey} AND issuetype = ${issueTypeId}`;
      const response = await fetch('/api/jira', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          endpoint: `/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=summary,status,priority,assignee,reporter,created,updated,issuetype`
        }),
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
}

export const jiraApi = new JiraApiService();