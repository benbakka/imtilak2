import { Category, CategoryTeam } from '../types';
import { apiClient } from './api';

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  orderSequence?: number;
}

export interface CategoryUpdateRequest extends CategoryCreateRequest {
  progressPercentage?: number;
}

export class CategoryService {
  static async getCategories(unitId: string): Promise<Category[]> {
    console.log(`CategoryService.getCategories - Fetching categories for unit ID: ${unitId}`);
    try {
      const response = await apiClient.get<Category[]>('/categories', { unitId: unitId });
      console.log('CategoryService.getCategories - Response:', response);
      return response;
    } catch (error) {
      console.error(`CategoryService.getCategories - Error fetching categories for unit ${unitId}:`, error);
      throw error;
    }
  }

  static async getCategory(id: string, unitId: string): Promise<Category> {
    return apiClient.get<Category>(`/categories/${id}`, { unitId: unitId });
  }

  static async createCategory(
    unitId: string,
    projectId: string,
    categoryData: CategoryCreateRequest
  ): Promise<Category> {
    console.log(`CategoryService.createCategory - Creating category for unit ID: ${unitId}, project ID: ${projectId}`);
    console.log('CategoryService.createCategory - Category data:', categoryData);
    
    try {
      const response = await apiClient.post<Category>(`/categories?unitId=${unitId}&projectId=${projectId}`, categoryData);
      console.log('CategoryService.createCategory - Response:', response);
      return response;
    } catch (error) {
      console.error(`CategoryService.createCategory - Error creating category for unit ${unitId}:`, error);
      throw error;
    }
  }

  static async updateCategory(
    id: string,
    unitId: string,
    categoryData: CategoryUpdateRequest
  ): Promise<Category> {
    return apiClient.put<Category>(`/categories/${id}?unitId=${unitId}`, categoryData);
  }

  static async deleteCategory(id: string, unitId: string): Promise<void> {
    return apiClient.delete<void>(`/categories/${id}?unitId=${unitId}`);
  }

  static async getCategoriesWithDelayedTasks(companyId: string, page = 0, size = 20): Promise<any> {
    return apiClient.get('/categories/delayed', {
      companyId: companyId,
      page: page.toString(),
      size: size.toString()
    });
  }

  static async getCategoriesStartingSoon(companyId: string, daysAhead = 7, page = 0, size = 20): Promise<any> {
    return apiClient.get('/categories/starting-soon', {
      companyId,
      daysAhead: daysAhead.toString(),
      page: page.toString(),
      size: size.toString()
    });
  }

  static async getOverdueCategories(companyId: string, page = 0, size = 20): Promise<any> {
    return apiClient.get('/categories/overdue', {
      companyId,
      page: page.toString(),
      size: size.toString()
    });
  }

  static async countCategories(unitId: string): Promise<number> {
    return apiClient.get<number>('/categories/count', { unitId });
  }
}