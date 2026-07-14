/**
 * File: AuthController.java
 *
 * Purpose:
 * Exposes REST endpoints for user authentication, registration, session management, and password resets.
 *
 * Responsibilities:
 * * Handle POST requests to /register, /login, /logout, /refresh
 * * Handle mock POST requests to /forgot-password, /reset-password, /verify-email
 * * Append HTTP-only cookies for rotated refresh tokens to response headers
 *
 * Why this file exists:
 * To expose public authentication endpoints to the frontend SPA client.
 *
 * Usage Flow:
 * SPA client -> HTTP POST /api/v1/auth/login -> AuthController -> AuthService -> response + cookie
 *
 * Important Notes:
 * * Operates under the /api/v1/auth request mapping
 * * Employs cookie-based refresh tokens and JSON access tokens
 *
 * Design Decisions:
 * * RestController Pattern
 * * Unified Request/Response DTO envelopes
 */
package com.skylebank.api.controllers;

import com.skylebank.api.dto.*;
import com.skylebank.api.models.User;
import com.skylebank.api.security.JwtUtils;
import com.skylebank.api.security.UserDetailsImpl;
import com.skylebank.api.services.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller managing authentication, session refreshment, and password request routes.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok(new MessageResponse("User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Map<String, Object> authData = authService.login(loginRequest);

        String accessToken = (String) authData.get("accessToken");
        String refreshToken = (String) authData.get("refreshToken");
        UserDetailsImpl principal = (UserDetailsImpl) authData.get("principal");

        ResponseCookie cookie = jwtUtils.generateRefreshTokenCookie(refreshToken);

        LoginResponse response = LoginResponse.builder()
                .accessToken(accessToken)
                .id(principal.getId())
                .email(principal.getEmail())
                .firstName(principal.getFirstName())
                .lastName(principal.getLastName())
                .role(principal.getAuthorities().iterator().next().getAuthority())
                .kycLevel((String) authData.get("kycLevel"))
                .hasTransactionPin((Boolean) authData.get("hasTransactionPin"))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshSessionToken(HttpServletRequest request) {
        String refreshToken = jwtUtils.getRefreshTokenFromCookie(request);

        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).body(new MessageResponse("Refresh token cookie is missing"));
        }

        try {
            Map<String, String> tokens = authService.refreshAccessToken(refreshToken);
            String newAccessToken = tokens.get("accessToken");
            String newRefreshToken = tokens.get("refreshToken");

            ResponseCookie cookie = jwtUtils.generateRefreshTokenCookie(newRefreshToken);

            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("accessToken", newAccessToken);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(responseBody);
        } catch (Exception e) {
            log.error("Refresh token rotation failed: {}", e.getMessage());
            // Return clear cookie on failure to flush stale session tokens
            ResponseCookie cleanCookie = jwtUtils.getCleanRefreshTokenCookie();
            return ResponseEntity.status(401)
                    .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logoutUser(HttpServletRequest request) {
        String refreshToken = jwtUtils.getRefreshTokenFromCookie(request);
        authService.logout(refreshToken);

        ResponseCookie cleanCookie = jwtUtils.getCleanRefreshTokenCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                .body(new MessageResponse("Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.generatePasswordResetToken(request.getEmail());
        return ResponseEntity.ok(new MessageResponse("If the email address is registered, a password reset link has been dispatched"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(new MessageResponse("Password has been reset successfully"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam String token) {
        // Mocked response for auth UI integration
        return ResponseEntity.ok(new MessageResponse("Email verification successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        User user = authService.getUserByEmail(principal.getName());
        UserProfileResponse profile = UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .kycLevel(user.getKycLevel().name())
                .hasTransactionPin(user.getTransactionPin() != null)
                .build();
        return ResponseEntity.ok(profile);
    }
}
