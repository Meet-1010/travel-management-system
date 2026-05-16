package com.tms.dto.response;

import com.tms.model.Itinerary;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ItineraryResponse {
    private Long id;
    private Long requestId;
    private String type;
    private String description;
    private LocalDate travelDate;
    private LocalDateTime createdAt;

    public static ItineraryResponse from(Itinerary itinerary) {
        return ItineraryResponse.builder()
                .id(itinerary.getId())
                .requestId(itinerary.getTravelRequest().getId())
                .type(itinerary.getType())
                .description(itinerary.getDescription())
                .travelDate(itinerary.getTravelDate())
                .createdAt(itinerary.getCreatedAt())
                .build();
    }
}
