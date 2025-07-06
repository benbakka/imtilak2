package com.constructmanager.dto;

import com.constructmanager.entity.CategoryTeam;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * DTO for updating category team assignments
 */
public class CategoryTeamUpdateDTO {
    private CategoryTeam.TaskStatus status;
    private Boolean receptionStatus;
    private Boolean paymentStatus;
    private String notes;
    
    @Min(value = 0, message = "Progress percentage must be at least 0")
    @Max(value = 100, message = "Progress percentage must be at most 100")
    private Integer progressPercentage;
    
    // Constructors
    public CategoryTeamUpdateDTO() {}
    
    // Getters and Setters
    public CategoryTeam.TaskStatus getStatus() { return status; }
    public void setStatus(CategoryTeam.TaskStatus status) { this.status = status; }
    
    public Boolean getReceptionStatus() { return receptionStatus; }
    public void setReceptionStatus(Boolean receptionStatus) { this.receptionStatus = receptionStatus; }
    
    public Boolean getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(Boolean paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
}