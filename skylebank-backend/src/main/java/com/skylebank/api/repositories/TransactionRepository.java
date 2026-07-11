package com.skylebank.api.repositories;

import com.skylebank.api.models.Transaction;
import com.skylebank.api.models.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface managing database access for Transaction entities.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {
    Optional<Transaction> findByReference(String reference);

    long countByStatus(com.skylebank.api.models.TransactionStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.status = :status")
    java.math.BigDecimal sumVolumeByStatus(@org.springframework.data.repository.query.Param("status") com.skylebank.api.models.TransactionStatus status);
}


