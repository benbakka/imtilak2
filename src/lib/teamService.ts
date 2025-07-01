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
      companyId: Number(companyId),
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
      
      // Process the response to handle potential issues with team data
      if (response && response.content && Array.isArray(response.content)) {
        // Check if any team entries are just numbers (IDs) instead of full objects
        const teamIdsToFetch: number[] = [];
        const teamIdPositions: Record<number, number> = {};
        
        // Identify which entries are just IDs and need to be fetched
        response.content.forEach((team, index) => {
          if (typeof team === 'number') {
            teamIdsToFetch.push(team);
            teamIdPositions[team] = index;
          } else if (team && typeof team === 'object' && !team.name) {
            console.warn('TeamService.getTeams - Found team object without name:', team);
          }
        });
        
        // If we found any team IDs, fetch the complete team objects
        if (teamIdsToFetch.length > 0) {
          console.log('TeamService.getTeams - Fetching complete team objects for IDs:', teamIdsToFetch);
          
          // Fetch each team by ID
          const teamPromises = teamIdsToFetch.map(async (teamId) => {
            try {
              const teamData = await this.getTeam(String(teamId), companyId);
              return { teamId, teamData };
            } catch (error) {
              console.error(`TeamService.getTeams - Error fetching team ${teamId}:`, error);
              return { teamId, teamData: null };
            }
          });
          
          // Wait for all team fetches to complete
          const fetchedTeams = await Promise.all(teamPromises);
          
          // Replace the team IDs with the fetched team objects
          fetchedTeams.forEach(({ teamId, teamData }) => {
            if (teamData && teamIdPositions[teamId] !== undefined) {
              response.content[teamIdPositions[teamId]] = teamData;
            }
          });
        }
      }
      
      return response;
    } catch (error) {
      console.error('TeamService.getTeams - Error:', error);
      throw error;
    }
  }

  static async getAllActiveTeams(companyId: string): Promise<Team[]> {
    console.log('TeamService.getAllActiveTeams - Request for company ID:', companyId);
    try {
      // Define a more specific type for the response to handle the paginated format
      type TeamResponse = Team[] | PaginatedResponse<Team> | Team | Record<string, any>;
      
      const response = await apiClient.get<TeamResponse>('/teams/all', { companyId: Number(companyId) });
      
      // Ensure the response is consistently handled
      let teamsData: Team[] = [];

      if (response && typeof response === 'object' && 'content' in response && Array.isArray((response as PaginatedResponse<Team>).content)) {
        // Prioritize the 'content' property for paginated responses
        teamsData = (response as PaginatedResponse<Team>).content;
      } else if (Array.isArray(response)) {
        // Handle cases where the response is a direct array of teams
        teamsData = response;
      } else {
        // If the response is not in a known format, log a warning and return an empty array
        console.warn('TeamService.getAllActiveTeams - Unexpected response format:', response);
        return [];
      }

      return teamsData;
    } catch (error) {
      console.error('TeamService.getAllActiveTeams - Error:', error);
      // Return empty array instead of throwing to prevent app crashes
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