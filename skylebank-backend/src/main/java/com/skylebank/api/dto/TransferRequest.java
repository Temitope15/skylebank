package com.skylebank.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO carrying request parameters for transferring funds between wallets.
 */
@Getter
@Setter
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class TransferRequest {

    @NotBlank(message = "Target account number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Target account number must be exactly 10 digits")
    private String targetWalletNumber;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "10.00", message = "Minimum transfer amount is ₦10.00")
    private BigDecimal amount;

    @Size(max = 150, message = "Description cannot exceed 150 characters")
    private String description;
}
