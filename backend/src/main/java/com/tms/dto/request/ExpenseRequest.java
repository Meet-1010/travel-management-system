package com.tms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

/**
 * ExpenseRequest DTO
 * Used to add an expense item to a travel request.
 */
@Data
public class ExpenseRequest {

    @NotNull(message = "Request ID is required")
    private Long requestId;

    @NotBlank(message = "Category is required")
    private String category;  // food, travel, stay, misc

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    private String description;

    private String receiptUrl;
}
