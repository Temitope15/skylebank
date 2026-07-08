package com.skylebank.api.controllers;

import com.skylebank.api.dto.AdminStatsResponse;
import com.skylebank.api.dto.AdminUserResponse;
import com.skylebank.api.dto.AdminTransactionResponse;
import com.skylebank.api.dto.ComplaintResponse;
import com.skylebank.api.models.Transaction;
import com.skylebank.api.models.UserStatus;
import com.skylebank.api.models.WalletStatus;
import com.skylebank.api.services.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller exposing endpoints for system administration and management tasks.
 * Secured to users with role 'ADMIN' under Spring Security configurations.
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;

    /**
     * Retrieves key system stats and health metrics.
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getSystemStats() {
        log.info("REST request to fetch system stats");
        return ResponseEntity.ok(adminService.getStats());
    }

    /**
     * Lists all registered users and their wallet balances.
     */
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        log.info("REST request to fetch all users");
        return ResponseEntity.ok(adminService.getUsers());
    }

    /**
     * Toggles a user's status between ACTIVE and SUSPENDED.
     */
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Map<String, String>> updateUserStatus(
            @PathVariable UUID id,
            @RequestParam UserStatus status) {
        log.info("REST request to update user {} status to {}", id, status);
        adminService.updateUserStatus(id, status);
        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }

    /**
     * Toggles a wallet status between ACTIVE and SUSPENDED (vban).
     */
    @PatchMapping("/wallets/{walletNumber}/status")
    public ResponseEntity<Map<String, String>> updateWalletStatus(
            @PathVariable String walletNumber,
            @RequestParam WalletStatus status) {
        log.info("REST request to update wallet {} status to {}", walletNumber, status);
        adminService.updateWalletStatus(walletNumber, status);
        return ResponseEntity.ok(Map.of("message", "Wallet status updated successfully"));
    }

    /**
     * Lists all transactions in the database (money flow analysis).
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<AdminTransactionResponse>> getAllTransactions() {
        log.info("REST request to fetch all transactions");
        return ResponseEntity.ok(adminService.getAllTransactions());
    }

    /**
     * Lists all complaints.
     */
    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        log.info("REST request to fetch all complaints");
        return ResponseEntity.ok(adminService.getAllComplaints());
    }

    /**
     * Resolves a customer complaint ticket.
     */
    @PatchMapping("/complaints/{id}/resolve")
    public ResponseEntity<Map<String, String>> resolveComplaint(@PathVariable Long id) {
        log.info("REST request to resolve complaint {}", id);
        adminService.resolveComplaint(id);
        return ResponseEntity.ok(Map.of("message", "Complaint resolved successfully"));
    }
}
