import { Request, Response } from 'express';
import { jiraService } from '../services/jiraService.js';
import { JiraCredentials } from '../types/jira.js';

export class JiraController {
  async verifyCredentials(req: Request, res: Response) {
    try {
      const credentials: JiraCredentials = req.body;
      
      if (!credentials.email || !credentials.apiToken || !credentials.domain) {
        return res.status(400).json({
          success: false,
          error: 'Missing required credentials'
        });
      }

      const isValid = await jiraService.verifyCredentials(credentials);
      
      res.json({
        success: true,
        data: { isValid }
      });
    } catch (error) {
      console.error('Error verifying credentials:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getProjects(req: Request, res: Response) {
    try {
      const credentials: JiraCredentials = req.body;
      
      if (!credentials.email || !credentials.apiToken || !credentials.domain) {
        return res.status(400).json({
          success: false,
          error: 'Missing required credentials'
        });
      }

      const projects = await jiraService.fetchProjects(credentials);
      
      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch projects'
      });
    }
  }

  async getProjectDetails(req: Request, res: Response) {
    try {
      const { projectKey } = req.params;
      const credentials: JiraCredentials = req.body;
      
      if (!credentials.email || !credentials.apiToken || !credentials.domain) {
        return res.status(400).json({
          success: false,
          error: 'Missing required credentials'
        });
      }

      const project = await jiraService.fetchProjectDetails(credentials, projectKey);
      
      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Error fetching project details:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project details'
      });
    }
  }

  async getIssuesByType(req: Request, res: Response) {
    try {
      const { projectKey, issueTypeId } = req.params;
      const credentials: JiraCredentials = req.body;
      
      if (!credentials.email || !credentials.apiToken || !credentials.domain) {
        return res.status(400).json({
          success: false,
          error: 'Missing required credentials'
        });
      }

      const issues = await jiraService.fetchIssuesByType(credentials, projectKey, issueTypeId);
      
      res.json({
        success: true,
        data: issues
      });
    } catch (error) {
      console.error('Error fetching issues:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch issues'
      });
    }
  }
}

export const jiraController = new JiraController();