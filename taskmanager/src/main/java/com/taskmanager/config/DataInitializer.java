package com.taskmanager.config;

import com.taskmanager.module.auth.entity.RoleName;
import com.taskmanager.module.auth.entity.User;
import com.taskmanager.module.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@taskmanager.com")) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@taskmanager.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(RoleName.ADMIN);
            userRepository.save(admin);
            System.out.println("✅ Admin user seeded: admin@taskmanager.com / admin123");
        }
    }
}