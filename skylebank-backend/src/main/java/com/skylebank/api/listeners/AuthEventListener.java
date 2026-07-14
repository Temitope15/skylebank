package com.skylebank.api.listeners;

import com.skylebank.api.services.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AbstractAuthenticationFailureEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

/**
 * Listens to Spring Security Authentication events to audit successes and failures.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuthEventListener {

    private final AuditLogService auditLogService;

    @EventListener
    public void onSuccess(AuthenticationSuccessEvent event) {
        String email = event.getAuthentication().getName();
        log.info("Authentication success event captured for user: {}", email);
        auditLogService.log("LOGIN_SUCCESS", email, null, "User authenticated successfully");
    }

    @EventListener
    public void onFailure(AbstractAuthenticationFailureEvent event) {
        String email = event.getAuthentication().getName();
        String failureReason = event.getException() != null ? event.getException().getMessage() : "Unknown credentials issue";
        log.warn("Authentication failure event captured for user: {}. Reason: {}", email, failureReason);
        auditLogService.log("LOGIN_FAILURE", email, null, "Authentication failed: " + failureReason);
    }
}
