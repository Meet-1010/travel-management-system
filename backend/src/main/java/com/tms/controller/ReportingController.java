package com.tms.controller;

import com.tms.dto.response.ApiResponse;
import com.tms.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.tms.model.User;
import com.tms.repository.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * ReportingController - Handles /api/reports/** endpoints
 *
 * Admin-only reporting and analytics endpoints.
 *
 * GET /api/reports/dashboard          - Stats summary
 * GET /api/reports/department-spend   - Spend by department
 * GET /api/reports/audit-logs         - Full audit trail
 * GET /api/reports/employee/{id}      - Travel history of an employee
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportingController {

    private final ReportingService reportingService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getDashboard(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(
                ApiResponse.success("Dashboard stats", reportingService.getDashboardStats(user)));
    }

    @GetMapping("/department-spend")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getDeptSpend() {
        return ResponseEntity.ok(
                ApiResponse.success("Department spend", reportingService.getDepartmentWiseSpend()));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<?>>> getAuditLogs() {
        return ResponseEntity.ok(
                ApiResponse.success("Audit logs", reportingService.getAuditLogs()));
    }

    @GetMapping("/employee/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<?>>> getEmployeeHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success("Employee history", reportingService.getEmployeeHistory(userId)));
    }
}
