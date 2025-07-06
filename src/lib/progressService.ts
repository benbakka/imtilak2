import { apiClient } from "./api";

class ProgressService {
  /**
   * Update project progress based on its units
   * @param projectId The ID of the project to update
   * @param progressPercentage Optional manual progress percentage to set
   */
  static async updateProjectProgress(projectId: string, progressPercentage?: number): Promise<any> {
    if (typeof progressPercentage === 'number') {
      return apiClient.put(`/progress/project/${projectId}?progressPercentage=${progressPercentage}`);
    }
    return apiClient.put(`/progress/project/${projectId}`);
  }

  /**
   * Update unit progress based on its categories
   */
  static async updateUnitProgress(unitId: string): Promise<any> {
    return apiClient.put(`/progress/unit/${unitId}`);
  }

  /**
   * Update category progress based on its teams
   */
  static async updateCategoryProgress(categoryId: string): Promise<any> {
    return apiClient.put(`/progress/category/${categoryId}`);
  }

  /**
   * Update category team progress
   */
  static async updateCategoryTeamProgress(categoryTeamId: string, progressPercentage: number): Promise<any> {
    return apiClient.put(`/progress/category-team/${categoryTeamId}?progressPercentage=${progressPercentage}`);
  }
}

export default ProgressService;