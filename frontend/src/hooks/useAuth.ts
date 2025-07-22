@@ .. @@
 import { useState, useEffect } from 'react';
 import { JiraCredentials, AuthState } from '../types/jira';
-import { jiraApi } from '../services/jiraApi';
+import { apiClient } from '../services/apiClient';
 
 const STORAGE_KEY = 'jira_credentials';
@@ .. @@
     setAuthState(prev => ({ ...prev, loading: true, error: null }));

     try {
     }
-      const isValid = await jiraApi.verifyCredentials(credentials);
+      const isValid = await apiClient.verifyCredentials(credentials);
       
       if (isValid) {
       }