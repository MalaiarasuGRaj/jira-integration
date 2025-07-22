import { useState, useEffect } from 'react';
import { JiraCredentials, AuthState } from '../types/jira';
import { jiraApi } from '../services/jiraApi';

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
      const isValid = await jiraApi.verifyCredentials(credentials);
      
      if (isValid) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
        setAuthState({
          isAuthenticated: true,
          credentials,
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
        if (error.message.includes('401')) {
          errorMessage = 'Invalid credentials. Please check:\n• Your Jira email address is correct\n• Your API token is valid and not expired\n• Your domain matches your Jira instance\n• Your account has API access permissions';
        } else if (error.message.includes('403')) {
          errorMessage = 'Access denied. Your account may not have permission to access the Jira API.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Jira instance not found. Please verify your domain is correct.';
        } else {
          errorMessage = error.message;
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