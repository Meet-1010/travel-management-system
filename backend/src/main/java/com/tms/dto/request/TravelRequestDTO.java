package com.tms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * TravelRequestDTO
 * Payload for creating or updating a travel request.
 *
 * WHY removed @FutureOrPresent / @Future?
 * These annotations validate against the server's timezone at exact validation time,
 * causing failures when users pick "today". Simple @NotNull is sufficient;
 * logical date order is validated in the service layer.
 */
@Data
public class TravelRequestDTO {

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @DecimalMin(value = "0.0", inclusive = false, message = "Budget must be positive")
    private BigDecimal budget;
}
