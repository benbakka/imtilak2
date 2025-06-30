package com.constructmanager.dto;

/**
 * DTO for authentication responses
 */
public class AuthResponseDTO {
    private String token;
    private UserProfileDTO user;
    
    // Constructors
    public AuthResponseDTO() {}
    
    public AuthResponseDTO(String token, UserProfileDTO user) {
        this.token = token;
        this.user = user;
    }
    
    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public UserProfileDTO getUser() { return user; }
    public void setUser(UserProfileDTO user) { this.user = user; }
}