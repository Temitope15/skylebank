package com.skylebank.api.services;

import com.skylebank.api.dto.AdminStatsResponse;
import com.skylebank.api.dto.AdminUserResponse;
import com.skylebank.api.dto.AdminTransactionResponse;
import com.skylebank.api.dto.ComplaintResponse;
import com.skylebank.api.models.*;
import com.skylebank.api.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.management.ManagementFactory;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class handling admin-level operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final ComplaintRepository complaintRepository;

    /**
     * Aggregates stats and health status of the system.
     */
    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        log.info("Fetching administrative statistics");

        long totalUsers = userRepository.count();
        long totalActiveWallets = walletRepository.countByWalletStatus(WalletStatus.ACTIVE);
        BigDecimal totalSystemBalance = walletRepository.sumAllBalances();
        long totalTransactions = transactionRepository.count();
        BigDecimal totalVolume = transactionRepository.sumVolumeByStatus(TransactionStatus.SUCCESS);
        long unresolvedComplaints = complaintRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(c -> c.getStatus() == ComplaintStatus.PENDING)
                .count();

        // System health details
        String dbStatus = "UP";
        try {
            // Check if we can perform a count query (acts as DB ping)
            userRepository.count();
        } catch (Exception e) {
            dbStatus = "DOWN";
        }

        long freeMemory = Runtime.getRuntime().freeMemory();
        long uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalActiveWallets(totalActiveWallets)
                .totalSystemBalance(totalSystemBalance)
                .totalTransactions(totalTransactions)
                .totalTransactionVolume(totalVolume)
                .unresolvedComplaints(unresolvedComplaints)
                .dbStatus(dbStatus)
                .cacheStatus("UP") // Caffeine in-memory cache is active
                .systemFreeMemoryBytes(freeMemory)
                .systemUptimeSeconds(uptimeSeconds)
                .build();
    }

    /**
     * Lists all users and their wallets.
     */
    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers() {
        log.info("Listing all users for administrative review");
        List<User> users = userRepository.findAll();

        return users.stream().map(user -> {
            Optional<Wallet> walletOpt = walletRepository.findByUserEmail(user.getEmail());
            return AdminUserResponse.builder()
                    .userId(user.getId())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .phoneNumber(user.getPhoneNumber())
                    .role(user.getRole().name())
                    .accountStatus(user.getAccountStatus().name())
                    .walletNumber(walletOpt.map(Wallet::getWalletNumber).orElse("N/A"))
                    .walletBalance(walletOpt.map(Wallet::getBalance).orElse(BigDecimal.ZERO))
                    .walletStatus(walletOpt.map(w -> w.getWalletStatus().name()).orElse("N/A"))
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Updates user account status.
     */
    @Transactional
    public void updateUserStatus(UUID userId, UserStatus status) {
        log.info("Updating user {} account status to {}", userId, status);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        user.setAccountStatus(status);
        userRepository.save(user);
    }

    /**
     * Updates wallet status (vban/blocking).
     */
    @Transactional
    public void updateWalletStatus(String walletNumber, WalletStatus status) {
        log.info("Updating wallet {} status to {}", walletNumber, status);
        Wallet wallet = walletRepository.findByWalletNumber(walletNumber)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found with number: " + walletNumber));

        wallet.setWalletStatus(status);
        walletRepository.save(wallet);
    }

    /**
     * Lists all transactions in the system to track money flow.
     */
    @Transactional(readOnly = true)
    public List<AdminTransactionResponse> getAllTransactions() {
        log.info("Retrieving all transactions for audit review");
        List<Transaction> transactions = transactionRepository.findAll();
        return transactions.stream().map(t -> AdminTransactionResponse.builder()
                .id(t.getId())
                .reference(t.getReference())
                .sourceWalletNumber(t.getSourceWallet() != null ? t.getSourceWallet().getWalletNumber() : null)
                .targetWalletNumber(t.getTargetWallet().getWalletNumber())
                .amount(t.getAmount())
                .currency(t.getCurrency())
                .transactionType(t.getTransactionType().name())
                .status(t.getStatus().name())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .build()
        ).collect(Collectors.toList());
    }

    /**
     * Lists all complaints.
     */
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints() {
        log.info("Retrieving all customer complaints");
        List<Complaint> complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
        return complaints.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Resolves a customer complaint.
     */
    @Transactional
    public void resolveComplaint(Long id) {
        log.info("Resolving complaint with ID: {}", id);
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with ID: " + id));

        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaintRepository.save(complaint);
    }

    private ComplaintResponse mapToResponse(Complaint complaint) {
        return ComplaintResponse.builder()
                .id(complaint.getId())
                .userEmail(complaint.getUser().getEmail())
                .userFullName(complaint.getUser().getFirstName() + " " + complaint.getUser().getLastName())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory().name())
                .status(complaint.getStatus().name())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }
}
