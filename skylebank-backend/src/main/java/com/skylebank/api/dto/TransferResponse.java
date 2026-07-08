package com.skylebank.api.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO representing the response payload for a processed money transfer request.
 */
@Getter
@Setter
@Builder
public class TransferResponse {
    private String reference;
    private String sourceWalletNumber;
    private String targetWalletNumber;
    private BigDecimal amount;
    private String status;
    private LocalDateTime createdAt;
    private String description;
}
