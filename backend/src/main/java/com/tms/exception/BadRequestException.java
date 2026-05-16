package com.tms.exception;

/**
 * BadRequestException
 * Thrown for business logic violations.
 * Example: submitting an already-submitted request, budget exceeding policy, etc.
 * Maps to HTTP 400 Bad Request.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
