package com.constructmanager.dto;

import com.constructmanager.entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Detailed DTO for payment information
 */
public class PaymentDetailDTO {
    private Long id;
    private BigDecimal amount;
    private String description;
    private Payment.PaymentStatus status;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private String invoiceNumber;
    private String paymentMethod;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Project, unit, category, and team information
    private ProjectBasicDTO project;
    private UnitBasicDTO unit;
    private CategoryBasicDTO category;
    private TeamBasicDTO team;
    private Long categoryTeamId;
    
    // Constructors
    public PaymentDetailDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Payment.PaymentStatus getStatus() { return status; }
    public void setStatus(Payment.PaymentStatus status) { this.status = status; }
    
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    
    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }
    
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public ProjectBasicDTO getProject() { return project; }
    public void setProject(ProjectBasicDTO project) { this.project = project; }
    
    public UnitBasicDTO getUnit() { return unit; }
    public void setUnit(UnitBasicDTO unit) { this.unit = unit; }
    
    public CategoryBasicDTO getCategory() { return category; }
    public void setCategory(CategoryBasicDTO category) { this.category = category; }
    
    public TeamBasicDTO getTeam() { return team; }
    public void setTeam(TeamBasicDTO team) { this.team = team; }
    
    public Long getCategoryTeamId() { return categoryTeamId; }
    public void setCategoryTeamId(Long categoryTeamId) { this.categoryTeamId = categoryTeamId; }
}