package com.constructmanager.dto;

import java.time.LocalDateTime;

/**
 * Detailed DTO for team information
 */
public class TeamDetailDTO {
    private Long id;
    private String name;
    private String specialty;
    private String color;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private CompanyBasicDTO company;
    private Long totalAssignments;
    private Long completedAssignments;
    private Double avgProgress;
    
    // Constructors
    public TeamDetailDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public CompanyBasicDTO getCompany() { return company; }
    public void setCompany(CompanyBasicDTO company) { this.company = company; }
    
    public Long getTotalAssignments() { return totalAssignments; }
    public void setTotalAssignments(Long totalAssignments) { this.totalAssignments = totalAssignments; }
    
    public Long getCompletedAssignments() { return completedAssignments; }
    public void setCompletedAssignments(Long completedAssignments) { this.completedAssignments = completedAssignments; }
    
    public Double getAvgProgress() { return avgProgress; }
    public void setAvgProgress(Double avgProgress) { this.avgProgress = avgProgress; }
}