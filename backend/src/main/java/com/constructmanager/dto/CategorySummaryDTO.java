package com.constructmanager.dto;

import java.time.LocalDate;

/**
 * Summary DTO for category information in unit details
 */
public class CategorySummaryDTO {
    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer orderSequence;
    private Integer progressPercentage;
    private Long teamCount;
    
    // Constructors
    public CategorySummaryDTO() {}
    
    public CategorySummaryDTO(Long id, String name, LocalDate startDate, LocalDate endDate, 
                             Integer orderSequence, Integer progressPercentage, Long teamCount) {
        this.id = id;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.orderSequence = orderSequence;
        this.progressPercentage = progressPercentage;
        this.teamCount = teamCount;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public Integer getOrderSequence() { return orderSequence; }
    public void setOrderSequence(Integer orderSequence) { this.orderSequence = orderSequence; }
    
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
    
    public Long getTeamCount() { return teamCount; }
    public void setTeamCount(Long teamCount) { this.teamCount = teamCount; }
}