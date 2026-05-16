package com.tms.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * User Entity
 *
 * Represents a system user. Each user has one of four roles:
 * ADMIN, EMPLOYEE, MANAGER, FINANCE.
 *
 * Why @Entity? - Tells JPA/Hibernate this class maps to a DB table.
 * Why Lombok? - @Data auto-generates getters, setters, toString, equals.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;  // Always stored as BCrypt hash

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(length = 100)
    private String department;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Role enum - defines all possible user roles in the system.
     * ADMIN     - Full system access
     * EMPLOYEE  - Can create/submit travel requests
     * MANAGER   - Level 1 approver
     * FINANCE   - Level 2 approver + reimbursement
     */
    public enum Role {
        ADMIN, EMPLOYEE, MANAGER, FINANCE
    }
}
