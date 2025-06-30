package com.constructmanager.domain;

import com.constructmanager.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(length = 50)
    private String type; // e.g., 'TASK_ASSIGNED', 'PROJECT_UPDATE'

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private String link; // e.g., '/projects/1/tasks/5'

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Explicit getter methods
    public Long getId() {
        return id;
    }
    
    public String getMessage() {
        return message;
    }
    
    public boolean isRead() {
        return read;
    }
    
    public String getType() {
        return type;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public String getLink() {
        return link;
    }
}
