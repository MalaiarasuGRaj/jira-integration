import React, { useState } from 'react';
import { AlertTriangle, Info, Eye, EyeOff } from 'lucide-react';
import { JiraCredentials } from '../types/jira';
import { AuthDebugger } from '../utils/authDebugger';

interface AuthDebugPanelProps {
  credentials: JiraCredentials;
  error: string | null;
  onClose: () => void;
}

// PUBLIC_INTERFACE
/**
 * Debug panel component that helps users troubleshoot Jira authentication issues
 */
export function AuthDebugPanel({ credentials, error, onClose }: AuthDebugPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [testingConnectivity, setTestingConnectivity] = useState(false);
  const [connectivityResult, setConnectivityResult] = useState<string | null>(null);

  const validation = AuthDebugger.validateCredentials(credentials);

  const testConnectivity = async () => {
    setTestingConnectivity(true);
    setConnectivityResult(null);
    
    try {
      const result = await AuthDebugger.testConnectivity(credentials.domain);
      setConnectivityResult(result.success ? 'Domain is reachable' : result.message);
    } catch (err) {
      setConnectivityResult('Connectivity test failed');
    } finally {
      setTestingConnectivity(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-yellow-800">Authentication Debug Information</h3>
        </div>
        <button
          onClick={onClose}
          className="text-yellow-600 hover:text-yellow-800 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Validation Results */}
      {!validation.isValid && (
        <div className="mb-4">
          <h4 className="font-medium text-red-800 mb-2">Validation Errors:</h4>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.suggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-blue-800 mb-2">Suggestions:</h4>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            {validation.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Connectivity Test */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 mb-2">
          <button
            onClick={testConnectivity}
            disabled={testingConnectivity}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {testingConnectivity ? 'Testing...' : 'Test Connectivity'}
          </button>
          {connectivityResult && (
            <span className="text-sm text-gray-700">{connectivityResult}</span>
          )}
        </div>
      </div>

      {/* Detailed Debug Info */}
      <div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showDetails ? 'Hide' : 'Show'} Technical Details</span>
        </button>

        {showDetails && (
          <div className="mt-3 p-3 bg-gray-100 rounded text-xs font-mono">
            <div className="space-y-2">
              <div><strong>Domain:</strong> {credentials.domain}</div>
              <div><strong>Cleaned Domain:</strong> {validation.cleanedCredentials.domain}</div>
              <div><strong>Email:</strong> {credentials.email}</div>
              <div><strong>API Token Length:</strong> {credentials.apiToken.length}</div>
              {error && <div><strong>Error:</strong> {error}</div>}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Common CORS Issues:</p>
            <p>Modern browsers block direct requests to external APIs like Jira. This is expected behavior and not a bug in your credentials.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
