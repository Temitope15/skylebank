package com.skylebank.api.events;

import com.skylebank.api.models.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.Map;

/**
 * Event triggered to publish in-app notifications and send email alerts.
 */
@Getter
public class NotificationEvent extends ApplicationEvent {
    private final User user;
    private final String title;
    private final String message;
    private final boolean sendEmail;
    private final String emailTemplateType; // e.g., "WELCOME", "DEBIT", "CREDIT", "SECURITY_ALERT"
    private final Map<String, Object> emailMetadata; // To format specific email templates

    public NotificationEvent(Object source, User user, String title, String message, boolean sendEmail, String emailTemplateType, Map<String, Object> emailMetadata) {
        super(source);
        this.user = user;
        this.title = title;
        this.message = message;
        this.sendEmail = sendEmail;
        this.emailTemplateType = emailTemplateType;
        this.emailMetadata = emailMetadata;
    }
}
