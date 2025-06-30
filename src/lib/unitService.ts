import { Unit } from '../types';
import { apiClient, PaginatedResponse } from './api';

export interface UnitCreateRequest {
  name: string;
  type: Unit['type'];
  floor?: string;
  area?: number;
  description?: string;
}

export interface UnitUpdateRequest extends UnitCreateRequest {
  progressPercentage?: number;
}

export interface UnitFilters {
  type?: Unit['type'];
  search?: string;
}

export class UnitService {
  static async getUnits(
    projectId: string,
    page = 0,
    size = 20,
    sortBy = 'createdAt',
    sortDir = 'asc',
    filters: UnitFilters = {}
  ): Promise<PaginatedResponse<Unit>> {
    const params = {
      projectId: projectId,
      page: page.toString(),
      size: size.toString(),
      sortBy: sortBy,
      sortDir: sortDir,
      ...filters
    };

    return apiClient.get<PaginatedResponse<Unit>>('/units', params);
  }

  static async getUnit(id: string, projectId: string): Promise<Unit> {
    return apiClient.get<Unit>(`/units/${id}`, { projectId: projectId });
  }

  static async createUnit(
    projectId: string,
    companyId: string,
    unitData: UnitCreateRequest
  ): Promise<Unit> {
    return apiClient.post<Unit>(`/units?projectId=${projectId}&companyId=${companyId}`, unitData);
  }

  static async updateUnit(
    id: string,
    projectId: string,
    unitData: UnitUpdateRequest
  ): Promise<Unit> {
    return apiClient.put<Unit>(`/units/${id}?projectId=${projectId}`, unitData);
  }

  static async deleteUnit(id: string, projectId: string): Promise<void> {
    return apiClient.delete<void>(`/units/${id}?projectId=${projectId}`);
  }

  static async countUnits(projectId: string): Promise<number> {
    return apiClient.get<number>('/units/count', { projectId: projectId });
  }

  static async countUnitsByType(projectId: string, type: Unit['type']): Promise<number> {
    return apiClient.get<number>('/units/count/type', { projectId: projectId, type: type });
  }
}