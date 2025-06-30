package com.constructmanager.dto;

import com.constructmanager.entity.CategoryTeam;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating category team assignments
 */
public class CategoryTeamCreateDTO {
    @NotNull(message = "Team ID is required")
    private Long teamId;
    
    private CategoryTeam.TaskStatus status = CategoryTeam.TaskStatus.NOT_STARTED;
    
    private Boolean receptionStatus = false;
    private Boolean paymentStatus = false;
    
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
    
    // Constructors
    public CategoryTeamCreateDTO() {}
    
    // Getters and Setters
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    
    public CategoryTeam.TaskStatus getStatus() { return status; }
    public void setStatus(CategoryTeam.TaskStatus status) { this.status = status; }
    
    public Boolean getReceptionStatus() { return receptionStatus; }
    public void setReceptionStatus(Boolean receptionStatus) { this.receptionStatus = receptionStatus; }
    
    public Boolean getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(Boolean paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}