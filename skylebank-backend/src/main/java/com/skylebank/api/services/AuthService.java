/**
 * File: AuthService.java
 *
 * Purpose:
 * Implements business operations for registration, credentials verification, and session management.
 *
 * Responsibilities:
 * * Validate user registrations and hash passwords using BCrypt
 * * Authenticate users via AuthenticationManager
 * * Manage creation and rotation of user session refresh tokens
 * * Revoke tokens and clear security contexts during logout
 *
 * Why this file exists:
 * To centralize security business workflows and isolate transaction limits.
 *
 * Usage Flow:
 * AuthController -> AuthService -> UserRepository & RefreshTokenRepository
 *
 * Important Notes:
 * * Publishes UserRegisteredEvent on registration completion
 * * Enforces single-session logins by purging old user tokens on login
 *
 * Design Decisions:
 * * Service Layer Pattern
 * * Token Rotation Pattern (adds security by invalidating old refresh tokens)
 */
package com.skylebank.api.services;

import com.skylebank.api.dto.LoginRequest;
import com.skylebank.api.dto.RegisterRequest;
import com.skylebank.api.events.UserRegisteredEvent;
import com.skylebank.api.models.RefreshToken;
import com.skylebank.api.models.User;
import com.skylebank.api.models.UserRole;
import com.skylebank.api.models.UserStatus;
import com.skylebank.api.repositories.RefreshTokenRepository;
import com.skylebank.api.repositories.UserRepository;
import com.skylebank.api.security.JwtUtils;
import com.skylebank.api.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.skylebank.api.models.PasswordResetToken;
import com.skylebank.api.repositories.PasswordResetTokenRepository;
import com.skylebank.api.services.EmailService;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service managing user authentication, registration, and refresh token states.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final ApplicationEventPublisher eventPublisher;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    /**
     * Registers a new user account.
     */
    @Transactional
    public User register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }
        if (userRepository.existsByPhoneNumber(registerRequest.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number is already in use");
        }

        User user = User.builder()
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .email(registerRequest.getEmail())
                .phoneNumber(registerRequest.getPhoneNumber())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(UserRole.USER)
                .accountStatus(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getEmail());

        // Publish event for downstream provisioning (e.g. Wallets)
        eventPublisher.publishEvent(new UserRegisteredEvent(this, savedUser));

        return savedUser;
    }

    /**
     * Authenticates a user and returns their JWT access token and session refresh token.
     */
    @Transactional
    public Map<String, Object> login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with this email does not exist"));

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new IllegalArgumentException("Incorrect password");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        if (user.getAccountStatus() == UserStatus.SUSPENDED) {
            throw new IllegalStateException("Your account has been suspended");
        }

        // Revoke and clear any previous tokens for single-session security control
        refreshTokenRepository.deleteByUser(user);

        // Generate tokens
        RefreshToken refreshToken = createRefreshToken(user);
        String accessToken = jwtUtils.generateAccessToken(userPrincipal);

        Map<String, Object> result = new HashMap<>();
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken.getToken());
        result.put("principal", userPrincipal);
        return result;
    }

    /**
     * Rotates refresh tokens and issues a new access token.
     */
    @Transactional
    public Map<String, String> refreshAccessToken(String requestRefreshToken) {
        return refreshTokenRepository.findByToken(requestRefreshToken)
                .map(this::verifyExpiration)
                .map(token -> {
                    if (token.isRevoked()) {
                        throw new IllegalStateException("Refresh token is revoked");
                    }
                    User user = token.getUser();

                    // Generate rotated refresh token
                    String newRefreshTokenVal = UUID.randomUUID().toString();
                    token.setToken(newRefreshTokenVal);
                    token.setExpiryDate(Instant.now().plusMillis(7 * 24 * 60 * 60 * 1000L)); // 7 days
                    refreshTokenRepository.save(token);

                    UserDetailsImpl userPrincipal = UserDetailsImpl.build(user);
                    String accessToken = jwtUtils.generateAccessToken(userPrincipal);

                    Map<String, String> tokens = new HashMap<>();
                    tokens.put("accessToken", accessToken);
                    tokens.put("refreshToken", newRefreshTokenVal);
                    return tokens;
                })
                .orElseThrow(() -> new IllegalArgumentException("Session refresh token not found"));
    }

    /**
     * Terminates the active session by revoking the refresh token.
     */
    @Transactional
    public void logout(String requestRefreshToken) {
        if (requestRefreshToken != null) {
            refreshTokenRepository.findByToken(requestRefreshToken)
                    .ifPresent(refreshTokenRepository::delete);
        }
        SecurityContextHolder.clearContext();
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(7 * 24 * 60 * 60 * 1000L)) // 7 days
                .revoked(false)
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    private RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new IllegalStateException("Refresh token expired. Please log in again");
        }
        return token;
    }

    /**
     * Generates a password reset token and dispatches an email to the user if registered.
     */
    @Transactional
    public void generatePasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User with this email does not exist"));

        // Delete any existing reset tokens for the user
        passwordResetTokenRepository.deleteByUser(user);

        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(Instant.now().plusSeconds(15 * 60)) // 15 minutes
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Send email
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    /**
     * Resets user password using a valid reset token.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Password reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Revoke the token so it cannot be reused
        passwordResetTokenRepository.delete(resetToken);
    }
}
