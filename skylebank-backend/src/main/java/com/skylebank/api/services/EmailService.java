package com.skylebank.api.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

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

    /**
     * Dispatch welcome email to user upon registration.
     */
    public void sendWelcomeEmail(String toEmail, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@skylebank.com");
            message.setTo(toEmail);
            message.setSubject("Welcome to SkyleBank!");
            message.setText("Hello " + name + ",\n\n"
                    + "Welcome to SkyleBank! Your digital banking wallet has been successfully created and is ready for use.\n\n"
                    + "Log in to your dashboard to fund your account and begin making transfers.\n\n"
                    + "If you have any questions, feel free to reply to this email.\n\n"
                    + "Best regards,\n"
                    + "The SkyleBank Team");

            mailSender.send(message);
            log.info("Welcome email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Dispatch debit notification email on successful transfer out.
     */
    public void sendDebitEmail(String toEmail, String reference, BigDecimal amount, String recipient) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@skylebank.com");
            message.setTo(toEmail);
            message.setSubject("SkyleBank Transaction Alert [Debit: ₦" + amount + "]");
            message.setText("Hello,\n\n"
                    + "Your SkyleBank wallet has been debited.\n\n"
                    + "Transaction Details:\n"
                    + "-----------------------------\n"
                    + "Amount: ₦" + amount + "\n"
                    + "Recipient Wallet: " + recipient + "\n"
                    + "Reference: " + reference + "\n"
                    + "Status: SUCCESS\n"
                    + "-----------------------------\n\n"
                    + "Thank you for banking with SkyleBank.\n\n"
                    + "Best regards,\n"
                    + "The SkyleBank Team");

            mailSender.send(message);
            log.info("Debit alert email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send debit alert email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Dispatch credit notification email on incoming transfer.
     */
    public void sendCreditEmail(String toEmail, String reference, BigDecimal amount, String sender) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@skylebank.com");
            message.setTo(toEmail);
            message.setSubject("SkyleBank Transaction Alert [Credit: ₦" + amount + "]");
            message.setText("Hello,\n\n"
                    + "Your SkyleBank wallet has been credited.\n\n"
                    + "Transaction Details:\n"
                    + "-----------------------------\n"
                    + "Amount: ₦" + amount + "\n"
                    + "Sender Wallet: " + sender + "\n"
                    + "Reference: " + reference + "\n"
                    + "Status: SUCCESS\n"
                    + "-----------------------------\n\n"
                    + "Thank you for banking with SkyleBank.\n\n"
                    + "Best regards,\n"
                    + "The SkyleBank Team");

            mailSender.send(message);
            log.info("Credit alert email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send credit alert email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Dispatch security warning email on flagged activities.
     */
    public void sendSecurityAlertEmail(String toEmail, String alertReason) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@skylebank.com");
            message.setTo(toEmail);
            message.setSubject("SkyleBank Security Alert");
            message.setText("Hello,\n\n"
                    + "We detected activity on your account that was flagged by our risk assessment engine:\n\n"
                    + "Reason: " + alertReason + "\n\n"
                    + "If this transaction was initiated by you, please note that it is currently pending review by our compliance team. "
                    + "If you did not authorize this activity, please contact support immediately.\n\n"
                    + "Best regards,\n"
                    + "The SkyleBank Team");

            mailSender.send(message);
            log.info("Security alert email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send security alert email to {}: {}", toEmail, e.getMessage());
        }
    }
}
