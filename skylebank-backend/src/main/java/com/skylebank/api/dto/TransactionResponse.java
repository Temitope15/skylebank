package com.skylebank.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO representing user-facing transaction details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String reference;
    private String sourceWalletNumber;
    private String sourceWalletOwnerName;
    private String targetWalletNumber;
    private String targetWalletOwnerName;
    private BigDecimal amount;
    private String currency;
    private String transactionType;
    private String status;
    private String description;
    private LocalDateTime createdAt;
}
