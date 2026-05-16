package com.tms.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ItineraryRequest {
    private Long requestId;
    private String type; // FLIGHT, HOTEL, CAB, etc.
    private String description;
    private LocalDate travelDate;
}
