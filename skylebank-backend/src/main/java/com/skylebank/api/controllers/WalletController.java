package com.skylebank.api.controllers;

import com.skylebank.api.dto.WalletResponse;
import com.skylebank.api.services.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;

/**
 * Controller class exposing endpoints for retrieving customer wallet data.
 */
@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
@Slf4j
public class WalletController {

    private final WalletService walletService;

    /**
     * Endpoint to fetch the logged-in user's complete wallet details.
     */
    @GetMapping
    public ResponseEntity<WalletResponse> getWalletDetails(Principal principal) {
        String email = principal.getName();
        log.info("REST request to get wallet details for user: {}", email);
        WalletResponse walletResponse = walletService.getWalletByUserEmail(email);
        return ResponseEntity.ok(walletResponse);
    }

    /**
     * Endpoint to fetch the logged-in user's wallet balance and currency.
     */
    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getWalletBalance(Principal principal) {
        String email = principal.getName();
        log.info("REST request to get wallet balance for user: {}", email);
        Map<String, Object> balanceDetails = walletService.getWalletBalance(email);
        return ResponseEntity.ok(balanceDetails);
    }

    /**
     * Endpoint to lookup recipient details by account number.
     */
    @GetMapping("/lookup")
    public ResponseEntity<com.skylebank.api.dto.RecipientLookupResponse> lookupRecipient(@RequestParam String accountNumber) {
        log.info("REST request to lookup recipient for account number: {}", accountNumber);
        com.skylebank.api.dto.RecipientLookupResponse response = walletService.lookupRecipient(accountNumber);
        return ResponseEntity.ok(response);
    }
}
