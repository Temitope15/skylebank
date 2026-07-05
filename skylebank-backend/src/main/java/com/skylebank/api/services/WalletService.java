package com.skylebank.api.services;

import com.skylebank.api.dto.WalletResponse;
import com.skylebank.api.models.Wallet;
import com.skylebank.api.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Service class managing business logic for User Wallets.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;

    /**
     * Retrieves full wallet details for a given user email.
     */
    @Transactional(readOnly = true)
    public WalletResponse getWalletByUserEmail(String email) {
        log.info("Fetching wallet details for user email: {}", email);
        Wallet wallet = walletRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + email));

        return WalletResponse.builder()
                .walletNumber(wallet.getWalletNumber())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .walletStatus(wallet.getWalletStatus().name())
                .build();
    }

    /**
     * Retrieves only the balance and currency details for a given user email.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getWalletBalance(String email) {
        log.info("Fetching balance details for user email: {}", email);
        Wallet wallet = walletRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + email));

        return Map.of(
                "balance", wallet.getBalance(),
                "currency", wallet.getCurrency()
        );
    }
}
