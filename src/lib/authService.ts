import { User } from '../types';
import { apiClient } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: User['role'];
  companyId: string;
}

export interface RegisterCompanyRequest {
  company: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
  };
  user: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    position?: string;
  };
}

export class AuthService {
  static async signIn(email: string, password: string): Promise<User> {
    try {
      // For demo purposes, if using demo account, return mock data
      if (email === 'admin@demo.com' && password === 'demo123') {
        const mockUser: User = {
          id: '1',
          email: 'admin@demo.com',
          name: 'Admin User',
          role: 'admin',
          company_id: '1',
          company: {
            id: '1',
            name: 'Your Company'
          },
          position: 'System Administrator',
          phone: '+212 6 12 34 56 78',
          created_at: new Date().toISOString()
        };
        
        const mockToken = 'mock-jwt-token-for-demo-purposes';
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        
        return mockUser;
      }
      
      // Real API call for non-demo accounts
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password
      });

      // Ensure the user has a company_id
      if (!response.user.company_id) {
        console.warn('User from API missing company_id, setting default value');
        response.user.company_id = '1'; // Default company ID if missing
      }

      // Store token and user data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));

      return response.user;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw new Error('Invalid email or password');
    }
  }

  static async signUp(email: string, password: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/register', {
        email,
        password,
        name: userData.name,
        role: userData.role,
        companyId: userData.company_id
      });

      // Ensure the user has a company_id
      if (!response.user.company_id) {
        console.warn('Newly registered user missing company_id, setting default value');
        response.user.company_id = '1'; // Default company ID if missing
      }

      // Store token and user data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));

      return response.user;
    } catch (error) {
      console.error('Sign up failed:', error);
      throw new Error('Registration failed');
    }
  }

  static async signOut(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('authToken');

      if (!storedUser || !token) {
        return null;
      }

      // Parse the stored user data
      const user = JSON.parse(storedUser);
      
      // For demo purposes, if using demo account, return stored user
      if (user.email === 'admin@demo.com') {
        return user;
      }

      // Verify token is still valid by making a request
      try {
        const currentUser = await apiClient.get<User>('/auth/me');
        
        // Ensure the user has a valid role
        if (!currentUser.role) {
          currentUser.role = 'viewer'; // Default role if missing
        }
        
        // Ensure the user has a company_id
        if (!currentUser.company_id) {
          console.warn('User missing company_id, setting default value');
          currentUser.company_id = '1'; // Default company ID if missing
        }
        
        // Update stored user with latest data
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return currentUser;
      } catch (error) {
        console.error('Token validation failed:', error);
        // Token invalid, clear storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        return null;
      }
    } catch (error) {
      console.error('Get current user failed:', error);
      // Clear invalid data
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      return null;
    }
  }

  static async refreshToken(): Promise<string | null> {
    try {
      const response = await apiClient.post<{ token: string }>('/auth/refresh');
      localStorage.setItem('authToken', response.token);
      return response.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  static async registerCompany(companyData: RegisterCompanyRequest['company'], userData: RegisterCompanyRequest['user']): Promise<User> {
    try {
      // Temporarily clear any existing token to avoid auth conflicts with public endpoint
      localStorage.removeItem('authToken');
      
      const response = await apiClient.post<LoginResponse>('/auth/register-company', {
        company: {
          name: companyData.name,
          address: companyData.address || '',
          phone: companyData.phone || '',
          email: companyData.email || '',
          website: companyData.website || '',
          description: companyData.description || ''
        },
        user: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          phone: userData.phone || '',
          position: userData.position || 'Administrator'
        }
      });

      if (!response || !response.token || !response.user) {
        throw new Error('Invalid response from server');
      }

      // Ensure the user has a company_id
      if (!response.user.company_id) {
        console.warn('Newly registered company user missing company_id, setting default value');
        response.user.company_id = '1'; // Default company ID if missing
      }

      // Store token and user data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));

      return response.user;
    } catch (error: any) {
      console.error('Company registration failed:', error);

      let errorMessage = 'An unknown error occurred during registration.';
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'object' && !errorData.message) {
          errorMessage = Object.entries(errorData)
            .map(([field, message]) => `${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`)
            .join('\n');
        } 
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } 
      else if (error.request) {
        errorMessage = 'No response from server. Please check your network connection.';
      } 
      else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }
}