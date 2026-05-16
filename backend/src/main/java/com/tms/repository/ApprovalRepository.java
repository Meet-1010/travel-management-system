package com.tms.repository;

import com.tms.model.Approval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * ApprovalRepository
 *
 * Used to find approval records for the multi-level workflow:
 * Level 1 = Manager, Level 2 = Finance
 */
@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {

    List<Approval> findByTravelRequestId(Long requestId);
    List<Approval> findByApproverId(Long approverId);

    // Find a specific level approval for a request
    Optional<Approval> findByTravelRequestIdAndLevel(Long requestId, Integer level);

    // Find all pending approvals for an approver
    List<Approval> findByApproverIdAndStatus(Long approverId, Approval.Status status);
}
