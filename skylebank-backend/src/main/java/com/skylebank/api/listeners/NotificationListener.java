package com.skylebank.api.listeners;

import com.skylebank.api.events.NotificationEvent;
import com.skylebank.api.models.Notification;
import com.skylebank.api.models.User;
import com.skylebank.api.repositories.NotificationRepository;
import com.skylebank.api.repositories.UserRepository;
import com.skylebank.api.services.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Listener that catches NotificationEvents and processes them asynchronously.
 * Persists the notification record to database and dispatches SMTP emails where requested.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    /**
     * Handles incoming NotificationEvent asynchronously to keep the main request execution path non-blocking.
     */
    @Async
    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        log.info("Processing notification event for user email: {}, title: {}", event.getUserEmail(), event.getTitle());

        // 1. Resolve User from repository
        User user;
        try {
            user = userRepository.findByEmail(event.getUserEmail())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + event.getUserEmail()));
        } catch (Exception e) {
            log.error("Aborting notification processing. Recipient user could not be loaded: {}", e.getMessage());
            return;
        }

        // 2. Persist the in-app notification in database
        Notification notification = Notification.builder()
                .user(user)
                .title(event.getTitle())
                .message(event.getMessage())
                .isRead(false)
                .build();
        try {
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to persist notification in database: {}", e.getMessage());
        }

        // 3. Process email dispatch if enabled
        if (event.isSendEmail()) {
            String toEmail = event.getUserEmail();
            String templateType = event.getEmailTemplateType();
            Map<String, Object> metadata = event.getEmailMetadata();

            try {
                switch (templateType) {
                    case "WELCOME":
                        String fullName = user.getFirstName() + " " + user.getLastName();
                        emailService.sendWelcomeEmail(toEmail, fullName);
                        break;
                    case "DEBIT":
                        if (metadata != null) {
                            BigDecimal amount = null;
                            Object amountObj = metadata.get("amount");
                            if (amountObj instanceof BigDecimal) {
                                amount = (BigDecimal) amountObj;
                            } else if (amountObj instanceof Double) {
                                amount = BigDecimal.valueOf((Double) amountObj);
                            } else if (amountObj instanceof Number) {
                                amount = new BigDecimal(amountObj.toString());
                            }
                            String reference = (String) metadata.get("reference");
                            String recipient = (String) metadata.get("recipient");
                            emailService.sendDebitEmail(toEmail, reference, amount, recipient);
                        }
                        break;
                    case "CREDIT":
                        if (metadata != null) {
                            BigDecimal amount = null;
                            Object amountObj = metadata.get("amount");
                            if (amountObj instanceof BigDecimal) {
                                amount = (BigDecimal) amountObj;
                            } else if (amountObj instanceof Double) {
                                amount = BigDecimal.valueOf((Double) amountObj);
                            } else if (amountObj instanceof Number) {
                                amount = new BigDecimal(amountObj.toString());
                            }
                            String reference = (String) metadata.get("reference");
                            String sender = (String) metadata.get("sender");
                            emailService.sendCreditEmail(toEmail, reference, amount, sender);
                        }
                        break;
                    case "SECURITY_ALERT":
                        emailService.sendSecurityAlertEmail(toEmail, event.getMessage());
                        break;
                    default:
                        log.warn("Unknown email template type: {}", templateType);
                        break;
                }
            } catch (Exception e) {
                log.error("Failed to dispatch email notification: {}", e.getMessage());
            }
        }
    }
}
