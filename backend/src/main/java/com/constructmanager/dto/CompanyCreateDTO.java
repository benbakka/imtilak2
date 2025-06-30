package com.constructmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new company
 */
@NoArgsConstructor
@AllArgsConstructor
public class CompanyCreateDTO {
    
    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 255, message = "Company name must be between 2 and 255 characters")
    private String name;
    
    @Size(max = 255, message = "Address must be less than 255 characters")
    private String address;
    
    @Size(max = 20, message = "Phone number must be less than 20 characters")
    private String phone;
    
    @Size(max = 255, message = "Website must be less than 255 characters")
    private String website;
    
    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getWebsite() {
        return website;
    }
    
    public void setWebsite(String website) {
        this.website = website;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}
