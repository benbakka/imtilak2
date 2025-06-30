package com.constructmanager.controller;

import com.constructmanager.dto.UserProfileDTO;
import com.constructmanager.dto.UserProfileUpdateDTO;
import com.constructmanager.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    /**
     * Get user profile
     * GET /api/v1/users/{id}/profile?companyId=1
     */
    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileDTO> getUserProfile(
            @PathVariable Long id,
            @RequestParam Long companyId) {
        
        return userService.getUserProfile(id, companyId)
                .map(profile -> ResponseEntity.ok(profile))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update user profile
     * PUT /api/v1/users/{id}/profile?companyId=1
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<UserProfileDTO> updateUserProfile(
            @PathVariable Long id,
            @RequestParam Long companyId,
            @Valid @RequestBody UserProfileUpdateDTO updateDTO) {
        
        try {
            return userService.updateUserProfile(id, companyId, updateDTO)
                    .map(profile -> ResponseEntity.ok(profile))
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Change user password
     * POST /api/v1/users/{id}/change-password?companyId=1
     */
    @PostMapping("/{id}/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable Long id,
            @RequestParam Long companyId,
            @RequestBody Map<String, String> passwordData) {
        
        try {
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current and new passwords are required"));
            }
            
            boolean success = userService.changePassword(id, companyId, currentPassword, newPassword);
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}