package com.skylebank.api.services;

import com.skylebank.api.dto.TransferRequest;
import com.skylebank.api.dto.TransferResponse;
import com.skylebank.api.models.Transaction;
import com.skylebank.api.models.TransactionStatus;
import com.skylebank.api.models.TransactionType;
import com.skylebank.api.models.Wallet;
import com.skylebank.api.models.WalletStatus;
import com.skylebank.api.repositories.TransactionRepository;
import com.skylebank.api.repositories.WalletRepository;
import com.skylebank.api.repositories.FraudAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

/**
 * Service class handling logic for transferring funds between customer wallets.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransferService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final FraudService fraudService;
    private final FraudAlertRepository fraudAlertRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    /**
     * Executes a secure wallet-to-wallet transfer using pessimistic locking.
     */
    @Transactional
    public TransferResponse transferFunds(String sourceEmail, TransferRequest request, String userAgent) {
        log.info("Initiating transfer of ₦{} from user {} to target wallet {}", 
                request.getAmount(), sourceEmail, request.getTargetWalletNumber());

        // 1. Resolve source wallet
        Wallet sourceWalletOpt = walletRepository.findByUserEmail(sourceEmail)
                .orElseThrow(() -> new IllegalArgumentException("Source wallet not found for user: " + sourceEmail));

        // 2. Resolve target wallet
        Wallet targetWalletOpt = walletRepository.findByWalletNumber(request.getTargetWalletNumber())
                .orElseThrow(() -> new IllegalArgumentException("Target account number does not exist"));

        // 3. Enforce no self-transfers
        if (sourceWalletOpt.getWalletNumber().equals(targetWalletOpt.getWalletNumber())) {
            throw new IllegalArgumentException("Cannot transfer funds to your own wallet");
        }

        // 4. Sort wallet numbers to acquire locks in a deterministic order (deadlock prevention)
        Wallet wallet1;
        Wallet wallet2;
        if (sourceWalletOpt.getWalletNumber().compareTo(targetWalletOpt.getWalletNumber()) < 0) {
            wallet1 = walletRepository.findByWalletNumberForUpdate(sourceWalletOpt.getWalletNumber())
                    .orElseThrow(() -> new IllegalStateException("Failed to lock source wallet"));
            wallet2 = walletRepository.findByWalletNumberForUpdate(targetWalletOpt.getWalletNumber())
                    .orElseThrow(() -> new IllegalStateException("Failed to lock target wallet"));
        } else {
            wallet1 = walletRepository.findByWalletNumberForUpdate(targetWalletOpt.getWalletNumber())
                    .orElseThrow(() -> new IllegalStateException("Failed to lock target wallet"));
            wallet2 = walletRepository.findByWalletNumberForUpdate(sourceWalletOpt.getWalletNumber())
                    .orElseThrow(() -> new IllegalStateException("Failed to lock source wallet"));
        }

        // Identify source and target references from locked instances
        Wallet lockedSource = wallet1.getWalletNumber().equals(sourceWalletOpt.getWalletNumber()) ? wallet1 : wallet2;
        Wallet lockedTarget = wallet1.getWalletNumber().equals(targetWalletOpt.getWalletNumber()) ? wallet1 : wallet2;

        // 5. Verify account statuses
        if (lockedSource.getWalletStatus() != WalletStatus.ACTIVE) {
            throw new IllegalStateException("Your wallet status is currently " + lockedSource.getWalletStatus());
        }
        if (lockedTarget.getWalletStatus() != WalletStatus.ACTIVE) {
            throw new IllegalStateException("Recipient wallet is inactive/suspended");
        }

        // 6. Verify sufficient balance
        if (lockedSource.getBalance().compareTo(request.getAmount()) < 0) {
            throw new IllegalStateException("Insufficient funds to complete this transfer");
        }

        String ref = "TX-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        // 7. Run Fraud Risk Assessment
        FraudService.FraudAssessment assessment = fraudService.assess(lockedSource, request, userAgent);
        if (assessment.isFlagged()) {
            Transaction transaction = Transaction.builder()
                    .reference(ref)
                    .sourceWallet(lockedSource)
                    .targetWallet(lockedTarget)
                    .amount(request.getAmount())
                    .currency("NGN")
                    .transactionType(TransactionType.TRANSFER)
                    .status(TransactionStatus.PENDING)
                    .description(request.getDescription())
                    .userAgent(userAgent)
                    .build();

            Transaction savedTx = transactionRepository.save(transaction);

            com.skylebank.api.models.FraudAlert alert = com.skylebank.api.models.FraudAlert.builder()
                    .transaction(savedTx)
                    .ruleName(assessment.getReason())
                    .riskScore(assessment.getRiskScore())
                    .status(com.skylebank.api.models.FraudAlertStatus.PENDING)
                    .reason(assessment.getReason())
                    .build();
            fraudAlertRepository.save(alert);

            log.warn("Transfer flagged as suspicious. Reference: {}, Rules: {}", ref, assessment.getReason());

            // Publish security alert notification event
            eventPublisher.publishEvent(new com.skylebank.api.events.NotificationEvent(
                    this,
                    lockedSource.getUser().getEmail(),
                    "Suspicious Transfer Flagged",
                    "A transfer of ₦" + request.getAmount() + " to wallet " + request.getTargetWalletNumber() + " was flagged as suspicious and is pending review.",
                    true,
                    "SECURITY_ALERT",
                    null
            ));

            return TransferResponse.builder()
                    .reference(savedTx.getReference())
                    .sourceWalletNumber(lockedSource.getWalletNumber())
                    .targetWalletNumber(lockedTarget.getWalletNumber())
                    .amount(savedTx.getAmount())
                    .status(savedTx.getStatus().name())
                    .createdAt(savedTx.getCreatedAt())
                    .description(savedTx.getDescription())
                    .build();
        }

        // 8. Deduct and Credit balances (No Fraud detected)
        lockedSource.setBalance(lockedSource.getBalance().subtract(request.getAmount()));
        lockedTarget.setBalance(lockedTarget.getBalance().add(request.getAmount()));

        walletRepository.save(lockedSource);
        walletRepository.save(lockedTarget);

        Transaction transaction = Transaction.builder()
                .reference(ref)
                .sourceWallet(lockedSource)
                .targetWallet(lockedTarget)
                .amount(request.getAmount())
                .currency("NGN")
                .transactionType(TransactionType.TRANSFER)
                .status(TransactionStatus.SUCCESS)
                .description(request.getDescription())
                .userAgent(userAgent)
                .build();

        transactionRepository.save(transaction);

        log.info("Transfer completed successfully. Reference: {}", ref);

        // Publish debit alert to sender
        java.util.Map<String, Object> debitMeta = new java.util.HashMap<>();
        debitMeta.put("amount", transaction.getAmount());
        debitMeta.put("reference", transaction.getReference());
        debitMeta.put("recipient", lockedTarget.getWalletNumber());

        eventPublisher.publishEvent(new com.skylebank.api.events.NotificationEvent(
                this,
                lockedSource.getUser().getEmail(),
                "Debit Alert",
                "Your wallet " + lockedSource.getWalletNumber() + " has been debited with ₦" + transaction.getAmount() + " for a transfer to " + lockedTarget.getWalletNumber() + ".",
                true,
                "DEBIT",
                debitMeta
        ));

        // Publish credit alert to receiver
        java.util.Map<String, Object> creditMeta = new java.util.HashMap<>();
        creditMeta.put("amount", transaction.getAmount());
        creditMeta.put("reference", transaction.getReference());
        creditMeta.put("sender", lockedSource.getWalletNumber());

        eventPublisher.publishEvent(new com.skylebank.api.events.NotificationEvent(
                this,
                lockedTarget.getUser().getEmail(),
                "Credit Alert",
                "Your wallet " + lockedTarget.getWalletNumber() + " has been credited with ₦" + transaction.getAmount() + " from " + lockedSource.getWalletNumber() + ".",
                true,
                "CREDIT",
                creditMeta
        ));

        return TransferResponse.builder()
                .reference(transaction.getReference())
                .sourceWalletNumber(lockedSource.getWalletNumber())
                .targetWalletNumber(lockedTarget.getWalletNumber())
                .amount(transaction.getAmount())
                .status(transaction.getStatus().name())
                .createdAt(transaction.getCreatedAt())
                .description(transaction.getDescription())
                .build();
    }
}
