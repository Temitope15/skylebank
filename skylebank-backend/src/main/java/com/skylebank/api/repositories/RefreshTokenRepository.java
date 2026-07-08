/**
 * File: RefreshTokenRepository.java
 *
 * Purpose:
 * Provides database query operations for RefreshToken entities.
 *
 * Responsibilities:
 * * Find refresh tokens by token string
 * * Delete all refresh tokens associated with a User
 *
 * Why this file exists:
 * To manage user session refresh token storage and revocation.
 *
 * Usage Flow:
 * AuthService -> RefreshTokenRepository -> database
 *
 * Important Notes:
 * * Uses custom @Modifying query for deleting by User
 *
 * Design Decisions:
 * * Repository Pattern
 */
package com.skylebank.api.repositories;

import com.skylebank.api.models.RefreshToken;
import com.skylebank.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Data repository interface for RefreshToken database queries.
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    @Modifying
    int deleteByUser(User user);
}
