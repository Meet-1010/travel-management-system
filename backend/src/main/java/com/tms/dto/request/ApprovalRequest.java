package com.tms.dto.request;

import com.tms.model.Approval;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * ApprovalRequest DTO
 * Used by Manager (level 1) or Finance (level 2) to approve/reject a travel request.
 */
@Data
public class ApprovalRequest {

    @NotNull(message = "Request ID is required")
    private Long requestId;

    @NotNull(message = "Status is required")
    private Approval.Status status;  // APPROVED or REJECTED

    private String comments;
}
