package com.skylebank.api.controllers;

import com.skylebank.api.dto.MessageResponse;
import com.skylebank.api.dto.NotificationResponse;
import com.skylebank.api.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * REST controller exposing endpoints to fetch and interact with user notifications.
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Retrieve all notifications for the logged-in user.
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(Principal principal) {
        String email = principal.getName();
        log.info("REST request to fetch notifications for user: {}", email);
        return ResponseEntity.ok(notificationService.getUserNotifications(email));
    }

    /**
     * Retrieve the count of unread notifications for the logged-in user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Principal principal) {
        String email = principal.getName();
        log.info("REST request to fetch unread notifications count for user: {}", email);
        long count = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Mark a specific notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<MessageResponse> markAsRead(Principal principal, @PathVariable Long id) {
        String email = principal.getName();
        log.info("REST request to mark notification {} as read for user: {}", id, email);
        notificationService.markAsRead(id, email);
        return ResponseEntity.ok(new MessageResponse("Notification marked as read"));
    }

    /**
     * Mark all notifications for the user as read.
     */
    @PatchMapping("/read-all")
    public ResponseEntity<MessageResponse> markAllAsRead(Principal principal) {
        String email = principal.getName();
        log.info("REST request to mark all notifications as read for user: {}", email);
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok(new MessageResponse("All notifications marked as read"));
    }
}
