/**
 * File: User.java
 *
 * Purpose:
 * Represents the database mapping entity for users in SkyleBank.
 *
 * Responsibilities:
 * * Holds user identity properties (email, phone, name)
 * * Holds credentials and roles/statuses
 * * Manages creation and update timestamp lifecycle hooks
 *
 * Why this file exists:
 * To represent user accounts in the domain layer.
 *
 * Usage Flow:
 * UserRepository -> User -> database
 *
 * Important Notes:
 * * Uses UUID as primary identifier for database lookup security
 *
 * Design Decisions:
 * * JPA Entity Model
 */
package com.skylebank.api.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a user in the banking system.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "phone_number", nullable = false, unique = true, length = 30)
    private String phoneNumber;

    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private UserRole role = UserRole.USER;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    @Builder.Default
    private UserStatus accountStatus = UserStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_level", nullable = false)
    @Builder.Default
    private KycLevel kycLevel = KycLevel.TIER_1;

    @Column(name = "bvn", length = 11)
    private String bvn;

    @Column(name = "nin", length = 11)
    private String nin;

    @Column(name = "transaction_pin", length = 100)
    private String transactionPin;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
