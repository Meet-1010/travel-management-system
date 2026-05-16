package com.tms.dto.response;

import lombok.*;

/**
 * ApiResponse - Generic API Response Wrapper
 *
 * Wraps every API response in a consistent format:
 * { "success": true, "message": "...", "data": {...} }
 *
 * Why? - Frontend can always check success/message regardless of endpoint.
 * Uses Java Generics (<T>) so data can be any type.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}
