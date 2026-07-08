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

    /**
     * Looks up recipient full name by wallet number.
     */
    @Transactional(readOnly = true)
    public com.skylebank.api.dto.RecipientLookupResponse lookupRecipient(String walletNumber) {
        log.info("Performing recipient lookup for wallet number: {}", walletNumber);
        Wallet wallet = walletRepository.findByWalletNumber(walletNumber)
                .orElseThrow(() -> new IllegalArgumentException("Account number does not exist"));

        String fullName = wallet.getUser().getFirstName() + " " + wallet.getUser().getLastName();
        return com.skylebank.api.dto.RecipientLookupResponse.builder()
                .walletNumber(wallet.getWalletNumber())
                .fullName(fullName)
                .build();
    }
}
