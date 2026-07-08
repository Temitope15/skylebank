package com.skylebank.api.config;

import com.skylebank.api.events.UserRegisteredEvent;
import com.skylebank.api.models.*;
import com.skylebank.api.repositories.ComplaintRepository;
import com.skylebank.api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Startup seeder to configure initial application users, wallets, and complaints.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public void run(String... args) {
        // 1. Seed admin if absent
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

        // 2. Seed some default customers
        User john = null;
        if (userRepository.findByEmail("john.doe@skylebank.com").isEmpty()) {
            john = User.builder()
                    .firstName("John")
                    .lastName("Doe")
                    .email("john.doe@skylebank.com")
                    .phoneNumber("+2348031111111")
                    .password(passwordEncoder.encode("Password123!"))
                    .role(UserRole.USER)
                    .accountStatus(UserStatus.ACTIVE)
                    .build();

            userRepository.save(john);
            log.info("Default customer john.doe@skylebank.com registered");
            eventPublisher.publishEvent(new UserRegisteredEvent(this, john));
        } else {
            john = userRepository.findByEmail("john.doe@skylebank.com").orElse(null);
        }

        User jane = null;
        if (userRepository.findByEmail("jane.smith@skylebank.com").isEmpty()) {
            jane = User.builder()
                    .firstName("Jane")
                    .lastName("Smith")
                    .email("jane.smith@skylebank.com")
                    .phoneNumber("+2348032222222")
                    .password(passwordEncoder.encode("Password123!"))
                    .role(UserRole.USER)
                    .accountStatus(UserStatus.ACTIVE)
                    .build();

            userRepository.save(jane);
            log.info("Default customer jane.smith@skylebank.com registered");
            eventPublisher.publishEvent(new UserRegisteredEvent(this, jane));
        } else {
            jane = userRepository.findByEmail("jane.smith@skylebank.com").orElse(null);
        }

        // 3. Seed complaints if empty
        if (complaintRepository.count() == 0) {
            if (john != null) {
                complaintRepository.save(Complaint.builder()
                        .user(john)
                        .title("Transfer Pending Since Yesterday")
                        .description("I tried sending NGN 5,000 to my other account, my wallet was debited but the status remains PENDING and receiver hasn't credited.")
                        .category(ComplaintCategory.TRANSACTION)
                        .status(ComplaintStatus.PENDING)
                        .build());

                complaintRepository.save(Complaint.builder()
                        .user(john)
                        .title("Card Limit Extension Request")
                        .description("I would like to raise my daily savings transfer limits to ₦200,000.00. I can upload my national ID card.")
                        .category(ComplaintCategory.ACCOUNT)
                        .status(ComplaintStatus.PENDING)
                        .build());
            }

            if (jane != null) {
                complaintRepository.save(Complaint.builder()
                        .user(jane)
                        .title("Security Alert Logins")
                        .description("I received an SMTP password reset link that I didn't initiate. Please check if my session is compromised.")
                        .category(ComplaintCategory.SECURITY)
                        .status(ComplaintStatus.PENDING)
                        .build());
            }
            log.info("Default customer support tickets/complaints initialized successfully");
        }
    }
}
