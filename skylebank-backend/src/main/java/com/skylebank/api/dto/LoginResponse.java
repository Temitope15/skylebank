/**
 * File: LoginResponse.java
 *
 * Purpose:
 * Response DTO returning user details and access token on login.
 *
 * Responsibilities:
 * * Carry access token details
 * * Carry active user properties (ID, name, email, role)
 *
 * Why this file exists:
 * To represent clean authentication results for state updates.
 *
 * Usage Flow:
 * AuthService -> AuthController -> LoginResponse -> SPA client
 *
 * Design Decisions:
 * * Data Transfer Object (DTO) pattern
 */
package com.skylebank.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Response payload returned upon successful authentication.
 */
@Getter
@Setter
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
