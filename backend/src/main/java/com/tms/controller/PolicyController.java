package com.tms.controller;

import com.tms.dto.response.ApiResponse;
import com.tms.model.Policy;
import com.tms.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * PolicyController
 * Admin management of travel policies.
 */
@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyRepository policyRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FINANCE', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<Policy>>> getAllPolicies() {
        return ResponseEntity.ok(ApiResponse.success("Policies retrieved", policyRepository.findAll()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Policy>> createPolicy(@RequestBody Policy policy) {
        Policy saved = policyRepository.save(policy);
        return ResponseEntity.ok(ApiResponse.success("Policy created successfully", saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(@PathVariable Long id) {
        policyRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Policy deleted successfully", null));
    }
}
