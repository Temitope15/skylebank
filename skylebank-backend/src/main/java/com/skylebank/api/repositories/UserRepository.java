/**
 * File: UserRepository.java
 *
 * Purpose:
 * Provides database abstraction and query methods for User entities.
 *
 * Responsibilities:
 * * Find users by email or phone number
 * * Verify existence of emails and phone numbers
 *
 * Why this file exists:
 * To centralize database operations for User records.
 *
 * Usage Flow:
 * AuthService -> UserRepository -> database
 *
 * Important Notes:
 * * Extends JpaRepository using UUID primary key
 *
 * Design Decisions:
 * * Repository Pattern
 */
package com.skylebank.api.repositories;

import com.skylebank.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Data repository interface for User database queries.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    Boolean existsByEmail(String email);

    Boolean existsByPhoneNumber(String phoneNumber);
}
