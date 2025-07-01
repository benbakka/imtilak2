// API Configuration and Base Client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const token = localStorage.getItem('authToken');
    
    // Only skip auth token for specific public auth endpoints
    const isPublicAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register-company');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (!isPublicAuthEndpoint && token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        console.error(`API request failed: ${url}, status: ${response.status}`);
        
        if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
          console.log('Authentication error, attempting to refresh token...');
          const refreshed = await this.refreshToken();
          if (refreshed) {
            console.log('Token refreshed successfully, retrying request...');
            return this.request<T>(endpoint, options); // Retry the request
          }
        }
        
        try {
          const errorData = await response.json();
          console.error('Error response data:', errorData);
          
          // Handle different error formats
          if (errorData.message) {
            throw new Error(errorData.message);
          } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
            // Handle validation errors that return a map of field errors
            const errorMessage = Object.entries(errorData)
              .map(([field, message]) => `${field}: ${message}`)
              .join(', ');
            throw new Error(errorMessage);
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (jsonError) {
          console.error('Could not parse error response as JSON:', jsonError);
          throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
        }
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      
      // Check for connection refused errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Connection to backend server failed. Server might be down or not running.');
        throw new Error('Cannot connect to the server. Please ensure the backend server is running.');
      }
      
      // Check for server errors that might be related to database connection issues
      if (error instanceof Error && error.message.includes('HTTP error! status: 500')) {
        console.error('Server error detected, possibly related to database connection issues.');
        throw new Error('The server encountered an error. This might be due to a database connection issue. Please check if the database server is running.');
      }
      
      // If refresh fails or any other auth error, redirect to login
      if (error instanceof Error && error.message.includes('Authentication required')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    
    // If params object is provided, convert it to URL query parameters
    if (params) {
      const queryParams = new URLSearchParams();
      
      // Convert all parameter values to strings
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        // Check if endpoint already has query parameters
        url = endpoint.includes('?') ? `${endpoint}&${queryString}` : `${endpoint}?${queryString}`;
      }
    }
    
    console.log(`API GET request to: ${this.baseURL}${url}`);
    const result = await this.request<T>(url, { method: 'GET' });
    console.log(`API GET response from: ${this.baseURL}${url}`, result);
    return result;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);