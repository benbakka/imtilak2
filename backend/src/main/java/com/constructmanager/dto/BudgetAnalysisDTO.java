package com.constructmanager.dto;

/**
 * DTO for budget analysis data
 */
public class BudgetAnalysisDTO {
    private double totalBudget;
    private double totalSpent;
    private double projectedSpend;
    private double savings;
    private double overruns;
    
    // Constructors
    public BudgetAnalysisDTO() {}
    
    public BudgetAnalysisDTO(double totalBudget, double totalSpent, double projectedSpend, 
                           double savings, double overruns) {
        this.totalBudget = totalBudget;
        this.totalSpent = totalSpent;
        this.projectedSpend = projectedSpend;
        this.savings = savings;
        this.overruns = overruns;
    }
    
    // Getters and Setters
    public double getTotalBudget() { return totalBudget; }
    public void setTotalBudget(double totalBudget) { this.totalBudget = totalBudget; }
    
    public double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(double totalSpent) { this.totalSpent = totalSpent; }
    
    public double getProjectedSpend() { return projectedSpend; }
    public void setProjectedSpend(double projectedSpend) { this.projectedSpend = projectedSpend; }
    
    public double getSavings() { return savings; }
    public void setSavings(double savings) { this.savings = savings; }
    
    public double getOverruns() { return overruns; }
    public void setOverruns(double overruns) { this.overruns = overruns; }
}