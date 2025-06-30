package com.constructmanager.controller;

import com.constructmanager.dto.AuthLoginDTO;
import com.constructmanager.dto.AuthResponseDTO;
import com.constructmanager.dto.RegisterCompanyRequestDTO;
import com.constructmanager.dto.UserProfileDTO;
import com.constructmanager.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Login endpoint
     * POST /api/v1/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthLoginDTO loginDTO) {
        return authService.authenticate(loginDTO.getEmail(), loginDTO.getPassword())
                .map(response -> ResponseEntity.ok(response))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    /**
     * Get current user from token
     * GET /api/v1/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        return authService.getUserFromToken(token)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    /**
     * Logout endpoint (client-side token removal)
     * POST /api/v1/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /**
     * Register a new company and admin user
     * POST /api/v1/auth/register-company
     */
    /**
     * Simple test endpoint to check if security configuration is working
     */
    @GetMapping("/test-public")
    public ResponseEntity<?> testPublicEndpoint() {
        return ResponseEntity.ok(Map.of(
            "message", "This public endpoint is working correctly!",
            "timestamp", new java.util.Date()
        ));
    }

    @PostMapping("/register-company")
    public ResponseEntity<?> registerCompany(@Valid @RequestBody RegisterCompanyRequestDTO requestDTO) {
        System.out.println("==========================================");
        System.out.println("AuthController: Received register-company request");
        System.out.println("Company: " + requestDTO.getCompany().getName());
        System.out.println("User: " + requestDTO.getUser().getEmail());
        System.out.println("Request payload: " + requestDTO);
        System.out.println("==========================================");
        
        try {
            return authService.registerCompany(requestDTO.getCompany(), requestDTO.getUser())
                    .map(response -> {
                        System.out.println("Company registration successful");
                        return ResponseEntity.status(HttpStatus.CREATED).body(response);
                    })
                    .orElseGet(() -> {
                        System.out.println("Company registration returned empty response");
                        // Create a proper AuthResponseDTO instance with null token to indicate error
                        AuthResponseDTO errorResponse = new AuthResponseDTO(null, null);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
                    });
        } catch (Exception e) {
            System.out.println("Exception in registerCompany: " + e.getMessage());
            e.printStackTrace();
            // Create a proper AuthResponseDTO for the error with null values
            AuthResponseDTO errorResponse = new AuthResponseDTO(null, null);
            // Log the actual error message for debugging
            System.out.println("Error message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}