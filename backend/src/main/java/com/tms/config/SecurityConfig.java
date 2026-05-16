package com.tms.config;

import com.tms.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

/**
 * SecurityConfig - Spring Security Configuration
 *
 * Key Concepts Explained:
 *
 * 1. STATELESS sessions: We use JWT so no server-side session needed.
 *    Each request must carry its own JWT token.
 *
 * 2. CSRF disabled: Not needed for REST APIs (only for browser form sessions).
 *
 * 3. CORS: Allows Angular (localhost:4200) to call our API (localhost:8080).
 *
 * 4. @EnableMethodSecurity: Allows @PreAuthorize("hasRole('ADMIN')") on controllers.
 *
 * 5. BCryptPasswordEncoder: Hashes passwords. BCrypt is one-way (can't unhash),
 *    with built-in salt to prevent rainbow table attacks.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF - not needed for JWT REST APIs
            .csrf(AbstractHttpConfigurer::disable)

            // Configure CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Configure which endpoints are public vs protected
            .authorizeHttpRequests(auth -> auth
                // Allow ALL preflight OPTIONS requests - must be first!
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public endpoints - anyone can call these
                .requestMatchers("/api/auth/**").permitAll()

                // Admin only
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Manager and Admin can view/approve
                .requestMatchers("/api/approve/**").hasAnyRole("MANAGER", "FINANCE", "ADMIN")

                // Finance can process reimbursements
                .requestMatchers("/api/reimbursements/**").hasAnyRole("FINANCE", "ADMIN")

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )

            // Stateless session - JWT carries state, not server
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Add our JWT filter BEFORE Spring's default auth filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

            .authenticationProvider(authenticationProvider());

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * BCrypt: Hashing algorithm for passwords.
     * Strength 10 = 2^10 rounds of hashing (strong but fast enough).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    /**
     * CORS config: Allows Angular dev server to talk to Spring Boot.
     * In production: change to your actual domain.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // allowedOriginPatterns supports both "*" wildcard AND specific URLs
        // and is compatible with allowCredentials=true (unlike setAllowedOrigins with "*")
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
