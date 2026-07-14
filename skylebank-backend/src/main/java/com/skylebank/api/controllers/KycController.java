package com.skylebank.api.controllers;

import com.skylebank.api.dto.KycRequestDto;
import com.skylebank.api.dto.PinSetupRequest;
import com.skylebank.api.models.KycUpgradeRequest;
import com.skylebank.api.services.KycService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class KycController {

    private final KycService kycService;

    /**
     * Set up or update a user's transaction PIN.
     */
    @PostMapping("/kyc/pin")
    public ResponseEntity<Map<String, String>> setupPin(@Valid @RequestBody PinSetupRequest request, Principal principal) {
        String email = principal.getName();
        log.info("REST request to set up transaction PIN for user: {}", email);
        kycService.setupPin(email, request);
        return ResponseEntity.ok(Map.of("message", "Transaction PIN updated successfully"));
    }

    /**
     * Submit an account upgrade request.
     */
    @PostMapping("/kyc/upgrade")
    public ResponseEntity<Map<String, String>> submitUpgradeRequest(@Valid @RequestBody KycRequestDto requestDto, Principal principal) {
        String email = principal.getName();
        log.info("REST request to submit account upgrade request to {} for user: {}", requestDto.getTargetTier(), email);
        kycService.submitUpgradeRequest(email, requestDto);
        return ResponseEntity.ok(Map.of("message", "KYC upgrade request submitted successfully"));
    }

    /**
     * Fetch all pending KYC upgrade requests (Admin only).
     */
    @GetMapping("/admin/kyc/requests")
    public ResponseEntity<List<KycUpgradeRequest>> getPendingRequests() {
        log.info("REST request to fetch all pending KYC upgrade requests");
        return ResponseEntity.ok(kycService.getPendingRequests());
    }

    /**
     * Approve upgrade request (Admin only).
     */
    @PatchMapping("/admin/kyc/requests/{id}/approve")
    public ResponseEntity<Map<String, String>> approveRequest(@PathVariable UUID id) {
        log.info("REST request to approve KYC upgrade request: {}", id);
        kycService.approveRequest(id);
        return ResponseEntity.ok(Map.of("message", "KYC upgrade request approved successfully"));
    }

    /**
     * Reject upgrade request (Admin only).
     */
    @PatchMapping("/admin/kyc/requests/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectRequest(@PathVariable UUID id) {
        log.info("REST request to reject KYC upgrade request: {}", id);
        kycService.rejectRequest(id);
        return ResponseEntity.ok(Map.of("message", "KYC upgrade request rejected successfully"));
    }
}
