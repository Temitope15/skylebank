/**
 * File: DataInitializer.java
 *
 * Purpose:
 * Runs startup tasks to verify database bootstrapping, seeding default admin details.
 *
 * Responsibilities:
 * * Insert default administrator user if absent on system startup
 *
 * Why this file exists:
 * To ensure there is always a valid operational administrator user for local test builds.
 *
 * Usage Flow:
 * Application starts -> run() callback -> UserRepository seeding
 *
 * Important Notes:
 * * Triggers BCrypt hashing for password seed
 *
 * Design Decisions:
 * * Spring CommandLineRunner lifecycle component
 */
package com.skylebank.api.config;

import com.skylebank.api.models.User;
import com.skylebank.api.models.UserRole;
import com.skylebank.api.models.UserStatus;
import com.skylebank.api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Startup seeder to configure initial application users.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@skylebank.com").isEmpty()) {
            User admin = User.builder()
                    .firstName("System")
                    .lastName("Administrator")
                    .email("admin@skylebank.com")
                    .phoneNumber("+1234567890")
                    .password(passwordEncoder.encode("Admin@Password123"))
                    .role(UserRole.ADMIN)
                    .accountStatus(UserStatus.ACTIVE)
                    .build();

            userRepository.save(admin);
            log.info("Default administrator account initialized successfully [admin@skylebank.com]");
        }
    }
}
