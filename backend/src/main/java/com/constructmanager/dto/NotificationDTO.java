package com.constructmanager.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class NotificationDTO {
    private Long id;
    private String message;
    private boolean read;
    private String type;
    private LocalDateTime createdAt;
    private String link;
    
    // Explicit constructor to match the parameters in convertToDTO
    public NotificationDTO(Long id, String message, boolean read, String type, LocalDateTime createdAt, String link) {
        this.id = id;
        this.message = message;
        this.read = read;
        this.type = type;
        this.createdAt = createdAt;
        this.link = link;
    }
}
