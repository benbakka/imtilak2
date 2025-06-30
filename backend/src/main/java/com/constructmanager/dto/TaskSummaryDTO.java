package com.constructmanager.dto;

import com.constructmanager.entity.Task;

import java.time.LocalDate;

/**
 * Lightweight DTO for task list views
 */
public class TaskSummaryDTO {
    private Long id;
    private String name;
    private String description;
    private Task.TaskStatus status;
    private LocalDate dueDate;
    private LocalDate completedDate;
    private Integer progressPercentage;
    
    // Constructors
    public TaskSummaryDTO() {}
    
    public TaskSummaryDTO(Long id, String name, String description, Task.TaskStatus status, 
                         LocalDate dueDate, LocalDate completedDate, Integer progressPercentage) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
        this.completedDate = completedDate;
        this.progressPercentage = progressPercentage;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Task.TaskStatus getStatus() { return status; }
    public void setStatus(Task.TaskStatus status) { this.status = status; }
    
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    
    public LocalDate getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }
    
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
}