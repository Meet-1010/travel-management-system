package com.tms.repository;

import com.tms.model.TravelRequest;
import com.tms.model.TravelRequest.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * TravelRequestRepository
 *
 * Custom JPQL queries using @Query annotation.
 * JPQL uses class/field names (Java), not table/column names (SQL).
 * Example: "tr.user.id" not "user_id"
 */
@Repository
public interface TravelRequestRepository extends JpaRepository<TravelRequest, Long> {

    // Find all requests by a single user
    List<TravelRequest> findByUserId(Long userId);

    // Find all requests with a specific status
    List<TravelRequest> findByStatus(Status status);

    // Find requests by user and status
    List<TravelRequest> findByUserIdAndStatus(Long userId, Status status);

    // Manager: find all submitted requests (pending manager approval)
    List<TravelRequest> findByStatusIn(List<Status> statuses);

    // Reporting: find all requests for employees in a department
    @Query("SELECT tr FROM TravelRequest tr WHERE tr.user.department = :dept")
    List<TravelRequest> findByDepartment(@Param("dept") String department);

    // Count requests by status for dashboard
    long countByStatus(Status status);
}
