import { apiClient } from './api';

export interface AnalyticsSummary {
  projectCompletionRate: number;
  budgetEfficiency: number;
  onTimeDelivery: number;
  activeProjects: number;
  teamUtilization: number;
  avgProjectDuration: number;
}

export interface ProjectProgress {
  month: string;
  planned: number;
  actual: number;
  budget: number;
  spent: number;
}

export interface TeamPerformance {
  id: string;
  name: string;
  specialty: string;
  efficiency: number;
  tasksCompleted: number;
  avgDuration: number;
  projects: number;
}

export interface CategoryAnalysis {
  name: string;
  avgDuration: number;
  completionRate: number;
  delayRate: number;
}

export interface BudgetAnalysis {
  totalBudget: number;
  totalSpent: number;
  projectedSpend: number;
  savings: number;
  overruns: number;
}

export interface RiskFactor {
  factor: string;
  impact: 'High' | 'Medium' | 'Low';
  probability: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface AnalyticsData {
  overview: AnalyticsSummary;
  projectProgress: ProjectProgress[];
  teamPerformance: TeamPerformance[];
  categoryAnalysis: CategoryAnalysis[];
  budgetAnalysis: BudgetAnalysis;
  riskFactors: RiskFactor[];
}

export class AnalyticsService {
  static async getAnalyticsSummary(companyId: string): Promise<AnalyticsSummary> {
    return apiClient.get<AnalyticsSummary>('/analytics/summary', { companyId: companyId });
  }

  static async getProjectProgress(companyId: string, period: string): Promise<ProjectProgress[]> {
    return apiClient.get<ProjectProgress[]>('/analytics/project-progress', { 
      companyId: companyId,
      period: period
    });
  }

  static async getTeamPerformance(companyId: string): Promise<TeamPerformance[]> {
    return apiClient.get<TeamPerformance[]>('/analytics/team-performance', { companyId: companyId });
  }

  static async getCategoryAnalysis(companyId: string): Promise<CategoryAnalysis[]> {
    return apiClient.get<CategoryAnalysis[]>('/analytics/category-analysis', { companyId: companyId });
  }

  static async getBudgetAnalysis(companyId: string): Promise<BudgetAnalysis> {
    return apiClient.get<BudgetAnalysis>('/analytics/budget-analysis', { companyId: companyId });
  }

  static async getRiskFactors(companyId: string): Promise<RiskFactor[]> {
    return apiClient.get<RiskFactor[]>('/analytics/risk-factors', { companyId: companyId });
  }

  static async getCompleteAnalyticsData(companyId: string, period: string): Promise<AnalyticsData> {
    return apiClient.get<AnalyticsData>('/analytics/complete', { 
      companyId: companyId,
      period: period
    });
  }
}