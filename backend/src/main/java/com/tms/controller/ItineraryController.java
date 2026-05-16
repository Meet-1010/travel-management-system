package com.tms.controller;

import com.tms.dto.request.ItineraryRequest;
import com.tms.dto.response.ApiResponse;
import com.tms.dto.response.ItineraryResponse;
import com.tms.service.ItineraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
@RequiredArgsConstructor
public class ItineraryController {

    private final ItineraryService itineraryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<ApiResponse<ItineraryResponse>> addItinerary(@RequestBody ItineraryRequest request) {
        ItineraryResponse saved = itineraryService.addItinerary(request);
        return ResponseEntity.ok(ApiResponse.success("Itinerary added successfully", saved));
    }

    @GetMapping("/{requestId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'FINANCE', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ItineraryResponse>>> getItineraries(@PathVariable Long requestId) {
        List<ItineraryResponse> itineraries = itineraryService.getItinerariesByRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Itineraries retrieved", itineraries));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteItinerary(@PathVariable Long id) {
        itineraryService.deleteItinerary(id);
        return ResponseEntity.ok(ApiResponse.success("Itinerary deleted", null));
    }
}
