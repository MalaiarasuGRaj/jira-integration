import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Globe, LogIn } from 'lucide-react';
import { JiraCredentials } from '../types/jira';

interface LoginFormProps {
  onLogin: (credentials: JiraCredentials) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}

export function LoginForm({ onLogin, loading, error, onClearError }: LoginFormProps) {
  const [credentials, setCredentials] = useState<JiraCredentials>({
    email: '',
    apiToken: '',
    domain: '',
  });
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClearError();
    
    if (!credentials.email || !credentials.apiToken || !credentials.domain) {
      return;
    }
    
    await onLogin(credentials);
  };

  const handleInputChange = (field: keyof JiraCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) onClearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Jira Dashboard</h1>
            <p className="text-gray-600">Connect your Jira account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Jira Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="your-email@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-semibold text-gray-700 mb-2">
                Jira Domain
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="domain"
                  type="text"
                  value={credentials.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="company.atlassian.net"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your Jira instance domain without https:// (e.g., company.atlassian.net)
              </p>
            </div>

            <div>
              <label htmlFor="apiToken" className="block text-sm font-semibold text-gray-700 mb-2">
                API Token
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="apiToken"
                  type={showToken ? 'text' : 'password'}
                  value={credentials.apiToken}
                  onChange={(e) => handleInputChange('apiToken', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your Jira API token"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Generate an API token in your Jira Account Settings
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="text-red-800 text-sm">
                  {error.split('\n').map((line, index) => (
                    <div key={index} className={index > 0 ? 'mt-1' : ''}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !credentials.email || !credentials.apiToken || !credentials.domain}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Connect to Jira</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Your credentials are stored securely in your browser session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}