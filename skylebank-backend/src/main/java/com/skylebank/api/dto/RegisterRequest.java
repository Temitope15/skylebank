/**
 * File: RegisterRequest.java
 *
 * Purpose:
 * Request DTO mapping registration data parameters.
 *
 * Responsibilities:
 * * Carry identity details (name, email, phone)
 * * Validate strength of user passwords via regex
 * * Validate phone format and size limits
 *
 * Why this file exists:
 * To safeguard registration input data from malformed inputs.
 *
 * Usage Flow:
 * Controller -> RegisterRequest validation -> AuthService
 *
 * Design Decisions:
 * * Data Transfer Object (DTO) pattern
 * * E.164 phone validation rules
 */
package com.skylebank.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request payload for user registration.
 */
@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    @Size(max = 150, message = "Email cannot exceed 150 characters")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Please enter a valid E.164 phone number")
    @Size(max = 30, message = "Phone number cannot exceed 30 characters")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$",
        message = "Password must be at least 8 characters long, containing at least one uppercase, lowercase, digit, and special character"
    )
    private String password;
}
