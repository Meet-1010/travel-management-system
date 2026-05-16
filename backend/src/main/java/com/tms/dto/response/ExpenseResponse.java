package com.tms.dto.response;

import com.tms.model.Expense;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ExpenseResponse DTO
 *
 * Same issue as ApprovalResponse: Expense has @ManyToOne(LAZY) to TravelRequest.
 * Returning Expense entity directly causes ByteBuddyInterceptor error.
 * This DTO is flat and safe for Jackson serialization.
 */
@Data
@Builder
public class ExpenseResponse {
    private Long id;
    private Long requestId;
    private String category;
    private BigDecimal amount;
    private String description;
    private LocalDate expenseDate;
    private String receiptUrl;
    private boolean isReimbursed;
    private LocalDateTime createdAt;

    public static ExpenseResponse from(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .requestId(expense.getTravelRequest().getId())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .receiptUrl(expense.getReceiptUrl())
                .isReimbursed(expense.isReimbursed())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
