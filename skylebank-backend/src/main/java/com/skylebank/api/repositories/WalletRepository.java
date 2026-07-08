package com.skylebank.api.repositories;

import com.skylebank.api.models.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

/**
 * Data repository interface for Wallet database queries.
 */
@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUserEmail(String email);

    Boolean existsByWalletNumber(String walletNumber);

    Optional<Wallet> findByWalletNumber(String walletNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.walletNumber = :walletNumber")
    Optional<Wallet> findByWalletNumberForUpdate(@Param("walletNumber") String walletNumber);

    long countByWalletStatus(com.skylebank.api.models.WalletStatus walletStatus);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(w.balance), 0) FROM Wallet w")
    java.math.BigDecimal sumAllBalances();
}

