package com.constructmanager.dto;

/**
 * DTO for category analysis data
 */
public class CategoryAnalysisDTO {
    private String name;
    private int avgDuration;
    private int completionRate;
    private int delayRate;
    
    // Constructors
    public CategoryAnalysisDTO() {}
    
    public CategoryAnalysisDTO(String name, int avgDuration, int completionRate, int delayRate) {
        this.name = name;
        this.avgDuration = avgDuration;
        this.completionRate = completionRate;
        this.delayRate = delayRate;
    }
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public int getAvgDuration() { return avgDuration; }
    public void setAvgDuration(int avgDuration) { this.avgDuration = avgDuration; }
    
    public int getCompletionRate() { return completionRate; }
    public void setCompletionRate(int completionRate) { this.completionRate = completionRate; }
    
    public int getDelayRate() { return delayRate; }
    public void setDelayRate(int delayRate) { this.delayRate = delayRate; }
}