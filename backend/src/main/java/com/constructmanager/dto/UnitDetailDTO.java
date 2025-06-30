package com.constructmanager.dto;

import com.constructmanager.entity.Unit;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Detailed DTO for single unit view with categories
 */
public class UnitDetailDTO {
    private Long id;
    private String name;
    private Unit.UnitType type;
    private String floor;
    private BigDecimal area;
    private String description;
    private Integer progressPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private ProjectBasicDTO project;
    private List<CategorySummaryDTO> categories;
    
    // Constructors
    public UnitDetailDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Unit.UnitType getType() { return type; }
    public void setType(Unit.UnitType type) { this.type = type; }
    
    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }
    
    public BigDecimal getArea() { return area; }
    public void setArea(BigDecimal area) { this.area = area; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public ProjectBasicDTO getProject() { return project; }
    public void setProject(ProjectBasicDTO project) { this.project = project; }
    
    public List<CategorySummaryDTO> getCategories() { return categories; }
    public void setCategories(List<CategorySummaryDTO> categories) { this.categories = categories; }
}