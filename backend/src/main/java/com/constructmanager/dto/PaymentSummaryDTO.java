package com.constructmanager.dto;

import java.math.BigDecimal;

/**
 * Summary DTO for payment dashboard
 */
public class PaymentSummaryDTO {
    private BigDecimal totalBudget;
    private BigDecimal totalPaid;
    private BigDecimal totalPending;
    private BigDecimal totalOverdue;
    private BigDecimal paymentsThisMonth;
    private Long pendingApprovals;
    
    // Constructors
    public PaymentSummaryDTO() {
        this.totalBudget = BigDecimal.ZERO;
        this.totalPaid = BigDecimal.ZERO;
        this.totalPending = BigDecimal.ZERO;
        this.totalOverdue = BigDecimal.ZERO;
        this.paymentsThisMonth = BigDecimal.ZERO;
        this.pendingApprovals = 0L;
    }
    
    public PaymentSummaryDTO(BigDecimal totalBudget, BigDecimal totalPaid, BigDecimal totalPending, 
                           BigDecimal totalOverdue, BigDecimal paymentsThisMonth, Long pendingApprovals) {
        this.totalBudget = totalBudget != null ? totalBudget : BigDecimal.ZERO;
        this.totalPaid = totalPaid != null ? totalPaid : BigDecimal.ZERO;
        this.totalPending = totalPending != null ? totalPending : BigDecimal.ZERO;
        this.totalOverdue = totalOverdue != null ? totalOverdue : BigDecimal.ZERO;
        this.paymentsThisMonth = paymentsThisMonth != null ? paymentsThisMonth : BigDecimal.ZERO;
        this.pendingApprovals = pendingApprovals != null ? pendingApprovals : 0L;
    }
    
    // Getters and Setters
    public BigDecimal getTotalBudget() { return totalBudget; }
    public void setTotalBudget(BigDecimal totalBudget) { this.totalBudget = totalBudget; }
    
    public BigDecimal getTotalPaid() { return totalPaid; }
    public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }
    
    public BigDecimal getTotalPending() { return totalPending; }
    public void setTotalPending(BigDecimal totalPending) { this.totalPending = totalPending; }
    
    public BigDecimal getTotalOverdue() { return totalOverdue; }
    public void setTotalOverdue(BigDecimal totalOverdue) { this.totalOverdue = totalOverdue; }
    
    public BigDecimal getPaymentsThisMonth() { return paymentsThisMonth; }
    public void setPaymentsThisMonth(BigDecimal paymentsThisMonth) { this.paymentsThisMonth = paymentsThisMonth; }
    
    public Long getPendingApprovals() { return pendingApprovals; }
    public void setPendingApprovals(Long pendingApprovals) { this.pendingApprovals = pendingApprovals; }
}