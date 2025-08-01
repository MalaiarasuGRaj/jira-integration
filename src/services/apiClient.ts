interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

class ApiClient {
  private baseUrl = '/api';

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    credentials?: any
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(credentials?.domain && { 'X-Jira-Domain': credentials.domain }),
          ...(credentials?.email && credentials?.apiToken && {
            'Authorization': `Basic ${btoa(`${credentials.email}:${credentials.apiToken}`)}`
          }),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.message || response.statusText}`);
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async post<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    }, body);
  }

  async get<T>(endpoint: string, credentials?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'GET',
      headers,
    }, credentials);
  }
}

export const apiClient = new ApiClient();