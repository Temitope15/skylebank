/**
 * File: EmailService.java
 *
 * Purpose:
 * Service responsible for sending email notifications (such as password reset links) via SMTP.
 */
package com.skylebank.api.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service mapping SMTP email dispatches using Spring JavaMailSender.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * Dispatch password reset link to user email.
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@skylebank.com");
            message.setTo(toEmail);
            message.setSubject("SkyleBank Password Reset Request");
            message.setText("Hello,\n\n"
                    + "You requested to reset your password. Please click the link below to set a new password:\n\n"
                    + resetLink + "\n\n"
                    + "This link will expire in 15 minutes.\n\n"
                    + "If you did not request this password reset, you can safely ignore this email.\n\n"
                    + "Best regards,\n"
                    + "The SkyleBank Team");

            mailSender.send(message);
            log.info("Password reset email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            throw new IllegalStateException("Unable to dispatch password reset email. Please verify MailHog is active.");
        }
    }
}
