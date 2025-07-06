// src/lib/categoryTeamService.ts
import { CategoryTeam } from '../types';
import { apiClient, PaginatedResponse } from './api';

// Define the backend's expected enum values as a union type
export type BackendTaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'DELAYED';

export interface CategoryTeamCreateRequest {
  teamId: string;
  status?: BackendTaskStatus; // Use BackendTaskStatus here
  receptionStatus?: boolean;
  paymentStatus?: boolean;
  notes?: string;
}

export interface CategoryTeamUpdateRequest {
  status?: BackendTaskStatus; // Use BackendTaskStatus here
  receptionStatus?: boolean;
  paymentStatus?: boolean;
  notes?: string;
  progressPercentage?: number;
}

export class CategoryTeamService {
  static async getCategoryTeamsByCategory(categoryId: string): Promise<CategoryTeam[]> {
    // Correctly pass categoryId as a direct parameter
    return apiClient.get<CategoryTeam[]>('/category-teams', { categoryId: categoryId });
  }

  static async getCategoryTeamsByTeam(
    teamId: string,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<CategoryTeam>> {
    return apiClient.get<PaginatedResponse<CategoryTeam>>(`/category-teams/team/${teamId}`, {
      page: page.toString(),
      size: size.toString()
    });
  }

  static async getCategoryTeam(categoryId: string, teamId: string): Promise<CategoryTeam> {
    return apiClient.get<CategoryTeam>(`/category-teams/${categoryId}/${teamId}`);
  }

  static async createCategoryTeam(
    categoryId: string,
    data: CategoryTeamCreateRequest
  ): Promise<CategoryTeam> {
    return apiClient.post<CategoryTeam>(`/category-teams?categoryId=${categoryId}`, data);
  }

  static async updateCategoryTeam(
    id: string,
    data: CategoryTeamUpdateRequest
  ): Promise<CategoryTeam> {
    try {
      // Convert string ID to number for backend compatibility
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error(`Invalid category team ID: ${id}`);
      }
      console.log('Updating category team with ID:', numericId, 'and data:', data);
      return apiClient.put<CategoryTeam>(`/category-teams/${numericId}`, data);
    } catch (error) {
      console.error('Error in updateCategoryTeam:', error);
      throw error;
    }
  }

  static async deleteCategoryTeam(id: string): Promise<void> {
    return apiClient.delete<void>(`/category-teams/${id}`);
  }

  static async getDelayedTasks(companyId: string, page = 0, size = 20): Promise<PaginatedResponse<CategoryTeam>> {
    return apiClient.get<PaginatedResponse<CategoryTeam>>('/category-teams/delayed', {
      companyId: companyId,
      page: page.toString(),
      size: size.toString()
    });
  }

  static async getTasksStartingSoon(companyId: string, daysAhead = 7, page = 0, size = 20): Promise<PaginatedResponse<CategoryTeam>> {
    return apiClient.get<PaginatedResponse<CategoryTeam>>('/category-teams/starting-soon', {
      companyId: companyId,
      daysAhead: daysAhead.toString(),
      page: page.toString(),
      size: size.toString()
    });
  }

  static async getTasksByStatus(
    companyId: string,
    status: CategoryTeam['status'],
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<CategoryTeam>> {
    return apiClient.get<PaginatedResponse<CategoryTeam>>(`/category-teams/status/${status}`, {
      companyId: companyId,
      page: page.toString(),
      size: size.toString()
    });
  }

  static async countTasksByStatus(companyId: string, status: CategoryTeam['status']): Promise<number> {
    return apiClient.get<number>(`/category-teams/count/${status}`, { companyId: companyId });
  }

  static async getTasksRequiringPayment(companyId: string, page = 0, size = 20): Promise<PaginatedResponse<CategoryTeam>> {
    return apiClient.get<PaginatedResponse<CategoryTeam>>('/category-teams/requiring-payment', {
      companyId: companyId,
      page: page.toString(),
      size: size.toString()
    });
  }

  static async getTeamWorkload(companyId: string, page = 0, size = 20): Promise<any> {
    return apiClient.get('/category-teams/workload', {
      companyId: companyId,
      page: page.toString(),
      size: size.toString()
    });
  }
}