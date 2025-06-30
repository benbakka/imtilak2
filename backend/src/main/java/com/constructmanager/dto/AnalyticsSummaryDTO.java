package com.constructmanager.dto;

/**
 * DTO for analytics summary
 */
public class AnalyticsSummaryDTO {
    private int projectCompletionRate;
    private int budgetEfficiency;
    private int onTimeDelivery;
    private int activeProjects;
    private int teamUtilization;
    private int avgProjectDuration;
    
    // Constructors
    public AnalyticsSummaryDTO() {}
    
    public AnalyticsSummaryDTO(int projectCompletionRate, int budgetEfficiency, int onTimeDelivery,
                             int activeProjects, int teamUtilization, int avgProjectDuration) {
        this.projectCompletionRate = projectCompletionRate;
        this.budgetEfficiency = budgetEfficiency;
        this.onTimeDelivery = onTimeDelivery;
        this.activeProjects = activeProjects;
        this.teamUtilization = teamUtilization;
        this.avgProjectDuration = avgProjectDuration;
    }
    
    // Getters and Setters
    public int getProjectCompletionRate() { return projectCompletionRate; }
    public void setProjectCompletionRate(int projectCompletionRate) { this.projectCompletionRate = projectCompletionRate; }
    
    public int getBudgetEfficiency() { return budgetEfficiency; }
    public void setBudgetEfficiency(int budgetEfficiency) { this.budgetEfficiency = budgetEfficiency; }
    
    public int getOnTimeDelivery() { return onTimeDelivery; }
    public void setOnTimeDelivery(int onTimeDelivery) { this.onTimeDelivery = onTimeDelivery; }
    
    public int getActiveProjects() { return activeProjects; }
    public void setActiveProjects(int activeProjects) { this.activeProjects = activeProjects; }
    
    public int getTeamUtilization() { return teamUtilization; }
    public void setTeamUtilization(int teamUtilization) { this.teamUtilization = teamUtilization; }
    
    public int getAvgProjectDuration() { return avgProjectDuration; }
    public void setAvgProjectDuration(int avgProjectDuration) { this.avgProjectDuration = avgProjectDuration; }
}