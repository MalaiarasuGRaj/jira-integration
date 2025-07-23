import { JiraCredentials, JiraProject } from '../types/jira';

class JiraApiService {
  private createAuthHeader(credentials: JiraCredentials): string {
    const auth = btoa(`${credentials.email}:${credentials.apiToken}`);
    return `Basic ${auth}`;
  }

  /**
   * Get the base URL for Jira API calls using the user-provided domain
   * IMPORTANT: Direct API calls to Jira Cloud may encounter CORS issues in browsers.
   * If CORS errors occur, users may need to:
   * 1. Use a browser extension to disable CORS (development only)
   * 2. Run Chrome with --disable-web-security flag (development only)
   * 3. Configure a custom proxy server for production use
   * 4. Use Jira's OAuth 2.0 flow instead of API tokens for browser-based apps
   */
  private getApiBaseUrl(domain: string): string {
    // Ensure domain has protocol
    const normalizedDomain = domain.startsWith('http') ? domain : `https://${domain}`;
    return normalizedDomain;
  }

  // PUBLIC_INTERFACE
  /**
   * Verify user credentials against their Jira instance
   * @param credentials - User's Jira credentials including domain, email, and API token
   * @returns Promise<boolean> - true if credentials are valid
   */
  async verifyCredentials(credentials: JiraCredentials): Promise<boolean> {
    try {
      const baseUrl = this.getApiBaseUrl(credentials.domain);
      const response = await fetch(`${baseUrl}/rest/api/3/myself`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(credentials),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Provide more specific error messages based on status codes
        if (response.status === 401) {
          throw new Error('Invalid credentials. Please check your email and API token.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Your account may not have API access permissions.');
        } else if (response.status === 404) {
          throw new Error('Jira instance not found. Please verify your domain is correct.');
        } else {
          throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
        }
      }

      return true;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // This is likely a CORS error
        throw new Error(
          'Unable to connect to Jira API. This may be due to CORS restrictions.\n' +
          'For development, you can:\n' +
          '1. Use a browser extension to disable CORS\n' +
          '2. Run Chrome with --disable-web-security flag\n' +
          'For production, consider implementing a backend proxy server.'
        );
      }
      console.error('Credential verification failed:', error);
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Fetch all projects accessible to the authenticated user
   * @param credentials - User's Jira credentials
   * @returns Promise<JiraProject[]> - Array of Jira projects
   */
  async fetchProjects(credentials: JiraCredentials): Promise<JiraProject[]> {
    try {
      const baseUrl = this.getApiBaseUrl(credentials.domain);
      const response = await fetch(`${baseUrl}/rest/api/3/project`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(credentials),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You may not have permission to view projects.');
        } else {
          throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
        }
      }

      const projects: JiraProject[] = await response.json();
      return projects;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(
          'Unable to connect to Jira API. Please check your internet connection and domain.\n' +
          'If the issue persists, this may be due to CORS restrictions requiring a proxy server.'
        );
      }
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Fetch detailed information for a specific project
   * @param credentials - User's Jira credentials
   * @param projectKey - The key of the project to fetch details for
   * @returns Promise<JiraProject> - Detailed project information
   */
  async fetchProjectDetails(credentials: JiraCredentials, projectKey: string): Promise<JiraProject> {
    try {
      const baseUrl = this.getApiBaseUrl(credentials.domain);
      const response = await fetch(`${baseUrl}/rest/api/3/project/${projectKey}`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(credentials),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You may not have permission to view this project.');
        } else if (response.status === 404) {
          throw new Error('Project not found. The project may have been deleted or moved.');
        } else {
          throw new Error(`Failed to fetch project details: ${response.status} ${response.statusText}`);
        }
      }

      const project: JiraProject = await response.json();
      return project;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(
          'Unable to connect to Jira API. Please check your internet connection.\n' +
          'If the issue persists, this may be due to CORS restrictions.'
        );
      }
      console.error('Failed to fetch project details:', error);
      throw error;
    }
  }
}

export const jiraApi = new JiraApiService();