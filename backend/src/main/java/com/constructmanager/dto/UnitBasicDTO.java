package com.constructmanager.dto;

import com.constructmanager.entity.Unit;

/**
 * Basic unit information for nested DTOs
 */
public class UnitBasicDTO {
    private Long id;
    private String name;
    private Unit.UnitType type;
    
    // Constructors
    public UnitBasicDTO() {}
    
    public UnitBasicDTO(Long id, String name, Unit.UnitType type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Unit.UnitType getType() { return type; }
    public void setType(Unit.UnitType type) { this.type = type; }
}