@@ .. @@
 import { X, ExternalLink, User, Calendar, Settings, Folder, Hash, Tag, Clock, AlertCircle, Users } from 'lucide-react';
 import { JiraProject, JiraCredentials, JiraIssueType } from '../types/jira';
-import { jiraApi } from '../services/jiraApi';
+import { apiClient } from '../services/apiClient';
 import { IssueTypeModal } from './IssueTypeModal';
@@ .. @@
     try {
       setLoading(true);
       setError(null);
-      const details = await jiraApi.fetchProjectDetails(credentials, project.key);
+      const details = await apiClient.fetchProjectDetails(credentials, project.key);
       setDetailedProject(details);