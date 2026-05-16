package com.tms.service;

import com.tms.dto.response.TravelRequestResponse;
import com.tms.exception.ResourceNotFoundException;
import com.tms.model.TravelRequest;
import com.tms.repository.AuditLogRepository;
import com.tms.repository.TravelRequestRepository;
import com.tms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

/**
 * ReportingService
 *
 * Generates analytics and reports for the Admin/Finance dashboard.
 * Uses JPA queries and Java Streams to aggregate data.
 */
@Service
@RequiredArgsConstructor
public class ReportingService {

    private final TravelRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    /**
     * Dashboard stats: request counts by status
     */
    public Map<String, Long> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", requestRepository.count());
        stats.put("draft", requestRepository.countByStatus(TravelRequest.Status.DRAFT));
        stats.put("submitted", requestRepository.countByStatus(TravelRequest.Status.SUBMITTED));
        stats.put("approved", requestRepository.countByStatus(TravelRequest.Status.APPROVED));
        stats.put("rejected", requestRepository.countByStatus(TravelRequest.Status.REJECTED));
        return stats;
    }

    /**
     * Department-wise total spend aggregation
     */
    public Map<String, BigDecimal> getDepartmentWiseSpend() {
        List<TravelRequest> allApproved = requestRepository.findByStatus(TravelRequest.Status.APPROVED);
        return allApproved.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getUser().getDepartment() != null ? r.getUser().getDepartment() : "Unknown",
                        Collectors.reducing(BigDecimal.ZERO,
                                r -> r.getBudget() != null ? r.getBudget() : BigDecimal.ZERO,
                                BigDecimal::add)
                ));
    }

    /**
     * Employee travel history
     */
    public List<TravelRequest> getEmployeeHistory(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return requestRepository.findByUserId(userId);
    }

    /**
     * Full audit log for Admin
     */
    @Transactional(readOnly = true)
    public List<?> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
