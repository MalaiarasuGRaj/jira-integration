// PUBLIC_INTERFACE
/**
 * Utility functions for debugging Jira authentication issues
 */
export class AuthDebugger {
  
  // PUBLIC_INTERFACE
  /**
   * Validates the format of Jira credentials
   * @param credentials - The credentials to validate
   * @returns Object with validation results and suggestions
   */
  static validateCredentials(credentials: { email: string; apiToken: string; domain: string }) {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate email
    if (!credentials.email) {
      errors.push('Email is required');
    } else if (!credentials.email.includes('@')) {
      errors.push('Email must be a valid email address');
    }

    // Validate API token
    if (!credentials.apiToken) {
      errors.push('API token is required');
    } else if (credentials.apiToken.length < 10) {
      warnings.push('API token seems too short - make sure you copied the full token');
    }

    // Validate domain
    if (!credentials.domain) {
      errors.push('Domain is required');
    } else {
      // Clean up common domain format issues
      const cleanDomain = credentials.domain.trim().toLowerCase();
      
      if (cleanDomain.includes('http://') || cleanDomain.includes('https://')) {
        suggestions.push('Remove http:// or https:// from the domain - just use "company.atlassian.net"');
      }
      
      if (!cleanDomain.includes('.atlassian.net') && !cleanDomain.includes('.jira.com')) {
        warnings.push('Domain should typically end with .atlassian.net or .jira.com');
      }
      
      if (cleanDomain.includes(' ')) {
        errors.push('Domain should not contain spaces');
      }
      
      if (cleanDomain === 'your-domain.atlassian.net' || cleanDomain === 'company.atlassian.net') {
        errors.push('Please replace "your-domain" or "company" with your actual Jira instance name');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      cleanedCredentials: {
        email: credentials.email.trim(),
        apiToken: credentials.apiToken.trim(),
        domain: this.cleanDomain(credentials.domain)
      }
    };
  }

  // PUBLIC_INTERFACE
  /**
   * Cleans and normalizes a Jira domain
   * @param domain - Raw domain input
   * @returns Cleaned domain
   */
  static cleanDomain(domain: string): string {
    if (!domain) return '';
    
    let cleaned = domain.trim().toLowerCase();
    
    // Remove protocol if present
    cleaned = cleaned.replace(/^https?:\/\//, '');
    
    // Remove trailing slash
    cleaned = cleaned.replace(/\/$/, '');
    
    // Remove /rest/api or other paths if accidentally included
    cleaned = cleaned.split('/')[0];
    
    return cleaned;
  }

  // PUBLIC_INTERFACE
  /**
   * Tests the basic connectivity to a Jira domain
   * @param domain - The domain to test
   * @returns Promise with connection test results
   */
  static async testConnectivity(domain: string): Promise<{
    success: boolean;
    message: string;
    statusCode?: number;
  }> {
    try {
      const cleanedDomain = this.cleanDomain(domain);
      const baseUrl = cleanedDomain.startsWith('http') ? cleanedDomain : `https://${cleanedDomain}`;
      
      // Test basic connectivity by checking if the domain resolves
      const response = await fetch(`${baseUrl}/status`, {
        method: 'GET',
        mode: 'no-cors', // This will limit what we can read but allows the request to go through
      });
      
      return {
        success: true,
        message: 'Domain is reachable',
      };
    } catch (error) {
      return {
        success: false,
        message: `Cannot reach domain: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Generates helpful debug information for authentication failures
   * @param credentials - The credentials that failed
   * @param error - The error that occurred
   * @returns Formatted debug information
   */
  static generateDebugInfo(
    credentials: { email: string; apiToken: string; domain: string },
    error: Error
  ): string {
    const validation = this.validateCredentials(credentials);
    const timestamp = new Date().toISOString();
    
    let debugInfo = `\n=== JIRA AUTHENTICATION DEBUG INFO ===\n`;
    debugInfo += `Timestamp: ${timestamp}\n`;
    debugInfo += `Domain: ${credentials.domain}\n`;
    debugInfo += `Email: ${credentials.email}\n`;
    debugInfo += `API Token Length: ${credentials.apiToken.length}\n`;
    debugInfo += `Error: ${error.message}\n\n`;
    
    if (!validation.isValid) {
      debugInfo += `VALIDATION ERRORS:\n`;
      validation.errors.forEach(err => debugInfo += `  - ${err}\n`);
      debugInfo += `\n`;
    }
    
    if (validation.warnings.length > 0) {
      debugInfo += `WARNINGS:\n`;
      validation.warnings.forEach(warn => debugInfo += `  - ${warn}\n`);
      debugInfo += `\n`;
    }
    
    if (validation.suggestions.length > 0) {
      debugInfo += `SUGGESTIONS:\n`;
      validation.suggestions.forEach(sug => debugInfo += `  - ${sug}\n`);
      debugInfo += `\n`;
    }
    
    debugInfo += `TROUBLESHOOTING STEPS:\n`;
    debugInfo += `1. Verify your Jira domain is correct (e.g., mycompany.atlassian.net)\n`;
    debugInfo += `2. Check that your API token is valid and not expired\n`;
    debugInfo += `3. Ensure your email matches your Jira account\n`;
    debugInfo += `4. Verify your account has API access permissions\n`;
    debugInfo += `5. Try accessing your Jira instance directly in a browser\n`;
    debugInfo += `6. Check if the CORS proxy service is running and accessible\n`;
    debugInfo += `7. Verify network connectivity to your Jira instance through the proxy\n`;
    
    return debugInfo;
  }
}
