package com.constructmanager.dto;

/**
 * DTO for dashboard statistics
 */
public class DashboardStatsDTO {
    private Long totalProjects;
    private Long activeProjects;
    private Long totalUnits;
    private Long totalTeams;
    private Long activeTeams;
    private Long totalTasks;
    private Long completedTasks;
    private Long inProgressTasks;
    private Long delayedTasks;
    private Long tasksRequiringPayment;
    private Double avgProjectProgress;
    
    // Constructors
    public DashboardStatsDTO() {}
    
    public DashboardStatsDTO(Long totalProjects, Long activeProjects, Long totalUnits, Long totalTeams,
                           Long activeTeams, Long totalTasks, Long completedTasks, Long inProgressTasks,
                           Long delayedTasks, Long tasksRequiringPayment, Double avgProjectProgress) {
        this.totalProjects = totalProjects;
        this.activeProjects = activeProjects;
        this.totalUnits = totalUnits;
        this.totalTeams = totalTeams;
        this.activeTeams = activeTeams;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.inProgressTasks = inProgressTasks;
        this.delayedTasks = delayedTasks;
        this.tasksRequiringPayment = tasksRequiringPayment;
        this.avgProjectProgress = avgProjectProgress;
    }
    
    // Getters and Setters
    public Long getTotalProjects() { return totalProjects; }
    public void setTotalProjects(Long totalProjects) { this.totalProjects = totalProjects; }
    
    public Long getActiveProjects() { return activeProjects; }
    public void setActiveProjects(Long activeProjects) { this.activeProjects = activeProjects; }
    
    public Long getTotalUnits() { return totalUnits; }
    public void setTotalUnits(Long totalUnits) { this.totalUnits = totalUnits; }
    
    public Long getTotalTeams() { return totalTeams; }
    public void setTotalTeams(Long totalTeams) { this.totalTeams = totalTeams; }
    
    public Long getActiveTeams() { return activeTeams; }
    public void setActiveTeams(Long activeTeams) { this.activeTeams = activeTeams; }
    
    public Long getTotalTasks() { return totalTasks; }
    public void setTotalTasks(Long totalTasks) { this.totalTasks = totalTasks; }
    
    public Long getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Long completedTasks) { this.completedTasks = completedTasks; }
    
    public Long getInProgressTasks() { return inProgressTasks; }
    public void setInProgressTasks(Long inProgressTasks) { this.inProgressTasks = inProgressTasks; }
    
    public Long getDelayedTasks() { return delayedTasks; }
    public void setDelayedTasks(Long delayedTasks) { this.delayedTasks = delayedTasks; }
    
    public Long getTasksRequiringPayment() { return tasksRequiringPayment; }
    public void setTasksRequiringPayment(Long tasksRequiringPayment) { this.tasksRequiringPayment = tasksRequiringPayment; }
    
    public Double getAvgProjectProgress() { return avgProjectProgress; }
    public void setAvgProjectProgress(Double avgProjectProgress) { this.avgProjectProgress = avgProjectProgress; }
}