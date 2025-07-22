@@ .. @@
 import { X, Bug, CheckCircle, Clock, AlertCircle, User, Calendar } from 'lucide-react';
 import { JiraIssueType, JiraIssue, JiraCredentials } from '../types/jira';
-import { jiraApi } from '../services/jiraApi';
+import { apiClient } from '../services/apiClient';
 
 interface IssueTypeModalProps {
 }
@@ .. @@
     try {
       setLoading(true);
       setError(null);
     }
-      const fetchedIssues = await jiraApi.fetchIssuesByType(credentials, projectKey, issueType.id);
+      const fetchedIssues = await apiClient.fetchIssuesByType(credentials, projectKey, issueType.id);
       setIssues(fetchedIssues);