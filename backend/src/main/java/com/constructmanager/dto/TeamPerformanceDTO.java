package com.constructmanager.dto;

/**
 * DTO for team performance data
 */
public class TeamPerformanceDTO {
    private String id;
    private String name;
    private String specialty;
    private int efficiency;
    private int tasksCompleted;
    private int avgDuration;
    private int projects;
    
    // Constructors
    public TeamPerformanceDTO() {}
    
    public TeamPerformanceDTO(String id, String name, String specialty, int efficiency, 
                            int tasksCompleted, int avgDuration, int projects) {
        this.id = id;
        this.name = name;
        this.specialty = specialty;
        this.efficiency = efficiency;
        this.tasksCompleted = tasksCompleted;
        this.avgDuration = avgDuration;
        this.projects = projects;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    
    public int getEfficiency() { return efficiency; }
    public void setEfficiency(int efficiency) { this.efficiency = efficiency; }
    
    public int getTasksCompleted() { return tasksCompleted; }
    public void setTasksCompleted(int tasksCompleted) { this.tasksCompleted = tasksCompleted; }
    
    public int getAvgDuration() { return avgDuration; }
    public void setAvgDuration(int avgDuration) { this.avgDuration = avgDuration; }
    
    public int getProjects() { return projects; }
    public void setProjects(int projects) { this.projects = projects; }
}