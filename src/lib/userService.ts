import { User } from '../types';
import { apiClient } from './api';

export interface UserProfileUpdateRequest {
  name: string;
  email: string;
  phone?: string;
  position?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  static async getUserProfile(userId: string, companyId: string): Promise<User> {
    return apiClient.get<User>(`/users/${userId}/profile`, { companyId: companyId });
  }

  static async updateUserProfile(
    userId: string,
    companyId: string,
    profileData: UserProfileUpdateRequest
  ): Promise<User> {
    return apiClient.put<User>(`/users/${userId}/profile?companyId=${companyId}`, profileData);
  }

  static async changePassword(
    userId: string,
    companyId: string,
    passwordData: ChangePasswordRequest
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/users/${userId}/change-password?companyId=${companyId}`, passwordData);
  }
}