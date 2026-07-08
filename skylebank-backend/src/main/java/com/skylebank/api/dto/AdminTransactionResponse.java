package com.skylebank.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO representing transaction information for administration audits.
 * Flattens relationship mappings to prevent Hibernate Lazy proxy serialization errors.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTransactionResponse {
    private Long id;
    private String reference;
    private String sourceWalletNumber;
    private String targetWalletNumber;
    private BigDecimal amount;
    private String currency;
    private String transactionType;
    private String status;
    private String description;
    private LocalDateTime createdAt;
}
