package com.skylebank.api.repositories;

import com.skylebank.api.models.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Data repository interface for Wallet database queries.
 */
@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUserEmail(String email);

    Boolean existsByWalletNumber(String walletNumber);
}
