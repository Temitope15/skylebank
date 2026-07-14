package com.skylebank.api.interceptors;

import com.skylebank.api.services.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.security.Principal;

/**
 * Spring MVC Interceptor auditing funds transfer submission requests.
 */
@Component
public class AuditInterceptor implements HandlerInterceptor {

    private final AuditLogService auditLogService;

    public AuditInterceptor(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("POST".equalsIgnoreCase(request.getMethod()) && request.getRequestURI().endsWith("/api/v1/transfers")) {
            Principal principal = request.getUserPrincipal();
            String email = (principal != null) ? principal.getName() : "Anonymous";
            String ipAddress = request.getRemoteAddr();
            String userAgent = request.getHeader("User-Agent");
            auditLogService.log("TRANSFER_SUBMITTED", email, ipAddress, "Initiated funds transfer. User-Agent: " + userAgent);
        }
        return true;
    }
}
