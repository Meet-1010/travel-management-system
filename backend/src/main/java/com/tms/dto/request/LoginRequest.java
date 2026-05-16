package com.tms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * LoginRequest DTO
 *
 * DTO = Data Transfer Object.
 * Why DTOs? They separate what the API receives (request) from the actual entity.
 * This prevents clients from accidentally overwriting fields like id, createdAt, etc.
 *
 * @NotBlank / @Email are Bean Validation annotations.
 * Spring auto-validates these when you use @Valid in controllers.
 */
@Data
public class LoginRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
