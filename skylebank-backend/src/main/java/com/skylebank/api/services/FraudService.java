package com.skylebank.api.services;

import com.skylebank.api.dto.TransferRequest;
import com.skylebank.api.models.Transaction;
import com.skylebank.api.models.Wallet;
import com.skylebank.api.repositories.TransactionRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service evaluating risk assessments on pending funds transfers.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FraudService {

    private final TransactionRepository transactionRepository;

    private static final BigDecimal THRESHOLD_LIMIT = new BigDecimal("100000.00");
    private static final int VELOCITY_LIMIT = 3;
    private static final int VELOCITY_MINUTES = 5;

    /**
     * Data wrapper detailing fraud evaluation outcomes.
     */
    @Getter
    public static class FraudAssessment {
        private final boolean flagged;
        private final int riskScore;
        private final List<String> triggeredRules;
        private final String reason;

        public FraudAssessment(boolean flagged, int riskScore, List<String> triggeredRules) {
            this.flagged = flagged;
            this.riskScore = riskScore;
            this.triggeredRules = triggeredRules;
            this.reason = String.join(", ", triggeredRules);
        }
    }

    /**
     * Assesses a transaction against fraud rules:
     * 1. Threshold check: amount exceeds ₦100,000
     * 2. Velocity check: more than 3 transactions in the last 5 minutes
     * 3. Device change: User-Agent header differs from user's last transaction
     */
    public FraudAssessment assess(Wallet sourceWallet, TransferRequest request, String userAgent) {
        List<String> triggeredRules = new ArrayList<>();
        int riskScore = 0;

        // 1. Threshold Check
        if (request.getAmount().compareTo(THRESHOLD_LIMIT) > 0) {
            triggeredRules.add("EXCEED_THRESHOLD_LIMIT");
            riskScore += 40;
            log.warn("Fraud Rule Triggered: Transaction amount ₦{} exceeds threshold ₦{} for user {}", 
                    request.getAmount(), THRESHOLD_LIMIT, sourceWallet.getUser().getEmail());
        }

        // 2. Velocity Check
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(VELOCITY_MINUTES);
        long recentTxCount = transactionRepository.countBySourceWalletAndCreatedAtAfter(sourceWallet, cutoff);
        if (recentTxCount >= VELOCITY_LIMIT) {
            triggeredRules.add("VELOCITY_LIMIT_EXCEEDED");
            riskScore += 40;
            log.warn("Fraud Rule Triggered: User {} has made {} transactions in last {} minutes (limit is {})",
                    sourceWallet.getUser().getEmail(), recentTxCount, VELOCITY_MINUTES, VELOCITY_LIMIT);
        }

        // 3. Device Check
        if (userAgent != null && !userAgent.isBlank()) {
            Optional<Transaction> lastTxOpt = transactionRepository.findFirstBySourceWalletOrderByCreatedAtDesc(sourceWallet);
            if (lastTxOpt.isPresent()) {
                String lastUserAgent = lastTxOpt.get().getUserAgent();
                if (lastUserAgent != null && !lastUserAgent.equals(userAgent)) {
                    triggeredRules.add("DEVICE_CHANGE_DETECTED");
                    riskScore += 30;
                    log.warn("Fraud Rule Triggered: Device change detected for user {}. Previous: {}, Current: {}",
                            sourceWallet.getUser().getEmail(), lastUserAgent, userAgent);
                }
            }
        }

        boolean flagged = !triggeredRules.isEmpty();
        return new FraudAssessment(flagged, riskScore, triggeredRules);
    }
}
