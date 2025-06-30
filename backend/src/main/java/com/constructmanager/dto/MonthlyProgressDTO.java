package com.constructmanager.dto;

/**
 * DTO for monthly progress data
 */
public class MonthlyProgressDTO {
    private String month;
    private int completed;
    private int planned;
    
    // Constructors
    public MonthlyProgressDTO() {}
    
    public MonthlyProgressDTO(String month, int completed, int planned) {
        this.month = month;
        this.completed = completed;
        this.planned = planned;
    }
    
    // Getters and Setters
    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    
    public int getCompleted() { return completed; }
    public void setCompleted(int completed) { this.completed = completed; }
    
    public int getPlanned() { return planned; }
    public void setPlanned(int planned) { this.planned = planned; }
}