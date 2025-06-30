import { apiClient } from './api';

export interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  created_at: string;
  updated_at?: string;
}

export interface CompanyUpdateRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export class CompanyService {
  static async getCompany(companyId: string): Promise<Company> {
    return apiClient.get<Company>(`/companies/${companyId}`);
  }

  static async updateCompany(companyId: string, companyData: CompanyUpdateRequest): Promise<Company> {
    return apiClient.put<Company>(`/companies/${companyId}`, companyData);
  }
}