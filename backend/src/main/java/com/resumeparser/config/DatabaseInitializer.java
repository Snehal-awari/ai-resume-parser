package com.resumeparser.config;

import com.resumeparser.entity.Role;
import com.resumeparser.entity.User;
import com.resumeparser.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            logger.info("Initializing database with default users...");

            User admin = User.builder()
                    .username("admin")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("admin"))
                    .role(Role.ADMIN)
                    .build();

            User hr = User.builder()
                    .username("hr")
                    .email("hr@example.com")
                    .password(passwordEncoder.encode("hr"))
                    .role(Role.HR)
                    .build();

            userRepository.save(admin);
            userRepository.save(hr);

            logger.info("Default users created: username 'admin' (password: admin) and username 'hr' (password: hr)");
        }
    }
}
