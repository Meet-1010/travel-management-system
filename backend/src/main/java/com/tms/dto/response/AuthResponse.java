package com.tms.dto.response;

import lombok.*;

/**
 * AuthResponse DTO
 * The response returned to the client after successful login.
 * Contains the JWT token (client stores this and sends with each request)
 * and basic user info.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private String role;
    private Long userId;
}
