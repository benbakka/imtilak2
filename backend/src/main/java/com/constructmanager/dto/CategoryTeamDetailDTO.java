package com.constructmanager.dto;

import com.constructmanager.entity.CategoryTeam;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Detailed DTO for category team assignments with tasks
 */
public class CategoryTeamDetailDTO {
    private Long id;
    private CategoryTeam.TaskStatus status;
    private Boolean receptionStatus;
    private Boolean paymentStatus;
    private String notes;
    private Integer progressPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private TeamBasicDTO team;
    private List<TaskSummaryDTO> tasks;
    
    // Constructors
    public CategoryTeamDetailDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
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
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public TeamBasicDTO getTeam() { return team; }
    public void setTeam(TeamBasicDTO team) { this.team = team; }
    
    public List<TaskSummaryDTO> getTasks() { return tasks; }
    public void setTasks(List<TaskSummaryDTO> tasks) { this.tasks = tasks; }
}