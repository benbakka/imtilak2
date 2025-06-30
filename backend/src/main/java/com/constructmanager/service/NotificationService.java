package com.constructmanager.service;

import com.constructmanager.domain.Notification;
import com.constructmanager.dto.NotificationDTO;
import com.constructmanager.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Page<NotificationDTO> getNotificationsForUser(Long userId, int page, int size, Boolean unread) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Notification> notificationPage;
        if (unread != null) {
            notificationPage = notificationRepository.findByUserIdAndRead(userId, !unread, pageable);
        } else {
            notificationPage = notificationRepository.findByUserId(userId, pageable);
        }
        
        return notificationPage.map(this::convertToDTO);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getMessage(),
                notification.isRead(),
                notification.getType(),
                notification.getCreatedAt(),
                notification.getLink()
        );
    }
}
