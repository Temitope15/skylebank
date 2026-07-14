package com.skylebank.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object representing detailed response for system fraud alerts.
 */
@Getter
@Builder
public class FraudAlertResponse {
    private Long id;
    private Long transactionId;
    private String transactionReference;
    private String senderEmail;
    private String senderWalletNumber;
    private String recipientWalletNumber;
    private BigDecimal amount;
    private String ruleName;
    private Integer riskScore;
    private String status;
    private String reason;
    private LocalDateTime createdAt;
}
