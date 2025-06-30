import { Task } from '../types';
import { apiClient, PaginatedResponse } from './api';

export interface TaskCreateRequest {
  name: string;
  description?: string;
  status?: Task['status'];
  dueDate?: string;
  categoryTeamId: string;
}

export interface TaskUpdateRequest {
  name?: string;
  description?: string;
  status?: Task['status'];
  dueDate?: string;
  completedDate?: string | null;
  progressPercentage?: number;
}

export class TaskService {
  static async getTasks(
    categoryTeamId: string,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<Task>> {
    return apiClient.get<PaginatedResponse<Task>>('/tasks', {
      categoryTeamId: categoryTeamId,
      page: page.toString(),
      size: size.toString()
    });
  }

  static async getTask(id: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`);
  }

  static async createTask(taskData: TaskCreateRequest): Promise<Task> {
    return apiClient.post<Task>('/tasks', taskData);
  }

  static async updateTask(id: string, taskData: TaskUpdateRequest): Promise<Task> {
    return apiClient.put<Task>(`/tasks/${id}`, taskData);
  }

  static async deleteTask(id: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`);
  }

  static async getDelayedTasks(
    companyId: string,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<Task>> {
    return apiClient.get<PaginatedResponse<Task>>('/tasks/delayed', {
      companyId: companyId,
      page: page.toString(),
      size: size.toString()
    });
  }

  static async getTasksDueThisWeek(
    companyId: string,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<Task>> {
    return apiClient.get<PaginatedResponse<Task>>('/tasks/due-this-week', {
      companyId: companyId,
      page: page.toString(),
      size: size.toString()
    });
  }

  static async completeTask(id: string): Promise<Task> {
    return apiClient.post<Task>(`/tasks/${id}/complete`, {});
  }
}