package com.constructmanager.dto;

import com.constructmanager.entity.Unit;

import java.math.BigDecimal;

/**
 * Lightweight DTO for unit list views
 */
public class UnitSummaryDTO {
    private Long id;
    private String name;
    private Unit.UnitType type;
    private String floor;
    private BigDecimal area;
    private Integer progressPercentage;
    private Long categoryCount;
    private Long activeTeamCount;
    
    // Constructors
    public UnitSummaryDTO() {}
    
    public UnitSummaryDTO(Long id, String name, Unit.UnitType type, String floor, 
                         BigDecimal area, Integer progressPercentage, Long categoryCount, Long activeTeamCount) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.floor = floor;
        this.area = area;
        this.progressPercentage = progressPercentage;
        this.categoryCount = categoryCount;
        this.activeTeamCount = activeTeamCount;
    }
    
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
    
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
    
    public Long getCategoryCount() { return categoryCount; }
    public void setCategoryCount(Long categoryCount) { this.categoryCount = categoryCount; }
    
    public Long getActiveTeamCount() { return activeTeamCount; }
    public void setActiveTeamCount(Long activeTeamCount) { this.activeTeamCount = activeTeamCount; }
}