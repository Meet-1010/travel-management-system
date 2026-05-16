package com.tms.controller;

import com.tms.dto.request.ApprovalRequest;
import com.tms.dto.response.ApiResponse;
import com.tms.dto.response.ApprovalResponse;
import com.tms.model.Approval;
import com.tms.repository.UserRepository;
import com.tms.service.ApprovalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * ApprovalController — POST /api/approve
 *
 * Returns ApprovalResponse DTO instead of the raw Approval entity.
 * Raw entities with @ManyToOne(LAZY) cause Jackson ByteBuddyInterceptor errors.
 */
@RestController
@RequestMapping("/api/approve")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<ApiResponse<ApprovalResponse>> approve(
            @Valid @RequestBody ApprovalRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long approverId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"))
                .getId();

        // Service uses DB role — no authority string fragility
        Approval approval = approvalService.processApproval(request, approverId);

        // Map to DTO — safe flat structure with no Hibernate proxies
        ApprovalResponse dto = ApprovalResponse.from(approval);

        String verb = approval.getStatus() == Approval.Status.APPROVED ? "approved" : "rejected";
        return ResponseEntity.ok(ApiResponse.success("Request " + verb + " successfully", dto));
    }
}
