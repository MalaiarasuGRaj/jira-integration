import { useState, useEffect } from 'react';
import { JiraCredentials, AuthState } from '../types/jira';
import { jiraApi } from '../services/jiraApi';
import { AuthDebugger } from '../utils/authDebugger';

const STORAGE_KEY = 'jira_credentials';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    credentials: null,
    loading: false,
    error: null,
  });

  // Load credentials from session storage on mount
  useEffect(() => {
    const storedCredentials = sessionStorage.getItem(STORAGE_KEY);
    if (storedCredentials) {
      try {
        const credentials = JSON.parse(storedCredentials);
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          credentials,
        }));
      } catch (error) {
        console.error('Failed to parse stored credentials:', error);
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = async (credentials: JiraCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // First, validate credentials format
      const validation = AuthDebugger.validateCredentials(credentials);
      
      if (!validation.isValid) {
        const errorMessage = `Invalid credential format:\n${validation.errors.join('\n')}`;
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return false;
      }

      // Use cleaned credentials for the API call
      const cleanedCredentials = validation.cleanedCredentials;
      console.log('Attempting authentication with cleaned credentials:', {
        email: cleanedCredentials.email,
        domain: cleanedCredentials.domain,
        tokenLength: cleanedCredentials.apiToken.length
      });

      const isValid = await jiraApi.verifyCredentials(cleanedCredentials);
      
      if (isValid) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedCredentials));
        setAuthState({
          isAuthenticated: true,
          credentials: cleanedCredentials,
          loading: false,
          error: null,
        });
        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Invalid credentials. Please check your email, API token, and domain.',
        }));
        return false;
      }
    } catch (error) {
      let errorMessage = 'Authentication failed';
      
      if (error instanceof Error) {
        // Generate comprehensive debug information
        const debugInfo = AuthDebugger.generateDebugInfo(credentials, error);
        console.error(debugInfo);
        
        if (error.message.includes('401')) {
          errorMessage = 'Invalid credentials. Please check:\n• Your Jira email address is correct\n• Your API token is valid and not expired\n• Your domain matches your Jira instance\n• Your account has API access permissions';
        } else if (error.message.includes('403')) {
          errorMessage = 'Access denied. Your account may not have permission to access the Jira API.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Jira instance not found. Please verify your domain is correct.';
        } else if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. This is likely due to CORS restrictions.\n\nTo fix this:\n• Use a browser extension that disables CORS (for testing only)\n• Or contact your administrator about CORS configuration\n• Or use a proxy server';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS error. Your browser is blocking the request to Jira.\n\nThis is a common issue when accessing Jira APIs from web browsers.\nConsider using a CORS proxy or browser extension for testing.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. The Jira instance may be temporarily unavailable.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthState({
      isAuthenticated: false,
      credentials: null,
      loading: false,
      error: null,
    });
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    login,
    logout,
    clearError,
  };
}