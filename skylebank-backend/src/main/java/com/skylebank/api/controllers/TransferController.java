package com.skylebank.api.controllers;

import com.skylebank.api.dto.TransferRequest;
import com.skylebank.api.dto.TransferResponse;
import com.skylebank.api.services.TransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * Controller exposing endpoints for executing wallet money transfers.
 */
@RestController
@RequestMapping("/api/v1/transfers")
@RequiredArgsConstructor
@Slf4j
public class TransferController {

    private final TransferService transferService;

    /**
     * Endpoint to execute a wallet money transfer request.
     */
    @PostMapping
    public ResponseEntity<TransferResponse> transferFunds(
            Principal principal,
            @Valid @RequestBody TransferRequest transferRequest) {
        String email = principal.getName();
        log.info("REST request to execute transfer by user {}: target={}, amount={}",
                email, transferRequest.getTargetWalletNumber(), transferRequest.getAmount());
        
        TransferResponse response = transferService.transferFunds(email, transferRequest);
        return ResponseEntity.ok(response);
    }
}
