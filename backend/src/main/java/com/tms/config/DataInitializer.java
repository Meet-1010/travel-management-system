package com.tms.config;

import com.tms.model.User;
import com.tms.model.Policy;
import com.tms.repository.PolicyRepository;
import com.tms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * DataInitializer - Runs once on application startup
 *
 * Why this instead of raw SQL hashes?
 * BCrypt hashes are generated at runtime by the PasswordEncoder bean.
 * A pre-generated hash in SQL may not match what Spring Security expects
 * (different rounds, different salt). This guarantees correctness.
 *
 * CommandLineRunner: Spring calls run() after the app context is loaded.
 * We check if users exist first — so this is SAFE to run every restart.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // Only seed if no users exist yet
        if (userRepository.count() == 0) {
            log.info("🌱 Seeding initial users...");

            String defaultPassword = passwordEncoder.encode("admin123");

            userRepository.save(User.builder()
                    .name("System Admin")
                    .email("admin@tms.com")
                    .password(defaultPassword)
                    .role(User.Role.ADMIN)
                    .department("IT")
                    .build());

            userRepository.save(User.builder()
                    .name("John Employee")
                    .email("john@tms.com")
                    .password(defaultPassword)
                    .role(User.Role.EMPLOYEE)
                    .department("Sales")
                    .build());

            userRepository.save(User.builder()
                    .name("Jane Manager")
                    .email("manager@tms.com")
                    .password(defaultPassword)
                    .role(User.Role.MANAGER)
                    .department("Sales")
                    .build());

            userRepository.save(User.builder()
                    .name("Bob Finance")
                    .email("finance@tms.com")
                    .password(defaultPassword)
                    .role(User.Role.FINANCE)
                    .department("Finance")
                    .build());

            log.info("✅ 4 users seeded with password: admin123");
        } else {
            log.info("ℹ️ Users already exist — skipping seed.");
        }

        // Seed default policy if none exists
        if (policyRepository.count() == 0) {
            policyRepository.save(Policy.builder()
                    .policyName("Standard Corporate Policy")
                    .maxBudget(new BigDecimal("50000.00"))
                    .allowedClass("economy")
                    .description("Default policy: max budget ₹50,000, economy class only.")
                    .build());
            log.info("✅ Default travel policy seeded.");
        }
    }
}
