package com.constructmanager.dto;

import com.constructmanager.entity.Unit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * DTO for updating existing units
 */
public class UnitUpdateDTO {
    @NotBlank(message = "Unit name is required")
    @Size(max = 255, message = "Unit name must not exceed 255 characters")
    private String name;
    
    @NotNull(message = "Unit type is required")
    private Unit.UnitType type;
    
    @Size(max = 100, message = "Floor must not exceed 100 characters")
    private String floor;
    
    private BigDecimal area;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    private Integer progressPercentage;
    
    // Constructors
    public UnitUpdateDTO() {}
    
    // Getters and Setters
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
}