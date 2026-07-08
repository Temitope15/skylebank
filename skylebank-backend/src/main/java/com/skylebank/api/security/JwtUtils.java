/**
 * File: JwtUtils.java
 *
 * Purpose:
 * Cryptographic utility class to generate, validate, and parse JWT access tokens and cookie envelopes.
 *
 * Responsibilities:
 * * Parse JWT from request headers
 * * Generate and read HTTP-only refresh cookies
 * * Generate JWT access tokens containing user details claims
 * * Validate JWT signatures and expirations
 *
 * Why this file exists:
 * To centralize low-level cryptography and cookies tasks for security context setup.
 *
 * Usage Flow:
 * Controller/Filter -> JwtUtils -> Cryptographic parsing
 *
 * Important Notes:
 * * Requires HMAC-SHA key of at least 32 characters configured in application context
 *
 * Design Decisions:
 * * Single Responsibility helper component for session tokens
 */
package com.skylebank.api.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Utility class for JWT token operations and cookie handling.
 */
@Component
@Slf4j
public class JwtUtils {

    @Value("${app.security.jwt.secret}")
    private String jwtSecret;

    @Value("${app.security.jwt.expiration-ms}")
    private int jwtExpirationMs;

    @Value("${app.security.jwt.cookie-name:skylebank-refresh-token}")
    private String jwtCookieName;

    @Value("${app.security.jwt.cookie-same-site:Lax}")
    private String cookieSameSite;

    private javax.crypto.SecretKey key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Extracts JWT from Authorization header.
     */
    public String parseJwtFromHeader(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }

    /**
     * Extracts refresh token from Cookie.
     */
    public String getRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, jwtCookieName);
        if (cookie != null) {
            return cookie.getValue();
        }
        return null;
    }

    /**
     * Generates a HTTP-only cookie containing the refresh token.
     */
    public ResponseCookie generateRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from(jwtCookieName, refreshToken)
                .path("/api/v1/auth")
                .maxAge(7 * 24 * 60 * 60) // 7 days in seconds
                .httpOnly(true)
                .secure(true) // require HTTPS (true in production/dev over SSL, normally true)
                .sameSite(cookieSameSite) // Allow local cross-site testing with Lax/None
                .build();
    }

    /**
     * Generates a clean cookie to remove the refresh token.
     */
    public ResponseCookie getCleanRefreshTokenCookie() {
        return ResponseCookie.from(jwtCookieName, "")
                .path("/api/v1/auth")
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .sameSite(cookieSameSite)
                .build();
    }

    /**
     * Generates a JWT access token for a user.
     */
    public String generateTokenFromUsername(String username, Map<String, Object> extraClaims) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key())
                .compact();
    }

    /**
     * Builds access token from user principal.
     */
    public String generateAccessToken(UserDetailsImpl userPrincipal) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", userPrincipal.getId().toString());
        claims.put("firstName", userPrincipal.getFirstName());
        claims.put("lastName", userPrincipal.getLastName());
        claims.put("phoneNumber", userPrincipal.getPhoneNumber());
        claims.put("role", userPrincipal.getAuthorities().iterator().next().getAuthority());
        
        return generateTokenFromUsername(userPrincipal.getUsername(), claims);
    }

    /**
     * Extracts username from JWT token.
     */
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Validates a JWT access token.
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key()).build().parseSignedClaims(authToken);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        } catch (JwtException e) {
            log.error("JWT signature validation failed: {}", e.getMessage());
        }
        return false;
    }
}
