package com.constructmanager.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * DTO for company registration request
 */
@NoArgsConstructor
@AllArgsConstructor
public class RegisterCompanyRequestDTO {
    
    @NotNull(message = "Company information is required")
    @Valid
    private CompanyCreateDTO company;
    
    @NotNull(message = "User information is required")
    @Valid
    private UserCreateDTO user;
    
    // Getters and Setters
    public CompanyCreateDTO getCompany() {
        return company;
    }
    
    public void setCompany(CompanyCreateDTO company) {
        this.company = company;
    }
    
    public UserCreateDTO getUser() {
        return user;
    }
    
    public void setUser(UserCreateDTO user) {
        this.user = user;
    }
}
