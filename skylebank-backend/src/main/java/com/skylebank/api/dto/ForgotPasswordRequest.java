/**
 * File: ForgotPasswordRequest.java
 *
 * Purpose:
 * Request DTO model to trigger forgot-password flows.
 *
 * Responsibilities:
 * * Carry email payload mapping
 * * Enforce JSR-380 email formats and blank constraints
 *
 * Why this file exists:
 * To represent forgot-password request parameters cleanly.
 *
 * Usage Flow:
 * Controller -> ForgotPasswordRequest mapping -> AuthService
 *
 * Design Decisions:
 * * Data Transfer Object (DTO) pattern
 */
package com.skylebank.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Request payload to initiate password reset via email.
 */
@Getter
@Setter
public class ForgotPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;
}
