/**
 * File: PasswordResetTokenRepository.java
 *
 * Purpose:
 * Provides database query operations for PasswordResetToken entities.
 *
 * Responsibilities:
 * * Find password reset tokens by token string
 * * Delete all password reset tokens associated with a User
 */
package com.skylebank.api.repositories;

import com.skylebank.api.models.PasswordResetToken;
import com.skylebank.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Data repository interface for PasswordResetToken database queries.
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    @Modifying
    int deleteByUser(User user);
}
