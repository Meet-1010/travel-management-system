package com.tms.service;

import com.tms.dto.request.ItineraryRequest;
import com.tms.dto.response.ItineraryResponse;
import com.tms.exception.BadRequestException;
import com.tms.exception.ResourceNotFoundException;
import com.tms.model.Itinerary;
import com.tms.model.TravelRequest;
import com.tms.model.User;
import com.tms.repository.ItineraryRepository;
import com.tms.repository.TravelRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final TravelRequestRepository requestRepository;
    private final AuthService authService;

    public ItineraryResponse addItinerary(ItineraryRequest requestDto) {
        User user = authService.getCurrentUser();
        TravelRequest request = requestRepository.findById(requestDto.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Travel Request not found"));

        if (!request.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("You can only add itineraries to your own requests");
        }

        Itinerary itinerary = Itinerary.builder()
                .travelRequest(request)
                .type(requestDto.getType())
                .description(requestDto.getDescription())
                .travelDate(requestDto.getTravelDate())
                .build();

        Itinerary saved = itineraryRepository.save(itinerary);
        return ItineraryResponse.from(saved);
    }

    public List<ItineraryResponse> getItinerariesByRequest(Long requestId) {
        return itineraryRepository.findByTravelRequestIdOrderByTravelDateAsc(requestId)
                .stream()
                .map(ItineraryResponse::from)
                .collect(Collectors.toList());
    }
    
    public void deleteItinerary(Long itineraryId) {
        itineraryRepository.deleteById(itineraryId);
    }
}
