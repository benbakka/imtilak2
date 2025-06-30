package com.constructmanager.dto;

import java.math.BigDecimal;

/**
 * DTO for project financial data
 */
public class ProjectFinancialDTO {
    private String id;
    private String name;
    private BigDecimal budget;
    private BigDecimal spent;
    
    // Constructors
    public ProjectFinancialDTO() {}
    
    public ProjectFinancialDTO(String id, String name, BigDecimal budget, BigDecimal spent) {
        this.id = id;
        this.name = name;
        this.budget = budget;
        this.spent = spent;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    
    public BigDecimal getSpent() { return spent; }
    public void setSpent(BigDecimal spent) { this.spent = spent; }
}