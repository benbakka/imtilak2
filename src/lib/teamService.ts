import { Team } from '../types';
import { apiClient, PaginatedResponse } from './api';

export interface TeamCreateRequest {
  name: string;
  specialty: string;
  color?: string;
  description?: string;
}

export interface TeamUpdateRequest extends TeamCreateRequest {
  isActive?: boolean;
}

export interface TeamFilters {
  specialty?: string;
  search?: string;
}

export class TeamService {
  static async getTeams(
    companyId: string,
    page = 0,
    size = 20,
    sortBy = 'name',
    sortDir = 'asc',
    filters: TeamFilters = {}
  ): Promise<PaginatedResponse<Team>> {
    // The backend expects companyId as a Long, so ensure it's a number
    const params = {
      companyId: Number(companyId),  // Convert string to number for backend Long type
      page: page.toString(),
      size: size.toString(),
      sortBy: sortBy,
      sortDir: sortDir,
      ...filters
    };

    console.log('TeamService.getTeams - Request params:', params);
    try {
      // Use the correct endpoint as defined in the backend TeamController
      const response = await apiClient.get<PaginatedResponse<Team>>('/teams', params);
      console.log('TeamService.getTeams - Response:', response);
      return response;
    } catch (error) {
      console.error('TeamService.getTeams - Error:', error);
      throw error;
    }
  }

  static async getAllActiveTeams(companyId: string): Promise<Team[]> {
    console.log('TeamService.getAllActiveTeams - Request for company ID:', companyId);
    try {
      const response = await apiClient.get<any>('/teams/all', { companyId: Number(companyId) });
      console.log('TeamService.getAllActiveTeams - Raw response:', response);
      console.log('TeamService.getAllActiveTeams - Response type:', typeof response);
      
      // Handle different response formats
      let teamsData: Team[] = [];
      
      // Case 1: Response is an array of teams
      if (Array.isArray(response)) {
        console.log('TeamService.getAllActiveTeams - Response is an array with', response.length, 'items');
        teamsData = response;
      }
      // Case 2: Response is an object with a content property that is an array
      else if (response && typeof response === 'object' && Array.isArray(response.content)) {
        console.log('TeamService.getAllActiveTeams - Response has content array with', response.content.length, 'items');
        teamsData = response.content;
      }
      // Case 3: Response is a single team object
      else if (response && typeof response === 'object' && response.id) {
        console.log('TeamService.getAllActiveTeams - Response is a single team object');
        teamsData = [response];
      }
      // Case 4: Response is an object with teams as properties
      else if (response && typeof response === 'object') {
        console.log('TeamService.getAllActiveTeams - Response is an object with keys:', Object.keys(response));
        // Try to extract teams from the object
        const possibleTeams = Object.values(response).filter(value => 
          value && typeof value === 'object' && 'id' in value
        );
        if (possibleTeams.length > 0) {
          console.log('TeamService.getAllActiveTeams - Extracted', possibleTeams.length, 'teams from object');
          teamsData = possibleTeams as Team[];
        }
      }
      
      console.log('TeamService.getAllActiveTeams - Returning', teamsData.length, 'teams');
      return teamsData;
    } catch (error) {
      console.error('TeamService.getAllActiveTeams - Error:', error);
      // Return empty array instead of throwing to prevent app crashes
      console.log('TeamService.getAllActiveTeams - Returning empty array due to error');
      return [];
    }
  }

  static async getTeam(id: string, companyId: string): Promise<Team> {
    return apiClient.get<Team>(`/teams/${id}`, { companyId: Number(companyId) });
  }

  static async createTeam(companyId: string, teamData: TeamCreateRequest): Promise<Team> {
    return apiClient.post<Team>(`/teams?companyId=${Number(companyId)}`, teamData);
  }

  static async updateTeam(
    id: string,
    companyId: string,
    teamData: TeamUpdateRequest
  ): Promise<Team> {
    return apiClient.put<Team>(`/teams/${id}?companyId=${Number(companyId)}`, teamData);
  }

  static async deleteTeam(id: string, companyId: string): Promise<void> {
    return apiClient.delete<void>(`/teams/${id}?companyId=${Number(companyId)}`);
  }

  static async getActiveTeamsCount(companyId: string): Promise<number> {
    return apiClient.get<number>('/teams/count/active', { companyId: Number(companyId) });
  }

  static async getTeamsByProject(projectId: string): Promise<Team[]> {
    return apiClient.get<Team[]>(`/teams/project/${projectId}`);
  }

  static async getTeamPerformanceMetrics(companyId: string, page = 0, size = 20): Promise<any> {
    return apiClient.get('/teams/performance', {
      companyId: Number(companyId),
      page: page.toString(),
      size: size.toString()
    });
  }
}