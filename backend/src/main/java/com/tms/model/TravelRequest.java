package com.tms.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * TravelRequest Entity
 *
 * Central entity of the system. Tracks the full lifecycle of a travel request:
 * DRAFT → SUBMITTED → MANAGER_APPROVED → FINANCE_APPROVED → APPROVED/REJECTED
 *
 * @OneToMany(mappedBy="request") - means Expense and Approval have FK to this entity.
 * CascadeType.ALL means deleting a request deletes its expenses/approvals too.
 */
@Entity
@Table(name = "travel_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * @ManyToOne - Many travel requests can belong to one user
     * @JoinColumn - specifies the foreign key column name in DB
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String destination;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String purpose;

    @Column(precision = 10, scale = 2)
    private BigDecimal budget;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.DRAFT;

    @OneToMany(mappedBy = "travelRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Expense> expenses;

    @OneToMany(mappedBy = "travelRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Approval> approvals;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Status enum represents the approval workflow stages.
     * DRAFT            - Employee saved but not submitted
     * SUBMITTED        - Employee submitted for approval
     * MANAGER_APPROVED - Manager approved, waiting for Finance
     * FINANCE_APPROVED - Finance approved (same as APPROVED)
     * APPROVED         - Fully approved
     * REJECTED         - Rejected at any stage
     */
    public enum Status {
        DRAFT, SUBMITTED, MANAGER_APPROVED, FINANCE_APPROVED, APPROVED, REJECTED
    }
}
