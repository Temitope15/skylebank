package com.skylebank.api.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a customer wallet / bank account in the system.
 */
@Entity
@Table(name = "wallets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "wallet_number", nullable = false, unique = true, length = 10)
    private String walletNumber;

    @Column(name = "balance", nullable = false)
    @Builder.Default
    private BigDecimal balance = new BigDecimal("1000000.00");

    @Column(name = "currency", nullable = false, length = 3)
    @Builder.Default
    private String currency = "NGN";

    @Enumerated(EnumType.STRING)
    @Column(name = "wallet_status", nullable = false)
    @Builder.Default
    private WalletStatus walletStatus = WalletStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
