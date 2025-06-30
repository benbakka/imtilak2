import { apiClient } from './api';
import { Project } from '../types';
import { TeamPerformance } from './analyticsService';

export interface ReportProject extends Project {
  active_teams?: number;
  delayed_categories?: number;
  units: number;
  completedUnits: number;
  teams: number;
  categories: number;
  completedCategories: number;
  delayedTasks: number;
  spent: number;
}

export interface MonthlyProgress {
  month: string;
  completed: number;
  planned: number;
}

export interface ReportData {
  projects: ReportProject[];
  teams: TeamPerformance[];
  monthlyProgress: MonthlyProgress[];
}

export class ReportService {
  static async getReportData(companyId: string, period: string, projectId?: string): Promise<ReportData> {
    const params: Record<string, string> = {
      companyId: companyId,
      period: period
    };
    
    if (projectId && projectId !== 'all') {
      params.projectId = projectId;
    }
    
    return apiClient.get<ReportData>('/reports/data', params);
  }

  static async getProjectDetails(projectId: string, companyId: string): Promise<ReportProject> {
    return apiClient.get<ReportProject>(`/reports/projects/${projectId}`, { companyId: companyId });
  }

  static async getTeamPerformanceReport(companyId: string): Promise<TeamPerformance[]> {
    return apiClient.get<TeamPerformance[]>('/reports/team-performance', { companyId: companyId });
  }

  static async getFinancialSummary(companyId: string, period: string): Promise<any> {
    return apiClient.get('/reports/financial-summary', { 
      companyId,
      period
    });
  }
}