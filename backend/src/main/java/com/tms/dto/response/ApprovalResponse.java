package com.tms.dto.response;

import com.tms.model.Approval;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * ApprovalResponse DTO
 *
 * WHY a DTO instead of the Approval entity?
 * The Approval entity has @ManyToOne(FetchType.LAZY) to TravelRequest and User.
 * Jackson can't serialize Hibernate's ByteBuddy proxies on these unloaded relations,
 * causing: "Type definition error: ByteBuddyInterceptor"
 *
 * This DTO contains only flat, serializable fields — no entity references.
 */
@Data
@Builder
public class ApprovalResponse {
    private Long id;
    private Long requestId;
    private String destination;     // Denormalized for frontend convenience
    private Long approverId;
    private String approverName;
    private String approverRole;
    private Integer level;          // 1 = Manager, 2 = Finance
    private String status;          // APPROVED / REJECTED
    private String comments;
    private LocalDateTime updatedAt;

    public static ApprovalResponse from(Approval approval) {
        return ApprovalResponse.builder()
                .id(approval.getId())
                .requestId(approval.getTravelRequest().getId())
                .destination(approval.getTravelRequest().getDestination())
                .approverId(approval.getApprover().getId())
                .approverName(approval.getApprover().getName())
                .approverRole(approval.getApprover().getRole().name())
                .level(approval.getLevel())
                .status(approval.getStatus().name())
                .comments(approval.getComments())
                .updatedAt(approval.getUpdatedAt())
                .build();
    }
}
