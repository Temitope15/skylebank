package com.skylebank.api.listeners;

import com.skylebank.api.events.UserRegisteredEvent;
import com.skylebank.api.models.Wallet;
import com.skylebank.api.repositories.WalletRepository;
import com.skylebank.api.utils.NubanGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Listens to UserRegisteredEvent and automatically provisions a Wallet for the new user.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WalletProvisioningListener {

    private final WalletRepository walletRepository;

    /**
     * Handles the user registered event by creating a new wallet.
     */
    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("User registration event caught. Provisioning wallet for user email: {}", event.getUser().getEmail());

        String walletNumber = "";
        int retries = 0;
        boolean unique = false;

        // Loop to handle potential NUBAN collisions
        while (!unique && retries < 10) {
            walletNumber = NubanGenerator.generateNuban();
            if (!walletRepository.existsByWalletNumber(walletNumber)) {
                unique = true;
            } else {
                retries++;
                log.warn("NUBAN collision detected for number: {}. Retrying... (Attempt {})", walletNumber, retries);
            }
        }

        if (!unique) {
            throw new IllegalStateException("Failed to generate a unique NUBAN after maximum retries");
        }

        Wallet wallet = Wallet.builder()
                .user(event.getUser())
                .walletNumber(walletNumber)
                .build();

        walletRepository.save(wallet);
        log.info("Wallet successfully provisioned. User: {}, NUBAN: {}", event.getUser().getEmail(), walletNumber);
    }
}
