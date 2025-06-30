package com.constructmanager.dto;

/**
 * DTO for project progress data
 */
public class ProjectProgressDTO {
    private String month;
    private int planned;
    private int actual;
    private double budget;
    private double spent;
    
    // Constructors
    public ProjectProgressDTO() {}
    
    public ProjectProgressDTO(String month, int planned, int actual, double budget, double spent) {
        this.month = month;
        this.planned = planned;
        this.actual = actual;
        this.budget = budget;
        this.spent = spent;
    }
    
    // Getters and Setters
    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    
    public int getPlanned() { return planned; }
    public void setPlanned(int planned) { this.planned = planned; }
    
    public int getActual() { return actual; }
    public void setActual(int actual) { this.actual = actual; }
    
    public double getBudget() { return budget; }
    public void setBudget(double budget) { this.budget = budget; }
    
    public double getSpent() { return spent; }
    public void setSpent(double spent) { this.spent = spent; }
}