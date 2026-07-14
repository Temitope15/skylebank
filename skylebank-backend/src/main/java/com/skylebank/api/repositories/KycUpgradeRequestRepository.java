package com.skylebank.api.repositories;

import com.skylebank.api.models.KycRequestStatus;
import com.skylebank.api.models.KycUpgradeRequest;
import com.skylebank.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KycUpgradeRequestRepository extends JpaRepository<KycUpgradeRequest, UUID> {
    List<KycUpgradeRequest> findByStatusOrderByCreatedAtDesc(KycRequestStatus status);
    List<KycUpgradeRequest> findByUserEmailOrderByCreatedAtDesc(String email);
    Optional<KycUpgradeRequest> findFirstByUserAndStatusOrderByCreatedAtDesc(User user, KycRequestStatus status);
}
