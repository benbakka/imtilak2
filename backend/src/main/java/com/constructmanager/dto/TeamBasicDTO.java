package com.constructmanager.dto;

/**
 * Basic team information for nested DTOs
 */
public class TeamBasicDTO {
    private Long id;
    private String name;
    private String specialty;
    private String color;
    
    // Constructors
    public TeamBasicDTO() {}
    
    public TeamBasicDTO(Long id, String name, String specialty, String color) {
        this.id = id;
        this.name = name;
        this.specialty = specialty;
        this.color = color;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}