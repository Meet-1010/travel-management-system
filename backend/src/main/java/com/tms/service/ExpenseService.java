package com.tms.service;

import com.tms.dto.request.ExpenseRequest;
import com.tms.dto.response.ExpenseResponse;
import com.tms.exception.BadRequestException;
import com.tms.exception.ResourceNotFoundException;
import com.tms.model.*;
import com.tms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ExpenseService
 *
 * Manages expense items linked to approved travel requests.
 * Returns ExpenseResponse DTOs (never raw entities) to avoid ByteBuddyInterceptor errors.
 */
@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TravelRequestRepository requestRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /**
     * Add an expense to a travel request.
     *
     * Policy: Expenses can only be added to APPROVED requests.
     * Self-ownership: Users can only add expenses to their own requests.
     */
    @Transactional
    public ExpenseResponse addExpense(ExpenseRequest dto, Long userId) {
        TravelRequest request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Travel request not found: #" + dto.getRequestId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getStatus() != TravelRequest.Status.APPROVED) {
            throw new BadRequestException(
                "Expenses can only be added to APPROVED requests. Current status: " + request.getStatus());
        }

        // Only the request owner can add expenses
        if (!request.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only add expenses to your own travel requests");
        }

        Expense expense = new Expense();
        expense.setTravelRequest(request);
        expense.setCategory(dto.getCategory());
        expense.setAmount(dto.getAmount());
        expense.setDescription(dto.getDescription());
        expense.setExpenseDate(LocalDate.now()); // Fallback if missing
        expense.setReceiptUrl(dto.getReceiptUrl());
        expense.setReimbursed(false);

        Expense saved = expenseRepository.save(expense);

        // Audit log
        auditLogRepository.save(AuditLog.builder()
                .action("Expense added: " + dto.getCategory() + " ₹" + dto.getAmount()
                        + " for request #" + dto.getRequestId())
                .entity("expense")
                .entityId(saved.getId())
                .user(user)
                .build());

        // Map to DTO inside the transaction — request is still in scope (no proxy issue)
        return ExpenseResponse.from(saved);
    }

    public List<ExpenseResponse> getExpensesByRequest(Long requestId) {
        return expenseRepository.findByTravelRequestId(requestId)
                .stream()
                .map(ExpenseResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseResponse markAsReimbursed(Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        expense.setReimbursed(true);
        Expense saved = expenseRepository.save(expense);

        // Audit log
        AuditLog log = AuditLog.builder()
                .action("Expense marked as reimbursed: ₹" + saved.getAmount())
                .entity("expense")
                .entityId(saved.getId())
                .user(saved.getTravelRequest().getUser())
                .build();
        auditLogRepository.save(log);

        return ExpenseResponse.from(saved);
    }

    public BigDecimal getTotalExpenses(Long requestId) {
        BigDecimal total = expenseRepository.sumAmountByRequestId(requestId);
        return total != null ? total : BigDecimal.ZERO;
    }
}
