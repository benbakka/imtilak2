package com.constructmanager.service;

import com.constructmanager.dto.UserProfileDTO;
import com.constructmanager.dto.UserProfileUpdateDTO;
import com.constructmanager.entity.User;
import com.constructmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Get user profile by ID
     */
    public Optional<UserProfileDTO> getUserProfile(Long userId, Long companyId) {
        return userRepository.findByIdAndCompanyId(userId, companyId)
                .map(userMapper::toProfileDTO);
    }
    
    /**
     * Update user profile
     */
    @Transactional
    public Optional<UserProfileDTO> updateUserProfile(Long userId, Long companyId, UserProfileUpdateDTO updateDTO) {
        return userRepository.findByIdAndCompanyId(userId, companyId)
                .map(user -> {
                    // Check if email is already taken by another user
                    if (!user.getEmail().equals(updateDTO.getEmail()) && 
                        userRepository.existsByEmail(updateDTO.getEmail())) {
                        throw new RuntimeException("Email is already taken");
                    }
                    
                    userMapper.updateUserFromDTO(user, updateDTO);
                    User savedUser = userRepository.save(user);
                    return userMapper.toProfileDTO(savedUser);
                });
    }
    
    /**
     * Change user password
     */
    @Transactional
    public boolean changePassword(Long userId, Long companyId, String currentPassword, String newPassword) {
        return userRepository.findByIdAndCompanyId(userId, companyId)
                .map(user -> {
                    // Verify current password
                    if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                        throw new RuntimeException("Current password is incorrect");
                    }
                    
                    // Update password
                    user.setPassword(passwordEncoder.encode(newPassword));
                    userRepository.save(user);
                    return true;
                })
                .orElse(false);
    }
    
    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * Create new user
     */
    @Transactional
    public User createUser(User user) {
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
}