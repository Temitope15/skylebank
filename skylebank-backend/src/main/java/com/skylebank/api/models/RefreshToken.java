/**
 * File: RefreshToken.java
 *
 * Purpose:
 * Represents the database entity mapping refresh tokens for user authentication sessions.
 *
 * Responsibilities:
 * * Track token identifier string
 * * Relate to a User entity
 * * Store session expiration dates and revocation flags
 *
 * Why this file exists:
 * To provide stateful tracking and revocation control over silent session extension tokens.
 *
 * Usage Flow:
 * RefreshTokenRepository -> RefreshToken -> database
 *
 * Important Notes:
 * * Tied to User via Lazy Fetch ManyToOne relation
 *
 * Design Decisions:
 * * Session Management Entity
 */
package com.skylebank.api.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entity representing a user session refresh token.
 */
@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

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

    @Column(name = "revoked", nullable = false)
    @Builder.Default
    private boolean revoked = false;
}
