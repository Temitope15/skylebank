package com.skylebank.api.listeners;

import com.skylebank.api.events.NotificationEvent;
import com.skylebank.api.models.Notification;
import com.skylebank.api.repositories.NotificationRepository;
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
    private final EmailService emailService;

    /**
     * Handles incoming NotificationEvent asynchronously to keep the main request execution path non-blocking.
     */
    @Async
    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        log.info("Processing notification event for user: {}, title: {}", event.getUser().getEmail(), event.getTitle());

        // 1. Persist the in-app notification in database
        Notification notification = Notification.builder()
                .user(event.getUser())
                .title(event.getTitle())
                .message(event.getMessage())
                .isRead(false)
                .build();
        try {
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to persist notification in database (recipient may have been rolled back/deleted): {}", e.getMessage());
        }

        // 2. Process email dispatch if enabled
        if (event.isSendEmail()) {
            String toEmail = event.getUser().getEmail();
            String templateType = event.getEmailTemplateType();
            Map<String, Object> metadata = event.getEmailMetadata();

            try {
                switch (templateType) {
                    case "WELCOME":
                        String fullName = event.getUser().getFirstName() + " " + event.getUser().getLastName();
                        emailService.sendWelcomeEmail(toEmail, fullName);
                        break;
                    case "DEBIT":
                        if (metadata != null) {
                            BigDecimal amount = (BigDecimal) metadata.get("amount");
                            String reference = (String) metadata.get("reference");
                            String recipient = (String) metadata.get("recipient");
                            emailService.sendDebitEmail(toEmail, reference, amount, recipient);
                        }
                        break;
                    case "CREDIT":
                        if (metadata != null) {
                            BigDecimal amount = (BigDecimal) metadata.get("amount");
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
