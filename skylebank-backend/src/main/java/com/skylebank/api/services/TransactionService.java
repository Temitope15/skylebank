package com.skylebank.api.services;

import com.skylebank.api.dto.TransactionResponse;
import com.skylebank.api.models.Transaction;
import com.skylebank.api.models.TransactionStatus;
import com.skylebank.api.models.TransactionType;
import com.skylebank.api.models.Wallet;
import com.skylebank.api.repositories.TransactionRepository;
import com.skylebank.api.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;
import com.skylebank.api.models.User;
import jakarta.persistence.criteria.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service class managing business logic for User Transactions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    /**
     * Retrieves paginated transactions associated with the user's wallet with filtering.
     */
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactionsForUser(
            String email,
            TransactionType type,
            TransactionStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String search,
            Pageable pageable
    ) {
        log.info("Fetching transactions for user email: {} with filters type: {}, status: {}, search: {}", email, type, status, search);
        
        Wallet wallet = walletRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + email));

        Specification<Transaction> spec = (root, query, cb) -> {
            Class<?> resultType = query.getResultType();
            if (resultType != Long.class && resultType != long.class) {
                root.fetch("sourceWallet", JoinType.LEFT).fetch("user", JoinType.LEFT);
                Fetch<Transaction, Wallet> twFetch = root.fetch("targetWallet", JoinType.INNER);
                twFetch.fetch("user", JoinType.INNER);
            }

            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.or(
                    cb.equal(root.get("sourceWallet"), wallet),
                    cb.equal(root.get("targetWallet"), wallet)
            ));

            if (type != null) {
                predicates.add(cb.equal(root.get("transactionType"), type));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";

                Join<Transaction, Wallet> sourceWallet = root.join("sourceWallet", JoinType.LEFT);
                Join<Wallet, User> sourceUser = sourceWallet.join("user", JoinType.LEFT);

                Join<Transaction, Wallet> targetWallet = root.join("targetWallet", JoinType.INNER);
                Join<Wallet, User> targetUser = targetWallet.join("user", JoinType.INNER);

                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("reference")), pattern),
                        cb.like(cb.lower(cb.coalesce(root.get("description"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(sourceWallet.get("walletNumber"), "")), pattern),
                        cb.like(cb.lower(targetWallet.get("walletNumber")), pattern),
                        cb.like(cb.lower(cb.coalesce(sourceUser.get("firstName"), "")), pattern),
                        cb.like(cb.lower(cb.coalesce(sourceUser.get("lastName"), "")), pattern),
                        cb.like(cb.lower(targetUser.get("firstName")), pattern),
                        cb.like(cb.lower(targetUser.get("lastName")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Transaction> transactions = transactionRepository.findAll(spec, pageable);

        return transactions.map(t -> {
            String sourceName = t.getSourceWallet() != null ? 
                    t.getSourceWallet().getUser().getFirstName() + " " + t.getSourceWallet().getUser().getLastName() : "System / Deposit";
            String sourceWalletNumber = t.getSourceWallet() != null ? 
                    t.getSourceWallet().getWalletNumber() : "N/A";
            
            String targetName = t.getTargetWallet().getUser().getFirstName() + " " + t.getTargetWallet().getUser().getLastName();
            String targetWalletNumber = t.getTargetWallet().getWalletNumber();

            return TransactionResponse.builder()
                    .id(t.getId())
                    .reference(t.getReference())
                    .sourceWalletNumber(sourceWalletNumber)
                    .sourceWalletOwnerName(sourceName)
                    .targetWalletNumber(targetWalletNumber)
                    .targetWalletOwnerName(targetName)
                    .amount(t.getAmount())
                    .currency(t.getCurrency())
                    .transactionType(t.getTransactionType().name())
                    .status(t.getStatus().name())
                    .description(t.getDescription())
                    .createdAt(t.getCreatedAt())
                    .build();
        });
    }
}
