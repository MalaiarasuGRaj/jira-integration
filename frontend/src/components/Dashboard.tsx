@@ .. @@
 import { LogOut, RefreshCw, Search, Grid, List, Filter } from 'lucide-react';
 import { JiraProject, JiraCredentials } from '../types/jira';
-import { jiraApi } from '../services/jiraApi';
+import { apiClient } from '../services/apiClient';
 import { ProjectCard } from './ProjectCard';
@@ .. @@
     try {
       setLoading(true);
       setError(null);
     }
-      const fetchedProjects = await jiraApi.fetchProjects(credentials);
+      const fetchedProjects = await apiClient.fetchProjects(credentials);
       setProjects(fetchedProjects);