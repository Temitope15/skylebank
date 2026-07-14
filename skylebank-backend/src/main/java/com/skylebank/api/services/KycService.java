package com.skylebank.api.services;

import com.skylebank.api.dto.KycRequestDto;
import com.skylebank.api.dto.PinSetupRequest;
import com.skylebank.api.events.NotificationEvent;
import com.skylebank.api.models.*;
import com.skylebank.api.repositories.KycUpgradeRequestRepository;
import com.skylebank.api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycService {

    private final UserRepository userRepository;
    private final KycUpgradeRequestRepository kycUpgradeRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Set or change a user's transaction PIN.
     */
    @Transactional
    public void setupPin(String email, PinSetupRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getTransactionPin() != null) {
            if (request.getOldPin() == null || request.getOldPin().isBlank()) {
                throw new IllegalArgumentException("Existing PIN detected. Old PIN is required to make changes.");
            }
            if (!passwordEncoder.matches(request.getOldPin(), user.getTransactionPin())) {
                throw new IllegalArgumentException("Incorrect old transaction PIN");
            }
        }

        user.setTransactionPin(passwordEncoder.encode(request.getPin()));
        userRepository.save(user);

        log.info("Transaction PIN updated successfully for user: {}", email);

        // Security notification
        eventPublisher.publishEvent(new NotificationEvent(
                this,
                email,
                "Security Alert: Transaction PIN Updated",
                "Your SkyleBank transaction PIN has been successfully set/changed. If you did not request this, please contact support immediately.",
                true,
                "SECURITY_ALERT",
                null
        ));
    }

    /**
     * Submit upgrade request.
     */
    @Transactional
    public KycUpgradeRequest submitUpgradeRequest(String email, KycRequestDto requestDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate target tier upgrade sequence
        if (requestDto.getTargetTier() == KycLevel.TIER_1) {
            throw new IllegalArgumentException("Cannot request downgrade/upgrade to Tier 1");
        }
        if (requestDto.getTargetTier() == KycLevel.TIER_2 && user.getKycLevel() != KycLevel.TIER_1) {
            throw new IllegalArgumentException("You must be on Tier 1 to request Tier 2 upgrade");
        }
        if (requestDto.getTargetTier() == KycLevel.TIER_3 && user.getKycLevel() != KycLevel.TIER_2) {
            throw new IllegalArgumentException("You must be on Tier 2 to request Tier 3 upgrade");
        }

        // Check for pending requests
        kycUpgradeRequestRepository.findFirstByUserAndStatusOrderByCreatedAtDesc(user, KycRequestStatus.PENDING)
                .ifPresent(req -> {
                    throw new IllegalStateException("You already have a pending KYC upgrade request");
                });

        // Validate requirements
        if (requestDto.getTargetTier() == KycLevel.TIER_2) {
            if (requestDto.getBvn() == null || requestDto.getBvn().length() != 11) {
                throw new IllegalArgumentException("A valid 11-digit BVN is required for Tier 2");
            }
            if (requestDto.getNin() == null || requestDto.getNin().length() != 11) {
                throw new IllegalArgumentException("A valid 11-digit NIN is required for Tier 2");
            }
        } else if (requestDto.getTargetTier() == KycLevel.TIER_3) {
            if (requestDto.getDocumentUrl() == null || requestDto.getDocumentUrl().isBlank()) {
                throw new IllegalArgumentException("Proof of address document is required for Tier 3");
            }
        }

        KycUpgradeRequest request = KycUpgradeRequest.builder()
                .user(user)
                .targetTier(requestDto.getTargetTier())
                .bvn(requestDto.getBvn())
                .nin(requestDto.getNin())
                .documentUrl(requestDto.getDocumentUrl())
                .status(KycRequestStatus.PENDING)
                .build();

        KycUpgradeRequest savedRequest = kycUpgradeRequestRepository.save(request);

        // Notify user
        eventPublisher.publishEvent(new NotificationEvent(
                this,
                email,
                "KYC Verification Submitted",
                "Your request to upgrade to " + requestDto.getTargetTier().name() + " has been submitted and is pending compliance review.",
                false,
                null,
                null
        ));

        return savedRequest;
    }

    /**
     * Get pending upgrade requests (Admin only).
     */
    @Transactional(readOnly = true)
    public List<KycUpgradeRequest> getPendingRequests() {
        return kycUpgradeRequestRepository.findByStatusOrderByCreatedAtDesc(KycRequestStatus.PENDING);
    }

    /**
     * Approve KYC Upgrade (Admin only).
     */
    @Transactional
    public void approveRequest(UUID requestId) {
        KycUpgradeRequest request = kycUpgradeRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("KYC upgrade request not found"));

        if (request.getStatus() != KycRequestStatus.PENDING) {
            throw new IllegalStateException("Request is already processed");
        }

        User user = request.getUser();
        user.setKycLevel(request.getTargetTier());
        if (request.getTargetTier() == KycLevel.TIER_2) {
            user.setBvn(request.getBvn());
            user.setNin(request.getNin());
        }
        userRepository.save(user);

        request.setStatus(KycRequestStatus.APPROVED);
        kycUpgradeRequestRepository.save(request);

        log.info("KYC request {} approved. User {} upgraded to {}", requestId, user.getEmail(), request.getTargetTier());

        // Notify user
        eventPublisher.publishEvent(new NotificationEvent(
                this,
                user.getEmail(),
                "Account Tier Upgraded!",
                "Congratulations! Your SkyleBank account has been upgraded to " + request.getTargetTier().name() + " successfully.",
                true,
                "SECURITY_ALERT", // Reuse security alert for direct alerts
                null
        ));
    }

    /**
     * Reject KYC Upgrade (Admin only).
     */
    @Transactional
    public void rejectRequest(UUID requestId) {
        KycUpgradeRequest request = kycUpgradeRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("KYC upgrade request not found"));

        if (request.getStatus() != KycRequestStatus.PENDING) {
            throw new IllegalStateException("Request is already processed");
        }

        request.setStatus(KycRequestStatus.REJECTED);
        kycUpgradeRequestRepository.save(request);

        User user = request.getUser();
        log.info("KYC request {} rejected for user {}", requestId, user.getEmail());

        // Notify user
        eventPublisher.publishEvent(new NotificationEvent(
                this,
                user.getEmail(),
                "KYC Verification Rejected",
                "Your request to upgrade to " + request.getTargetTier().name() + " was rejected because the submitted information did not pass our checks.",
                true,
                "SECURITY_ALERT",
                null
        ));
    }
}
