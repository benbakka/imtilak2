package com.constructmanager.dto;

/**
 * Basic category information for nested DTOs
 */
public class CategoryBasicDTO {
    private Long id;
    private String name;
    
    // Constructors
    public CategoryBasicDTO() {}
    
    public CategoryBasicDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}