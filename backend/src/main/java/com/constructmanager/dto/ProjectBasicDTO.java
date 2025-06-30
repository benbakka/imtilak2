package com.constructmanager.dto;

/**
 * Basic project information for nested DTOs
 */
public class ProjectBasicDTO {
    private Long id;
    private String name;
    private String location;
    
    // Constructors
    public ProjectBasicDTO() {}
    
    public ProjectBasicDTO(Long id, String name, String location) {
        this.id = id;
        this.name = name;
        this.location = location;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}