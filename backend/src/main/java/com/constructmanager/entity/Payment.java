package com.constructmanager.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments", indexes = {
    @Index(name = "idx_payment_category_team", columnList = "category_team_id"),
    @Index(name = "idx_payment_status", columnList = "status"),
    @Index(name = "idx_payment_due_date", columnList = "due_date"),
    @Index(name = "idx_payment_invoice", columnList = "invoice_number")
})
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;
    
    @Size(max = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;
    
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    @Column(name = "paid_date")
    private LocalDate paidDate;
    
    @Size(max = 100)
    @Column(name = "invoice_number")
    private String invoiceNumber;
    
    @Size(max = 50)
    @Column(name = "payment_method")
    private String paymentMethod;
    
    @Size(max = 1000)
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Many-to-One with lazy loading
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_team_id", nullable = false)
    private CategoryTeam categoryTeam;
    
    // Constructors
    public Payment() {}
    
    public Payment(BigDecimal amount, String description, CategoryTeam categoryTeam) {
        this.amount = amount;
        this.description = description;
        this.categoryTeam = categoryTeam;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }
    
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
    
    public CategoryTeam getCategoryTeam() { return categoryTeam; }
    public void setCategoryTeam(CategoryTeam categoryTeam) { this.categoryTeam = categoryTeam; }
    
    public enum PaymentStatus {
        DRAFT, PENDING, APPROVED, PAID, OVERDUE
    }
}