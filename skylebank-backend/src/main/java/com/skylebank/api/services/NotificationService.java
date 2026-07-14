package com.skylebank.api.services;

import com.skylebank.api.dto.NotificationResponse;
import com.skylebank.api.models.Notification;
import com.skylebank.api.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class handling notification retrieval and read status transitions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Retrieves all notifications for the specified user email, sorted by newest first.
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String email) {
        log.info("Fetching notifications for user: {}", email);
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Retrieves the count of unread notifications for the specified user email.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        log.info("Fetching unread notification count for user: {}", email);
        return notificationRepository.countByUserEmailAndIsReadFalse(email);
    }

    /**
     * Marks a single notification as read, validating ownership.
     */
    @Transactional
    public void markAsRead(Long id, String email) {
        log.info("Marking notification ID {} as read for user: {}", id, email);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + id));

        if (!notification.getUser().getEmail().equals(email)) {
            throw new SecurityException("Access Denied: Notification does not belong to the requesting user");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    /**
     * Marks all unread notifications for a user as read.
     */
    @Transactional
    public void markAllAsRead(String email) {
        log.info("Marking all notifications as read for user: {}", email);
        List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
        
        List<Notification> unread = notifications.stream()
                .filter(n -> !n.isRead())
                .toList();

        if (!unread.isEmpty()) {
            unread.forEach(n -> n.setRead(true));
            notificationRepository.saveAll(unread);
            log.info("Successfully marked {} notifications as read for user: {}", unread.size(), email);
        }
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
