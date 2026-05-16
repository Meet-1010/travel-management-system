package com.tms.service;

import com.tms.dto.request.LoginRequest;
import com.tms.dto.request.RegisterRequest;
import com.tms.dto.response.AuthResponse;
import com.tms.exception.BadRequestException;
import com.tms.exception.ResourceNotFoundException;
import com.tms.model.AuditLog;
import com.tms.model.User;
import com.tms.repository.AuditLogRepository;
import com.tms.repository.UserRepository;
import com.tms.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * AuthService
 *
 * Handles user registration and login.
 *
 * LOGIN FLOW:
 * 1. Client sends {email, password}
 * 2. AuthenticationManager validates credentials against DB
 * 3. If valid, load UserDetails, generate JWT
 * 4. Return JWT + user info to client
 *
 * The client stores the JWT (usually in localStorage) and sends it
 * in every subsequent request as: Authorization: Bearer <token>
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    /**
     * Register a new user (Admin only operation).
     * Password is hashed before storage.
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))  // BCrypt hash
                .role(request.getRole())
                .department(request.getDepartment())
                .build();

        userRepository.save(user);

        // Log the action
        auditLogRepository.save(AuditLog.builder()
                .action("New user registered: " + user.getEmail() + " with role " + user.getRole())
                .entity("user")
                .entityId(user.getId())
                .user(user)
                .build());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }

    /**
     * Login existing user.
     * AuthenticationManager throws BadCredentialsException if email/password wrong.
     */
    public AuthResponse login(LoginRequest request) {
        // This validates credentials; throws exception if invalid
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        // Log login action
        auditLogRepository.save(AuditLog.builder()
                .action("User logged in: " + user.getEmail())
                .entity("user")
                .entityId(user.getId())
                .user(user)
                .build());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }
}
