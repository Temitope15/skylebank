package com.skylebank.api.services;

import com.skylebank.api.models.AuditLog;
import com.skylebank.api.repositories.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service capturing security events into the audit logs table.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Inserts an audit log entry.
     * Propagation.REQUIRES_NEW guarantees that the log is committed independently,
     * preventing rollbacks from deleting the security audit trail.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String email, String ipAddress, String details) {
        log.info("Auditing action: {} for user: {}", action, email);

        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .email(email)
                .ipAddress(ipAddress)
                .details(details)
                .build();

        auditLogRepository.save(auditLog);
    }
}
