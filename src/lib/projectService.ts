import { Project } from '../types';
import { apiClient, PaginatedResponse } from './api';

export interface ProjectCreateRequest {
  name: string;
  description?: string;
  location: string;
  startDate: string;
  endDate: string;
  budget?: number;
  company?: {
    id: string;
  };
  status?: string;
}

export interface ProjectUpdateRequest extends ProjectCreateRequest {
  status?: Project['status'];
  progressPercentage?: number;
}

export interface ProjectFilters {
  status?: Project['status'];
  search?: string;
  startDate?: string;
  endDate?: string;
}

export class ProjectService {
  static async getProjects(
    companyId: string,
    page = 0,
    size = 20,
    sortBy = 'createdAt',
    sortDir = 'desc',
    filters: ProjectFilters = {}
  ): Promise<PaginatedResponse<Project>> {
    const params = {
      companyId: companyId,
      page: page.toString(),
      size: size.toString(),
      sortBy: sortBy,
      sortDir: sortDir,
      ...filters
    };

    try {
      console.log(`Fetching projects for company ID: ${companyId}, page: ${page}, size: ${size}`);
      const response = await apiClient.get<PaginatedResponse<Project>>('/projects', params);
      console.log('Projects fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching projects for company ID ${companyId}:`, error);
      
      // Enhance error message with more context
      if (error instanceof Error) {
        throw new Error(`Failed to load projects: ${error.message}`);
      }
      throw error;
    }
  }

  static async getProject(id: string, companyId: string): Promise<Project> {
    try {
      console.log(`Fetching project with ID: ${id} for company: ${companyId}`);
      const response = await apiClient.get<Project>(`/projects/${id}`, { companyId: companyId });
      console.log('Project fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching project with ID ${id} for company ${companyId}:`, error);
      
      // Enhance error message with more context
      if (error instanceof Error) {
        throw new Error(`Failed to load project details: ${error.message}`);
      }
      throw error;
    }
  }

  static async createProject(
    companyId: string,
    projectData: ProjectCreateRequest
  ): Promise<Project> {
    console.log('createProject called with:', { companyId, projectData });
    
    try {
      // Include company object in the request as expected by the backend
      const projectWithCompany = {
        ...projectData,
        company: {
          id: companyId
        },
        // Convert status to uppercase to match backend enum values
        status: projectData.status ? projectData.status.toUpperCase() : 'PLANNING',
        progressPercentage: 0, // Initialize progress percentage
        units: [] // Initialize units array to avoid null
      };
      
      console.log('Sending project data:', JSON.stringify(projectWithCompany));
      const result = await apiClient.post<Project>(`/projects?companyId=${companyId}`, projectWithCompany);
      console.log('Project created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  }

  static async updateProject(
    id: string,
    companyId: string,
    projectData: ProjectUpdateRequest
  ): Promise<Project> {
    // Include company object in the request as expected by the backend
    const projectWithCompany = {
      ...projectData,
      company: {
        id: companyId
      },
      // Convert status to uppercase to match backend enum values
      status: projectData.status ? projectData.status.toUpperCase() : undefined,
      units: [] // Initialize units array to avoid null
    };
    
    console.log('Sending update project data:', JSON.stringify(projectWithCompany));
    return apiClient.put<Project>(`/projects/${id}?companyId=${companyId}`, projectWithCompany);
  }

  static async deleteProject(id: string, companyId: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}?companyId=${companyId}`);
  }

  static async getActiveProjectsCount(companyId: string): Promise<number> {
    return apiClient.get<number>(`/projects/count/active`, { companyId });
  }

  static async getProjectsWithDelayedTasks(
    companyId: string,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<Project>> {
    return apiClient.get<PaginatedResponse<Project>>('/projects/delayed', {
      companyId,
      page: page.toString(),
      size: size.toString()
    });
  }
}