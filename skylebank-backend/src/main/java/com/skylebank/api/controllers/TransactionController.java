package com.skylebank.api.controllers;

import com.skylebank.api.dto.TransactionResponse;
import com.skylebank.api.models.TransactionStatus;
import com.skylebank.api.models.TransactionType;
import com.skylebank.api.services.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDateTime;

/**
 * Controller class exposing endpoints for user transaction history operations.
 */
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Slf4j
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * Endpoint to fetch the logged-in user's transactions with filtering, search and pagination.
     */
    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getUserTransactions(
            Principal principal,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort
    ) {
        String email = principal.getName();
        log.info("REST request to get transactions for user: {}, type: {}, status: {}, search: {}", email, type, status, search);

        // Handle sorting parameters
        String sortField = "createdAt";
        Sort.Direction direction = Sort.Direction.DESC;

        if (sort != null && sort.length > 0) {
            String[] sortParts = sort[0].split(",");
            sortField = sortParts[0];
            if (sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])) {
                direction = Sort.Direction.ASC;
            } else if (sort.length > 1) {
                // If sort query is passed as sort=createdAt&sort=desc
                if ("asc".equalsIgnoreCase(sort[1])) {
                    direction = Sort.Direction.ASC;
                }
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        Page<TransactionResponse> transactions = transactionService.getTransactionsForUser(
                email, type, status, startDate, endDate, search, pageable
        );

        return ResponseEntity.ok(transactions);
    }
}
