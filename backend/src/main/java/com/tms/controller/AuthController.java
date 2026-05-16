package com.tms.controller;

import com.tms.dto.request.LoginRequest;
import com.tms.dto.request.RegisterRequest;
import com.tms.dto.response.ApiResponse;
import com.tms.dto.response.AuthResponse;
import com.tms.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AuthController - Handles /api/auth/** endpoints
 *
 * @RestController = @Controller + @ResponseBody (returns JSON automatically)
 * @RequestMapping = base URL path for all endpoints in this class
 * @RequiredArgsConstructor = Lombok injects dependencies via constructor
 *
 * Public endpoints (no JWT needed):
 *   POST /api/auth/login    - authenticate user, returns JWT
 *   POST /api/auth/register - create new user (Admin only in production)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login
     * Request body: { "email": "...", "password": "..." }
     * Response: { token, email, role, userId, ... }
     *
     * @Valid triggers Bean Validation on LoginRequest fields.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * POST /api/auth/register
     * Protected: Only ADMIN can register new users.
     * @PreAuthorize checks the role in SecurityContext before entering the method.
     */
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    /**
     * GET /api/auth/users
     * Admin can list all users in the system.
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<?>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched", authService.getAllUsers()));
    }
}
