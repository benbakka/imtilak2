import { apiClient } from './api';

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalUnits: number;
  totalTeams: number;
  activeTeams: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  delayedTasks: number;
  tasksRequiringPayment: number;
  avgProjectProgress: number;
}

export class DashboardService {
  static async getDashboardStats(companyId: string): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/dashboard/stats', { companyId: companyId });
  }
}