package com.skylebank.api.repositories;

import com.skylebank.api.models.FraudAlert;
import com.skylebank.api.models.FraudAlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface managing database access for FraudAlert entities.
 */
@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {
    List<FraudAlert> findByStatusOrderByCreatedAtDesc(FraudAlertStatus status);
}
