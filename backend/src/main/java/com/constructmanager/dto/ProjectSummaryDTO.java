package com.constructmanager.dto;

import com.constructmanager.entity.Project;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Lightweight DTO for project list views - only essential fields
 */
public class ProjectSummaryDTO {
    private Long id;
    private String name;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private Project.ProjectStatus status;
    private Integer progressPercentage;
    private BigDecimal budget;
    private Long unitCount;
    private Long activeTeamCount;
    
    // Constructors
    public ProjectSummaryDTO() {}
    
    public ProjectSummaryDTO(Long id, String name, String location, LocalDate startDate, 
                           LocalDate endDate, Project.ProjectStatus status, Integer progressPercentage, 
                           BigDecimal budget, Long unitCount, Long activeTeamCount) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.progressPercentage = progressPercentage;
        this.budget = budget;
        this.unitCount = unitCount;
        this.activeTeamCount = activeTeamCount;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public Project.ProjectStatus getStatus() { return status; }
    public void setStatus(Project.ProjectStatus status) { this.status = status; }
    
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
    
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    
    public Long getUnitCount() { return unitCount; }
    public void setUnitCount(Long unitCount) { this.unitCount = unitCount; }
    
    public Long getActiveTeamCount() { return activeTeamCount; }
    public void setActiveTeamCount(Long activeTeamCount) { this.activeTeamCount = activeTeamCount; }
}