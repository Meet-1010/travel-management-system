package com.tms.service;

import com.tms.dto.request.ApprovalRequest;
import com.tms.exception.BadRequestException;
import com.tms.exception.ResourceNotFoundException;
import com.tms.model.*;
import com.tms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * ApprovalService - Multi-Level Approval Workflow Engine
 *
 * WORKFLOW:
 *   Employee Submits    → Status: SUBMITTED
 *   Manager Approves    → Status: MANAGER_APPROVED  (Level 1)
 *   Finance Approves    → Status: APPROVED           (Level 2)
 *
 *   Manager submits own request → Status skips to MANAGER_APPROVED automatically
 *       (handled in TravelRequestService.submitRequest)
 *
 * FIX: Previously used Spring Security authority strings ("ROLE_FINANCE") which can
 * be inconsistent. Now uses the approver's actual DB role (User.Role enum) for safety.
 */
@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final TravelRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    /**
     * Process an approval/rejection by a Manager or Finance user.
     *
     * Workflow rules:
     *  - MANAGER: can approve/reject SUBMITTED requests → moves to MANAGER_APPROVED
     *  - FINANCE:  can approve/reject MANAGER_APPROVED requests → moves to APPROVED
     *  - ADMIN:    can act as either level based on the current request status
     */
    @Transactional
    public Approval processApproval(ApprovalRequest dto, Long approverId) {

        TravelRequest request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Travel request not found with id: " + dto.getRequestId()));

        // Load approver from DB — use their actual role, not header/token strings
        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new ResourceNotFoundException("Approver not found"));

        User.Role approverRole = approver.getRole();
        int level;
        TravelRequest.Status requiredStatus;
        TravelRequest.Status approvedNextStatus;

        switch (approverRole) {
            case MANAGER -> {
                level = 1;
                requiredStatus = TravelRequest.Status.SUBMITTED;
                approvedNextStatus = TravelRequest.Status.MANAGER_APPROVED;
            }
            case FINANCE -> {
                level = 2;
                requiredStatus = TravelRequest.Status.MANAGER_APPROVED;
                approvedNextStatus = TravelRequest.Status.APPROVED;
            }
            case ADMIN -> {
                // Admin can act at whichever level is needed
                if (request.getStatus() == TravelRequest.Status.SUBMITTED) {
                    level = 1;
                    requiredStatus = TravelRequest.Status.SUBMITTED;
                    approvedNextStatus = TravelRequest.Status.MANAGER_APPROVED;
                } else if (request.getStatus() == TravelRequest.Status.MANAGER_APPROVED) {
                    level = 2;
                    requiredStatus = TravelRequest.Status.MANAGER_APPROVED;
                    approvedNextStatus = TravelRequest.Status.APPROVED;
                } else {
                    throw new BadRequestException(
                            "Request is not in an approvable state. Current status: " + request.getStatus());
                }
            }
            default -> throw new BadRequestException(
                    "Only MANAGER, FINANCE, or ADMIN users can perform approvals. Your role: " + approverRole);
        }

        // Validate the request is in the correct state for this approval level
        if (request.getStatus() != requiredStatus) {
            throw new BadRequestException(
                    "Cannot approve at this level. Request status is [" + request.getStatus() + "]" +
                    " but expected [" + requiredStatus + "] for a " + approverRole + " approval.");
        }

        // Prevent self-approval: the approver cannot approve their own request
        if (request.getUser().getId().equals(approverId)) {
            throw new BadRequestException("You cannot approve your own travel request.");
        }

        // Create the approval record
        Approval approval = Approval.builder()
                .travelRequest(request)
                .approver(approver)
                .level(level)
                .status(dto.getStatus())
                .comments(dto.getComments())
                .build();

        approvalRepository.save(approval);

        // Update travel request status
        if (dto.getStatus() == Approval.Status.APPROVED) {
            request.setStatus(approvedNextStatus);
        } else {
            request.setStatus(TravelRequest.Status.REJECTED);
        }
        requestRepository.save(request);

        // Audit log
        String action = (dto.getStatus() == Approval.Status.APPROVED ? "✅ APPROVED" : "❌ REJECTED");
        auditLogRepository.save(AuditLog.builder()
                .action("Request #" + request.getId() + " " + action
                        + " by " + approver.getName() + " [" + approverRole + ", Level " + level + "]"
                        + (dto.getComments() != null && !dto.getComments().isBlank()
                                ? ". Comment: " + dto.getComments() : ""))
                .entity("travel_request")
                .entityId(request.getId())
                .user(approver)
                .build());

        // IMPORTANT: Force-initialize the lazy-loaded relations on the returned Approval object.
        // The @Transactional boundary hasn't closed yet, so Hibernate can still load them.
        // If we return the entity WITHOUT this, ApprovalResponse.from() will access an
        // uninitialized proxy AFTER the session closes → ByteBuddyInterceptor error.
        approval.setTravelRequest(request);    // already loaded above
        approval.setApprover(approver);        // already loaded above

        return approval;

    }
}
