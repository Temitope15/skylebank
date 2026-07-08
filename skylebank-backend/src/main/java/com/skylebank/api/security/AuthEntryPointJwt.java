/**
 * File: AuthEntryPointJwt.java
 *
 * Purpose:
 * Intercepts unauthenticated requests and writes custom JSON error payloads.
 *
 * Responsibilities:
 * * Intercept authentication exceptions
 * * Write standardized RFC 7807 problem details to HTTP response stream
 *
 * Why this file exists:
 * The frontend requires clean, structured JSON envelopes for API request issues.
 *
 * Usage Flow:
 * Request fails security context check -> commence() -> JSON response written
 *
 * Important Notes:
 * * Returns HTTP status 401 (Unauthorized)
 *
 * Design Decisions:
 * * Standardized RFC 7807 problem details output pattern
 */
package com.skylebank.api.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Entry point to handle unauthenticated security exceptions.
 */
@Component
@Slf4j
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        log.error("Unauthorized error: {}", authException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        final Map<String, Object> body = new HashMap<>();
        body.put("type", "about:blank");
        body.put("title", "Unauthorized");
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("detail", authException.getMessage());
        body.put("instance", request.getRequestURI());

        final ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getOutputStream(), body);
    }
}
