package com.constructmanager.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "category_teams", indexes = {
    @Index(name = "idx_category_team_category", columnList = "category_id"),
    @Index(name = "idx_category_team_team", columnList = "team_id"),
    @Index(name = "idx_category_team_status", columnList = "status")
})
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@com.fasterxml.jackson.annotation.JsonIdentityInfo(
    generator = com.fasterxml.jackson.annotation.ObjectIdGenerators.PropertyGenerator.class,
    property = "id"
)
public class CategoryTeam {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.NOT_STARTED;
    
    @Column(name = "reception_status", nullable = false)
    private Boolean receptionStatus = false;
    
    @Column(name = "payment_status", nullable = false)
    private Boolean paymentStatus = false;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Many-to-One with lazy loading
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIdentityReference(alwaysAsId = true)
    private Category category;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    // One-to-Many with lazy loading
    @OneToMany(mappedBy = "categoryTeam", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Task> tasks = new ArrayList<>();
    
    // Constructors
    public CategoryTeam() {}
    
    public CategoryTeam(Category category, Team team) {
        this.category = category;
        this.team = team;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
    
    public Boolean getReceptionStatus() { return receptionStatus; }
    public void setReceptionStatus(Boolean receptionStatus) { this.receptionStatus = receptionStatus; }
    
    public Boolean getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(Boolean paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    
    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }
    
    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
    
    public enum TaskStatus {
        NOT_STARTED, IN_PROGRESS, DONE, DELAYED
    }
}