import { UnitTemplate, TemplateCategory, TemplateCategoryTeam, Team } from '../types';
import { apiClient, PaginatedResponse } from './api';

export interface TemplateCategoryTeamRequest {
  team_id: string;
  tasks?: string[];
  notes?: string;
}

export interface TemplateCategoryRequest {
  name: string;
  order: number;
  duration_days: number;
  teams: TemplateCategoryTeamRequest[];
}

export interface TemplateCreateRequest {
  name: string;
  description: string;
  unit_type: UnitTemplate['unit_type'];
  categories: TemplateCategoryRequest[];
}

export interface TemplateUpdateRequest extends TemplateCreateRequest {
  id: string;
}

export class TemplateService {
  static async getTemplates(
    companyId: string,
    page = 0,
    size = 20,
    unitType?: UnitTemplate['unit_type']
  ): Promise<PaginatedResponse<UnitTemplate>> {
    const params: Record<string, string> = {
      companyId: companyId,
      page: page.toString(),
      size: size.toString()
    };

    if (unitType) {
      params.unitType = unitType;
    }

    return apiClient.get<PaginatedResponse<UnitTemplate>>('/templates', params);
  }

  static async getTemplate(id: string, companyId: string): Promise<UnitTemplate> {
    return apiClient.get<UnitTemplate>(`/templates/${id}`, { companyId: companyId });
  }

  static async createTemplate(
    companyId: string,
    templateData: TemplateCreateRequest
  ): Promise<UnitTemplate> {
    return apiClient.post<UnitTemplate>(`/templates?companyId=${companyId}`, templateData);
  }

  static async updateTemplate(
    id: string,
    companyId: string,
    templateData: TemplateUpdateRequest
  ): Promise<UnitTemplate> {
    return apiClient.put<UnitTemplate>(`/templates/${id}?companyId=${companyId}`, templateData);
  }

  static async deleteTemplate(id: string, companyId: string): Promise<void> {
    return apiClient.delete<void>(`/templates/${id}?companyId=${companyId}`);
  }

  static async applyTemplateToUnit(
    templateId: string,
    unitId: string,
    projectId: string
  ): Promise<void> {
    return apiClient.post<void>(`/templates/${templateId}/apply`, {
      unitId: unitId,
      projectId: projectId
    });
  }
}