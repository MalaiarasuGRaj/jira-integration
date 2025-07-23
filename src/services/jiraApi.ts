import { JiraCredentials, JiraProject, JiraIssue } from '../types/jira';

class JiraApiService {
  private createAuthHeader(credentials: JiraCredentials): string {
    const auth = btoa(`${credentials.email}:${credentials.apiToken}`);
    return `Basic ${auth}`;
  }

  private getBaseUrl(domain: string): string {
    return domain.startsWith('http') ? domain : `https://${domain}`;
  }

  // PUBLIC_INTERFACE
  /**
   * Verifies the provided Jira credentials by making a test API call
   * @param credentials - The Jira credentials to verify
   * @returns Promise<boolean> - True if credentials are valid, false otherwise
   */
  async verifyCredentials(credentials: JiraCredentials): Promise<boolean> {
    try {
      const baseUrl = this.getBaseUrl(credentials.domain);
      const response = await fetch(`${baseUrl}/rest/api/3/myself`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(credentials),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Authentication failed:', {
          status: response.status,
          statusText: response.statusText,
          response: responseText,
          url: `${baseUrl}/rest/api/3/myself`
        });
        
        // Provide more specific error messages based on status codes
        if (response.status === 401) {
          throw new Error('401 - Invalid credentials. Please check your email and API token.');
        } else if (response.status === 403) {
          throw new Error('403 - Access denied. Your account may not have API access permissions.');
        } else if (response.status === 404) {
          throw new Error('404 - Jira instance not found. Please verify your domain is correct.');
        } else {
          throw new Error(`${response.status} - ${response.statusText}`);
        }
      }

      const userData = await response.json();
      console.log('Authentication successful for user:', userData.displayName);
      return true;
    } catch (error) {
      console.error('Credential verification failed:', error);
      
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error - Unable to connect to Jira. This may be due to CORS restrictions or network connectivity issues.');
      }
      
      throw error; // Re-throw to provide better error details
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Fetches all accessible Jira projects for the authenticated user
   * @param credentials - The Jira credentials
   * @returns Promise<JiraProject[]> - Array of Jira projects
   */
  async fetchProjects(credentials: JiraCredentials): Promise<JiraProject[]> {
    try {
      const baseUrl = this.getBaseUrl(credentials.domain);
      const response = await fetch(`${baseUrl}/rest/api/3/project`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(credentials),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Failed to fetch projects:', {
          status: response.status,
          statusText: response.statusText,
          response: responseText,
          url: `${baseUrl}/rest/api/3/project`
        });
        throw new Error(`Failed to fetch projects: ${response.status} - ${response.statusText}`);
      }

      const projects: JiraProject[] = await response.json();
      console.log(`Successfully fetched ${projects.length} projects`);
      return projects;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error - Unable to fetch projects. This may be due to CORS restrictions.');
      }
      
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Fetches detailed information for a specific Jira project
   * @param credentials - The Jira credentials
   * @param projectKey - The project key
   * @returns Promise<JiraProject> - Detailed project information
   */
  async fetchProjectDetails(credentials: JiraCredentials, projectKey: string): Promise<JiraProject> {
    try {
      const baseUrl = this.getBaseUrl(credentials.domain);
      const response = await fetch(`${baseUrl}/rest/api/3/project/${projectKey}`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(credentials),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Failed to fetch project details:', {
          status: response.status,
          statusText: response.statusText,
          response: responseText,
          url: `${baseUrl}/rest/api/3/project/${projectKey}`
        });
        throw new Error(`Failed to fetch project details: ${response.status} - ${response.statusText}`);
      }

      const project: JiraProject = await response.json();
      console.log(`Successfully fetched details for project: ${project.name}`);
      return project;
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error - Unable to fetch project details. This may be due to CORS restrictions.');
      }
      
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Fetches issues of a specific type within a project
   * @param credentials - The Jira credentials
   * @param projectKey - The project key
   * @param issueTypeId - The issue type ID
   * @returns Promise<JiraIssue[]> - Array of issues
   */
  async fetchIssuesByType(credentials: JiraCredentials, projectKey: string, issueTypeId: string): Promise<JiraIssue[]> {
    try {
      const baseUrl = this.getBaseUrl(credentials.domain);
      const jql = `project = ${projectKey} AND issuetype = ${issueTypeId}`;
      const url = `${baseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=summary,status,priority,assignee,reporter,created,updated,issuetype`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(credentials),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Failed to fetch issues:', {
          status: response.status,
          statusText: response.statusText,
          response: responseText,
          url: url
        });
        throw new Error(`Failed to fetch issues: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const issues = data.issues || [];
      console.log(`Successfully fetched ${issues.length} issues for project ${projectKey}, issue type ${issueTypeId}`);
      return issues;
    } catch (error) {
      console.error('Failed to fetch issues by type:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error - Unable to fetch issues. This may be due to CORS restrictions.');
      }
      
      throw error;
    }
  }
}

export const jiraApi = new JiraApiService();