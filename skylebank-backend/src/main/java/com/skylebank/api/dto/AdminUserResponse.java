package com.skylebank.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Data Transfer Object representing user details and wallet information for Admin user management.
 */
@Getter
@Builder
public class AdminUserResponse {
    private UUID userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String role;
    private String accountStatus;
    
    // Wallet info
    private String walletNumber;
    private BigDecimal walletBalance;
    private String walletStatus;
}
