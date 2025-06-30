package com.constructmanager.dto;

import java.math.BigDecimal;

/**
 * DTO for project report data
 */
public class ProjectReportDTO {
    private String id;
    private String name;
    private String location;
    private int progress;
    private String status;
    private String startDate;
    private String endDate;
    private BigDecimal budget;
    private double spent;
    private int units;
    private int completedUnits;
    private int teams;
    private int categories;
    private int completedCategories;
    private int delayedTasks;
    
    // Constructors
    public ProjectReportDTO() {}
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    
    public double getSpent() { return spent; }
    public void setSpent(double spent) { this.spent = spent; }
    
    public int getUnits() { return units; }
    public void setUnits(int units) { this.units = units; }
    
    public int getCompletedUnits() { return completedUnits; }
    public void setCompletedUnits(int completedUnits) { this.completedUnits = completedUnits; }
    
    public int getTeams() { return teams; }
    public void setTeams(int teams) { this.teams = teams; }
    
    public int getCategories() { return categories; }
    public void setCategories(int categories) { this.categories = categories; }
    
    public int getCompletedCategories() { return completedCategories; }
    public void setCompletedCategories(int completedCategories) { this.completedCategories = completedCategories; }
    
    public int getDelayedTasks() { return delayedTasks; }
    public void setDelayedTasks(int delayedTasks) { this.delayedTasks = delayedTasks; }
}