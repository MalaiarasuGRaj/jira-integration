import { Router } from 'express';
import { jiraController } from '../controllers/jiraController.js';

const router = Router();

// POST routes to include credentials in request body
router.post('/verify', jiraController.verifyCredentials.bind(jiraController));
router.post('/projects', jiraController.getProjects.bind(jiraController));
router.post('/projects/:projectKey', jiraController.getProjectDetails.bind(jiraController));
router.post('/projects/:projectKey/issues/:issueTypeId', jiraController.getIssuesByType.bind(jiraController));

export default router;