// src/lib/unitService.ts
import { Unit } from '../types';
import { apiClient, PaginatedResponse } from './api';

// Define the backend's expected enum values as a union type
export type BackendUnitType = 'VILLA' | 'APARTMENT' | 'COMMERCIAL';

export interface UnitCreateRequest {
  name: string;
  type: BackendUnitType; // Use BackendUnitType here
  floor?: string | null;
  area?: number | null;
  description?: string | null;
}

export interface UnitUpdateRequest {
  name?: string;
  type?: BackendUnitType; // Use BackendUnitType here
  floor?: string | null;
  area?: number | null;
  description?: string | null;
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

    try {
      console.log(`Fetching units for project ID: ${projectId}, page: ${page}, size: ${size}`);
      const response = await apiClient.get<PaginatedResponse<Unit>>('/units', params);
      console.log('Units fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching units for project ID ${projectId}:`, error);
      throw error;
    }
  }

  static async getUnit(id: string, projectId: string): Promise<Unit> {
    try {
      console.log(`Fetching unit with ID: ${id} for project: ${projectId}`);
      const response = await apiClient.get<Unit>(`/units/${id}`, { projectId: projectId });
      console.log('Unit fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching unit with ID ${id} for project ${projectId}:`, error);
      throw error;
    }
  }

  static async createUnit(
    projectId: string,
    companyId: string,
    unitData: UnitCreateRequest
  ): Promise<Unit> {
    try {
      console.log('Creating unit with data:', { projectId, companyId, unitData });
      
      // Ensure all parameters are properly formatted
      const formattedProjectId = String(projectId).trim();
      const formattedCompanyId = String(companyId).trim();
      
      if (!formattedProjectId) {
        throw new Error('Project ID is required and cannot be empty');
      }
      
      if (!formattedCompanyId) {
        throw new Error('Company ID is required and cannot be empty');
      }
      
      // Ensure the unit data is properly formatted
      const formattedUnitData = {
        name: unitData.name.trim(),
        // Convert type to uppercase and assert to BackendUnitType
        type: unitData.type.toUpperCase() as BackendUnitType,
        floor: unitData.floor === null || unitData.floor === undefined ? null : String(unitData.floor).trim(),
        area: unitData.area === null || unitData.area === undefined ? null : Number(unitData.area),
        description: unitData.description === null || unitData.description === undefined ? null : String(unitData.description).trim()
      };
      
      // Log the formatted data
      console.log('Formatted unit creation data:', {
        projectId: formattedProjectId,
        companyId: formattedCompanyId,
        unitData: formattedUnitData
      });
      
      const response = await apiClient.post<Unit>(
        `/units?projectId=${encodeURIComponent(formattedProjectId)}&companyId=${encodeURIComponent(formattedCompanyId)}`, 
        formattedUnitData
      );
      
      console.log('Unit created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating unit:', error);
      throw error;
    }
  }

  static async updateUnit(
    id: string,
    projectId: string,
    unitData: UnitUpdateRequest
  ): Promise<Unit> {
    try {
      console.log(`Updating unit with ID: ${id} for project: ${projectId}`, unitData);
      
      // Create a copy of unitData to avoid modifying the original
      const formattedUnitData = { ...unitData };
      
      // Convert type to uppercase if present and assert to BackendUnitType
      if (formattedUnitData.type) {
        formattedUnitData.type = formattedUnitData.type.toUpperCase() as BackendUnitType;
      }
      
      const response = await apiClient.put<Unit>(`/units/${id}?projectId=${projectId}`, formattedUnitData);
      console.log('Unit updated successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error updating unit with ID ${id}:`, error);
      throw error;
    }
  }

  static async deleteUnit(id: string, projectId: string): Promise<void> {
    try {
      console.log(`Deleting unit with ID: ${id} for project: ${projectId}`);
      await apiClient.delete<void>(`/units/${id}?projectId=${projectId}`);
      console.log('Unit deleted successfully');
    } catch (error) {
      console.error(`Error deleting unit with ID ${id}:`, error);
      throw error;
    }
  }

  static async countUnits(projectId: string): Promise<number> {
    return apiClient.get<number>('/units/count', { projectId: projectId });
  }

  static async countUnitsByType(projectId: string, type: Unit['type']): Promise<number> {
    // Convert type to uppercase and assert to BackendUnitType
    const upperCaseType = type.toUpperCase() as BackendUnitType;
    return apiClient.get<number>('/units/count/type', { projectId: projectId, type: upperCaseType });
  }
}
