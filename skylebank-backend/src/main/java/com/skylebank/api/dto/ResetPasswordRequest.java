/**
 * File: ResetPasswordRequest.java
 *
 * Purpose:
 * Request DTO model mapping password reset values.
 *
 * Responsibilities:
 * * Carry verification token and new password value
 * * Validate new password strength via regex
 *
 * Why this file exists:
 * To represent reset-password parameters safely.
 *
 * Usage Flow:
 * Controller -> ResetPasswordRequest validation -> AuthService
 *
 * Design Decisions:
 * * Data Transfer Object (DTO) pattern
 */
package com.skylebank.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

/**
 * Request payload containing verification token and the new password.
 */
@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "Verification token is required")
    private String token;

    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$",
        message = "Password must be at least 8 characters long, containing at least one uppercase, lowercase, digit, and special character"
    )
    private String newPassword;
}
