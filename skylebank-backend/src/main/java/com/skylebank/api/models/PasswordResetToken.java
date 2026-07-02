/**
 * File: PasswordResetToken.java
 *
 * Purpose:
 * Represents the database entity mapping password reset tokens for user accounts.
 *
 * Responsibilities:
 * * Track token identifier string
 * * Relate to a User entity
 * * Store token expiration dates
 *
 * Why this file exists:
 * To provide stateful tracking and single-use control over password reset links.
 */
package com.skylebank.api.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entity representing a user password reset token.
 */
@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token", nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;
}
