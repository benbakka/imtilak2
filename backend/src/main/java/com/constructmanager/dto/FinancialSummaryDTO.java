package com.constructmanager.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for financial summary report
 */
public class FinancialSummaryDTO {
    private BigDecimal totalBudget;
    private BigDecimal totalSpent;
    private BigDecimal totalRemaining;
    private List<ProjectFinancialDTO> projects;
    
    // Constructors
    public FinancialSummaryDTO() {}
    
    public FinancialSummaryDTO(BigDecimal totalBudget, BigDecimal totalSpent, BigDecimal totalRemaining,
                             List<ProjectFinancialDTO> projects) {
        this.totalBudget = totalBudget;
        this.totalSpent = totalSpent;
        this.totalRemaining = totalRemaining;
        this.projects = projects;
    }
    
    // Getters and Setters
    public BigDecimal getTotalBudget() { return totalBudget; }
    public void setTotalBudget(BigDecimal totalBudget) { this.totalBudget = totalBudget; }
    
    public BigDecimal getTotalSpent() { return totalSpent; }
    public void setTotalSpent(BigDecimal totalSpent) { this.totalSpent = totalSpent; }
    
    public BigDecimal getTotalRemaining() { return totalRemaining; }
    public void setTotalRemaining(BigDecimal totalRemaining) { this.totalRemaining = totalRemaining; }
    
    public List<ProjectFinancialDTO> getProjects() { return projects; }
    public void setProjects(List<ProjectFinancialDTO> projects) { this.projects = projects; }
}