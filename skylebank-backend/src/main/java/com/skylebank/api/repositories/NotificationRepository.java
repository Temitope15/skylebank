package com.skylebank.api.repositories;

import com.skylebank.api.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for managing Notification entities in the database.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Finds all notifications for a specific user email, sorted by newest first.
     */
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String email);

    /**
     * Counts the number of unread notifications for a specific user email.
     */
    long countByUserEmailAndIsReadFalse(String email);
}
