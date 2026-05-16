package com.tms.dto.response;

import com.tms.model.TravelRequest;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * TravelRequestResponse DTO
 * What we send back to the client for a travel request.
 * Flattened user info (just name, not the full User object) for convenience.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TravelRequestResponse {
    private Long id;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private String purpose;
    private BigDecimal budget;
    private TravelRequest.Status status;
    private String employeeName;
    private String employeeEmail;
    private String department;
    private LocalDateTime createdAt;
    private BigDecimal totalExpenses;  // Aggregated from expenses table
}
