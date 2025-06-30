package com.constructmanager.dto;

import com.constructmanager.entity.User;

import java.time.LocalDateTime;

/**
 * DTO for user profile information
 */
public class UserProfileDTO {
    private Long id;
    private String email;
    private String name;
    private User.UserRole role;
    private String phone;
    private String position;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private CompanyBasicDTO company;
    
    // Constructors
    public UserProfileDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public User.UserRole getRole() { return role; }
    public void setRole(User.UserRole role) { this.role = role; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public CompanyBasicDTO getCompany() { return company; }
    public void setCompany(CompanyBasicDTO company) { this.company = company; }
}