/**
 * File: UserDetailsServiceImpl.java
 *
 * Purpose:
 * Implements Spring Security's UserDetailsService interface to query and fetch users by email identifier.
 *
 * Responsibilities:
 * * Query UserRepository for user credentials
 * * Build UserDetailsImpl adapter wrapper objects
 *
 * Why this file exists:
 * Spring Security's authentication filters require a service callback to resolve identifiers to credentials.
 *
 * Usage Flow:
 * AuthenticationProvider -> UserDetailsServiceImpl -> UserRepository -> database
 *
 * Important Notes:
 * * Runs with Transactional(readOnly = true) status
 *
 * Design Decisions:
 * * Service Repository Pattern
 */
package com.skylebank.api.security;

import com.skylebank.api.models.User;
import com.skylebank.api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to load user-specific data from the database.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return UserDetailsImpl.build(user);
    }
}
