/**
 * File: LoginRequest.java
 *
 * Purpose:
 * Request DTO model mapping login request inputs.
 *
 * Responsibilities:
 * * Carry email and password login fields
 * * Enforce blank constraints and email syntax validation
 *
 * Why this file exists:
 * To encapsulate authentication credentials securely.
 *
 * Usage Flow:
 * Controller -> LoginRequest mapping -> AuthService
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
 * Request payload for user login.
 */
@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
