import React from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';

function App() {
  const { isAuthenticated, credentials, loading, error, login, logout, clearError } = useAuth();

  if (isAuthenticated && credentials) {
    return <Dashboard credentials={credentials} onLogout={logout} />;
  }

  return (
    <LoginForm
      onLogin={login}
      loading={loading}
      error={error}
      onClearError={clearError}
    />
  );
}

export default App;