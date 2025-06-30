package com.constructmanager.service;

import com.constructmanager.dto.CompanyBasicDTO;
import com.constructmanager.dto.UserProfileDTO;
import com.constructmanager.dto.UserProfileUpdateDTO;
import com.constructmanager.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    
    /**
     * Convert User entity to profile DTO
     */
    public UserProfileDTO toProfileDTO(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setRole(user.getRole());
        dto.setPhone(user.getPhone());
        dto.setPosition(user.getPosition());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        
        // Map company
        if (user.getCompany() != null) {
            dto.setCompany(new CompanyBasicDTO(
                user.getCompany().getId(),
                user.getCompany().getName()
            ));
        }
        
        return dto;
    }
    
    /**
     * Update user entity from profile update DTO
     */
    public void updateUserFromDTO(User user, UserProfileUpdateDTO dto) {
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setPosition(dto.getPosition());
    }
}