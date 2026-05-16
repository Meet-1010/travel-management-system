package com.tms.service;

import com.tms.dto.request.TravelRequestDTO;
import com.tms.dto.response.TravelRequestResponse;
import com.tms.exception.BadRequestException;
import com.tms.exception.ResourceNotFoundException;
import com.tms.model.*;
import com.tms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * TravelRequestService
 *
 * Workflow:
 *   EMPLOYEE submits: DRAFT → SUBMITTED → (Manager approval) → MANAGER_APPROVED → (Finance approval) → APPROVED
 *   MANAGER  submits: DRAFT → SUBMITTED → auto-advances to MANAGER_APPROVED → (Finance approval) → APPROVED
 *       Reason: A Manager is already at the approval level, so their own requests skip
 *       Level 1 and go directly to the Finance queue.
 *
 * @Transactional ensures all DB operations succeed or all roll back together.
 */
@Service
@RequiredArgsConstructor
public class TravelRequestService {

    private final TravelRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final AuditLogRepository auditLogRepository;
    private final PolicyRepository policyRepository;

    /**
     * Create a travel request saved as DRAFT.
     * The employee can edit this anytime before submitting.
     */
    @Transactional
    public TravelRequestResponse createRequest(TravelRequestDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Validate dates
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        TravelRequest request = TravelRequest.builder()
                .user(user)
                .destination(dto.getDestination())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .purpose(dto.getPurpose())
                .budget(dto.getBudget())
                .status(TravelRequest.Status.DRAFT)
                .build();

        requestRepository.save(request);

        // Audit log
        logAction("Travel request created (DRAFT) for destination: " + dto.getDestination(),
                "travel_request", request.getId(), user);

        return mapToResponse(request);
    }

    /**
     * Submit a DRAFT request for approval.
     *
     * Smart routing:
     *   - EMPLOYEE submits → SUBMITTED (waits for manager approval)
     *   - MANAGER submits  → MANAGER_APPROVED (skips manager level, goes to finance queue)
     *
     * Policy check: if budget exceeds max policy budget, flag in audit log.
     */
    @Transactional
    public TravelRequestResponse submitRequest(Long requestId, Long userId) {
        TravelRequest request = getRequestOrThrow(requestId);

        // Only the owner can submit their own request
        if (!request.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only submit your own travel requests");
        }

        if (request.getStatus() != TravelRequest.Status.DRAFT) {
            throw new BadRequestException("Only DRAFT requests can be submitted. Current status: " + request.getStatus());
        }

        // Policy enforcement: flag budget violations (still allows submission)
        policyRepository.findAll().forEach(policy -> {
            if (policy.getMaxBudget() != null && request.getBudget() != null) {
                if (request.getBudget().compareTo(policy.getMaxBudget()) > 0) {
                    logAction("POLICY VIOLATION: Request #" + requestId + " budget ₹" + request.getBudget()
                            + " exceeds policy limit ₹" + policy.getMaxBudget(),
                            "travel_request", requestId, request.getUser());
                }
            }
        });

        User.Role submitterRole = request.getUser().getRole();

        if (submitterRole == User.Role.MANAGER || submitterRole == User.Role.ADMIN) {
            // Manager/Admin requests skip Level 1 — go directly to Finance queue
            request.setStatus(TravelRequest.Status.MANAGER_APPROVED);
            logAction("Travel request #" + requestId + " submitted by " + submitterRole
                    + " — auto-advanced to MANAGER_APPROVED (Finance queue)",
                    "travel_request", requestId, request.getUser());
        } else {
            // Employee requests go to Manager queue first
            request.setStatus(TravelRequest.Status.SUBMITTED);
            logAction("Travel request #" + requestId + " submitted for Manager approval",
                    "travel_request", requestId, request.getUser());
        }

        requestRepository.save(request);
        return mapToResponse(request);
    }

    /** Get a single request by ID */
    public TravelRequestResponse getRequestById(Long id) {
        return mapToResponse(getRequestOrThrow(id));
    }

    /** Employee: get my own requests */
    public List<TravelRequestResponse> getRequestsByUser(Long userId) {
        return requestRepository.findByUserId(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /** Manager: get all SUBMITTED requests (pending their approval) */
    public List<TravelRequestResponse> getPendingForManager() {
        return requestRepository.findByStatus(TravelRequest.Status.SUBMITTED)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /** Finance: get all MANAGER_APPROVED requests (pending finance approval) */
    public List<TravelRequestResponse> getPendingForFinance() {
        return requestRepository.findByStatus(TravelRequest.Status.MANAGER_APPROVED)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /** Admin: get all requests */
    public List<TravelRequestResponse> getAllRequests() {
        return requestRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /** Reporting: get by department */
    public List<TravelRequestResponse> getRequestsByDepartment(String department) {
        return requestRepository.findByDepartment(department)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // --- Helper methods ---

    private TravelRequest getRequestOrThrow(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Travel request not found with id: " + id));
    }

    private TravelRequestResponse mapToResponse(TravelRequest r) {
        BigDecimal totalExpenses = expenseRepository.sumAmountByRequestId(r.getId());
        return TravelRequestResponse.builder()
                .id(r.getId())
                .destination(r.getDestination())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .purpose(r.getPurpose())
                .budget(r.getBudget())
                .status(r.getStatus())
                .employeeName(r.getUser().getName())
                .employeeEmail(r.getUser().getEmail())
                .department(r.getUser().getDepartment())
                .createdAt(r.getCreatedAt())
                .totalExpenses(totalExpenses)
                .build();
    }

    private void logAction(String action, String entity, Long entityId, User user) {
        auditLogRepository.save(AuditLog.builder()
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .user(user)
                .build());
    }
}
