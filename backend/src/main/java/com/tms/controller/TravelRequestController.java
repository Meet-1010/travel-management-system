package com.tms.controller;

import com.tms.dto.request.TravelRequestDTO;
import com.tms.dto.response.ApiResponse;
import com.tms.dto.response.TravelRequestResponse;
import com.tms.service.TravelRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.tms.repository.UserRepository;
import java.util.List;

/**
 * TravelRequestController - Handles /api/requests/** endpoints
 *
 * @AuthenticationPrincipal UserDetails - Spring injects the currently logged-in user.
 * We use their email to find their user ID from DB for ownership validation.
 *
 * Role-based access:
 *   EMPLOYEE  - create, view own, submit own
 *   MANAGER   - view pending (SUBMITTED) requests
 *   FINANCE   - view manager-approved requests
 *   ADMIN     - view all
 */
@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class TravelRequestController {

    private final TravelRequestService travelRequestService;
    private final UserRepository userRepository;

    // POST /api/requests - Create a travel request (DRAFT)
    // MANAGER can create their own requests too
    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TravelRequestResponse>> create(
            @Valid @RequestBody TravelRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = getUserId(userDetails);
        TravelRequestResponse response = travelRequestService.createRequest(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Travel request created", response));
    }

    // GET /api/requests/{id} - Get a request by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TravelRequestResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Request fetched", travelRequestService.getRequestById(id)));
    }

    // GET /api/requests/my - Get current user's own requests
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<TravelRequestResponse>>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(
                ApiResponse.success("Requests fetched", travelRequestService.getRequestsByUser(userId)));
    }

    // POST /api/requests/{id}/submit - Submit a DRAFT request
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TravelRequestResponse>> submit(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(
                ApiResponse.success("Request submitted for approval",
                        travelRequestService.submitRequest(id, userId)));
    }

    // GET /api/requests/pending/manager - Manager views SUBMITTED requests
    @GetMapping("/pending/manager")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<TravelRequestResponse>>> getPendingForManager() {
        return ResponseEntity.ok(
                ApiResponse.success("Pending requests for manager", travelRequestService.getPendingForManager()));
    }

    // GET /api/requests/pending/finance - Finance views MANAGER_APPROVED requests
    @GetMapping("/pending/finance")
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<TravelRequestResponse>>> getPendingForFinance() {
        return ResponseEntity.ok(
                ApiResponse.success("Pending requests for finance", travelRequestService.getPendingForFinance()));
    }

    // GET /api/requests/all - Admin views everything
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TravelRequestResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.success("All requests", travelRequestService.getAllRequests()));
    }

    // Helper: Extract user ID from security context
    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"))
                .getId();
    }
}
