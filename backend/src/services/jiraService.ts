import fetch from 'node-fetch';
import { JiraCredentials, JiraProject, JiraIssue } from '../types/jira.js';

class JiraService {
  private createAuthHeader(credentials: JiraCredentials): string {
    const auth = Buffer.from(`${credentials.email}:${credentials.apiToken}`).toString('base64');
    return `Basic ${auth}`;
  }

  private getJiraBaseUrl(domain: string): string {
    return domain.startsWith('http') ? domain : `https://${domain}`;
  }

  async verifyCredentials(credentials: JiraCredentials): Promise<boolean> {
    try {
      const baseUrl = this.getJiraBaseUrl(credentials.domain);
      const response = await fetch(`${baseUrl}/rest/api/3/myself`, {
        method: 'GET',
        headers: {
          'Authorization': this.createAuthHeader(credentials),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Credential verification failed:', error);
      return false;
    }
  }

  async fetchProjects(credentials: JiraCredentials): Promise<JiraProject[]> {
    try {
      const baseUrl = this.getJiraBaseUrl(credentials.domain);
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

      const projects = await response.json() as JiraProject[];
      return projects;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw new Error('Failed to fetch projects. Please check your credentials and try again.');
    }
  }

  async fetchProjectDetails(credentials: JiraCredentials, projectKey: string): Promise<JiraProject> {
    try {
      const baseUrl = this.getJiraBaseUrl(credentials.domain);
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

      const project = await response.json() as JiraProject;
      return project;
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      throw error;
    }
  }

  async fetchIssuesByType(credentials: JiraCredentials, projectKey: string, issueTypeId: string): Promise<JiraIssue[]> {
    try {
      const baseUrl = this.getJiraBaseUrl(credentials.domain);
      const jql = `project = ${projectKey} AND issuetype = ${issueTypeId}`;
      const url = `${baseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=summary,status,priority,assignee,reporter,created,updated,issuetype`;
      
      const response = await fetch(url, {
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

      const data = await response.json() as { issues: JiraIssue[] };
      return data.issues || [];
    } catch (error) {
      console.error('Failed to fetch issues by type:', error);
      throw error;
    }
  }
}

export const jiraService = new JiraService();