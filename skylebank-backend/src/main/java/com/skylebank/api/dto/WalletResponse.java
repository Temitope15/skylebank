package com.skylebank.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Data Transfer Object representing wallet details returned to the frontend.
 */
@Getter
@Setter
@AllArgsConstructor
@Builder
public class WalletResponse {
    private String walletNumber;
    private BigDecimal balance;
    private String currency;
    private String walletStatus;
}
