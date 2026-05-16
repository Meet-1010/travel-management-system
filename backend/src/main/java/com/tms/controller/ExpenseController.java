package com.tms.controller;

import com.tms.dto.request.ExpenseRequest;
import com.tms.dto.response.ApiResponse;
import com.tms.dto.response.ExpenseResponse;
import com.tms.repository.UserRepository;
import com.tms.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * ExpenseController — /api/expenses
 *
 * Returns ExpenseResponse DTO instead of raw Expense entities.
 * Raw Expense entity has @ManyToOne(LAZY) to TravelRequest which causes
 * ByteBuddyInterceptor serialization errors when Jackson tries to serialize it.
 */
@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserRepository userRepository;

    // POST /api/expenses — Add expense (EMPLOYEE, MANAGER, ADMIN can add expenses)
    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExpenseResponse>> addExpense(
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        ExpenseResponse expense = expenseService.addExpense(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense added successfully", expense));
    }

    // GET /api/expenses/{requestId} — List all expenses for a request
    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getExpenses(@PathVariable Long requestId) {
        return ResponseEntity.ok(
                ApiResponse.success("Expenses fetched", expenseService.getExpensesByRequest(requestId)));
    }

    // GET /api/expenses/{requestId}/total — Sum of all expenses for a request
    @GetMapping("/{requestId}/total")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<ApiResponse<BigDecimal>> getTotal(@PathVariable Long requestId) {
        BigDecimal total = expenseService.getTotalExpenses(requestId);
        return ResponseEntity.ok(ApiResponse.success("Total expenses retrieved", total));
    }

    @PutMapping("/{expenseId}/reimburse")
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExpenseResponse>> markAsReimbursed(@PathVariable Long expenseId) {
        ExpenseResponse expense = expenseService.markAsReimbursed(expenseId);
        return ResponseEntity.ok(ApiResponse.success("Expense marked as reimbursed", expense));
    }
}
