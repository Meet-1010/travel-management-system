package com.tms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * TravelManagementSystemApplication
 *
 * Entry point for the Spring Boot backend.
 * This annotation does three things automatically:
 *  - @Configuration      : marks this as a config source
 *  - @EnableAutoConfiguration : auto-configures Spring beans
 *  - @ComponentScan      : scans com.tms for all @Components
 */
@SpringBootApplication
public class TravelManagementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(TravelManagementSystemApplication.class, args);
        System.out.println("✅ Travel Management System Backend Started on http://localhost:8080");
    }
}
