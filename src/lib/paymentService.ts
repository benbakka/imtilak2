import { apiClient, PaginatedResponse } from './api';

export interface Payment {
  id: string;
  projectId: string;
  projectName: string;
  unitId: string;
  unitName: string;
  categoryId: string;
  categoryName: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  description: string;
  amount: number;
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'overdue';
  dueDate: string;
  paidDate: string | null;
  invoiceNumber: string;
  paymentMethod: string | null;
  notes: string;
  categoryTeamId: string;
}

export interface PaymentCreateRequest {
  projectId: string;
  unitId: string;
  categoryId: string;
  teamId: string;
  description: string;
  amount: number;
  status: Payment['status'];
  dueDate: string;
  notes?: string;
  categoryTeamId: string;
}

export interface PaymentUpdateRequest {
  description?: string;
  amount?: number;
  status?: Payment['status'];
  dueDate?: string;
  paidDate?: string | null;
  paymentMethod?: string | null;
  notes?: string;
}

export interface PaymentSummary {
  totalBudget: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  paymentsThisMonth: number;
  pendingApprovals: number;
}

export class PaymentService {
  static async getPayments(
    companyId: string,
    page = 0,
    size = 20,
    status?: Payment['status'],
    projectId?: string
  ): Promise<PaginatedResponse<Payment>> {
    const params: Record<string, string> = {
      companyId,
      page: page.toString(),
      size: size.toString()
    };

    if (status) {
      params.status = status;
    }

    if (projectId) {
      params.projectId = projectId;
    }

    return apiClient.get<PaginatedResponse<Payment>>('/payments', params);
  }
  
  static async approvePayment(id: string, companyId: string): Promise<Payment> {
    return apiClient.post<Payment>(`/payments/${id}/approve?companyId=${companyId}`, {});
  }
  
  static async markAsPaid(id: string, companyId: string, paymentMethod: string): Promise<Payment> {
    return apiClient.post<Payment>(`/payments/${id}/mark-paid?companyId=${companyId}`, { paymentMethod });
  }

  static async getPayment(id: string, companyId: string): Promise<Payment> {
    return apiClient.get<Payment>(`/payments/${id}?companyId=${companyId}`);
  }

  static async createPayment(paymentData: PaymentCreateRequest): Promise<Payment> {
    return apiClient.post<Payment>('/payments', paymentData);
  }

  static async updatePayment(id: string, companyId: string, paymentData: PaymentUpdateRequest): Promise<Payment> {
    return apiClient.put<Payment>(`/payments/${id}?companyId=${companyId}`, paymentData);
  }

  static async deletePayment(id: string, companyId: string): Promise<void> {
    return apiClient.delete<void>(`/payments/${id}?companyId=${companyId}`);
  }

  static async getPaymentSummary(companyId: string): Promise<PaymentSummary> {
    return apiClient.get<PaymentSummary>(`/payments/summary?companyId=${companyId}`);
  }

  static async getPaymentsRequiringApproval(companyId: string, page = 0, size = 20): Promise<PaginatedResponse<Payment>> {
    return apiClient.get<PaginatedResponse<Payment>>(
      `/payments/requiring-approval?companyId=${companyId}&page=${page}&size=${size}`
    );
  }

  static async getOverduePayments(companyId: string, page = 0, size = 20): Promise<PaginatedResponse<Payment>> {
    return apiClient.get<PaginatedResponse<Payment>>(
      `/payments/overdue?companyId=${companyId}&page=${page}&size=${size}`
    );
  }
}