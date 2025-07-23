// PUBLIC_INTERFACE
/**
 * Utility functions and constants for handling CORS-related issues with Jira API
 */

/**
 * Information about CORS and potential solutions
 */
export const CORS_INFO = {
  developmentSolutions: [
    'Use a browser extension like "CORS Unblock" or "Disable CORS" (Chrome/Firefox)',
    'Launch Chrome with --disable-web-security --user-data-dir=/tmp/chrome_dev_test flags',
    'Use Firefox with security.tls.insecure_fallback_hosts preference set',
    'Test with a different browser that has less strict CORS policies'
  ],
  productionSolutions: [
    'Implement a backend proxy server to handle Jira API requests',
    'Use Jira\'s OAuth 2.0 flow instead of basic authentication',
    'Deploy your application with a CORS proxy service',
    'Configure your server to add appropriate CORS headers'
  ],
  troubleshootingSteps: [
    'Check browser console for CORS error messages',
    'Verify your Jira domain is accessible and correct',
    'Ensure your API token is valid and has necessary permissions',
    'Try the same request using a tool like Postman or curl'
  ]
};

// PUBLIC_INTERFACE
/**
 * Check if an error is likely related to CORS
 * @param error - The error to check
 * @returns boolean - true if the error appears to be CORS-related
 */
export function isCorsError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return message.includes('failed to fetch') || 
           message.includes('network error') ||
           message.includes('cors');
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('cors') || 
           message.includes('cross-origin') ||
           message.includes('blocked by cors policy');
  }
  
  return false;
}

// PUBLIC_INTERFACE
/**
 * Get a user-friendly CORS error message with suggested solutions
 * @param isDevelopment - Whether the app is running in development mode
 * @returns string - Formatted error message with solutions
 */
export function getCorsErrorMessage(isDevelopment: boolean = true): string {
  const solutions = isDevelopment ? CORS_INFO.developmentSolutions : CORS_INFO.productionSolutions;
  
  return `
Unable to connect to Jira API due to CORS (Cross-Origin Resource Sharing) restrictions.

${isDevelopment ? 'Development Solutions:' : 'Production Solutions:'}
${solutions.map((solution, index) => `${index + 1}. ${solution}`).join('\n')}

Troubleshooting Steps:
${CORS_INFO.troubleshootingSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

For more information about CORS, visit: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
  `.trim();
}
