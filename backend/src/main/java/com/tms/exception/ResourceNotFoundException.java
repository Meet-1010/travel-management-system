package com.tms.exception;

/**
 * ResourceNotFoundException
 * Thrown when a requested entity is not found in the database.
 * Maps to HTTP 404 Not Found.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
