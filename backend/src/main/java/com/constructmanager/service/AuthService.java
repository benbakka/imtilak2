package com.constructmanager.service;

import com.constructmanager.dto.AuthResponseDTO;
import com.constructmanager.dto.CompanyCreateDTO;
import com.constructmanager.dto.UserCreateDTO;
import com.constructmanager.dto.UserProfileDTO;
import com.constructmanager.entity.Company;
import com.constructmanager.entity.User;
import com.constructmanager.repository.CompanyRepository;
import com.constructmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    /**
     * Authenticate user and return JWT token
     */
    public Optional<AuthResponseDTO> authenticate(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                .filter(User::getIsActive)
                .map(user -> {
                    String token = jwtService.generateToken(user);
                    UserProfileDTO userProfile = userMapper.toProfileDTO(user);
                    return new AuthResponseDTO(token, userProfile);
                });
    }
    
    /**
     * Get user from JWT token
     */
    public Optional<UserProfileDTO> getUserFromToken(String token) {
        return jwtService.extractUserId(token)
                .flatMap(userRepository::findById)
                .filter(User::getIsActive)
                .map(userMapper::toProfileDTO);
    }
    
    /**
     * Register a new company and admin user
     */
    @Transactional
    public Optional<AuthResponseDTO> registerCompany(CompanyCreateDTO companyDTO, UserCreateDTO userDTO) {
        // Check if email already exists
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        
        // Create and save company
        Company company = new Company();
        company.setName(companyDTO.getName());
        company.setAddress(companyDTO.getAddress());
        company.setPhone(companyDTO.getPhone());
        company.setWebsite(companyDTO.getWebsite());
        company.setDescription(companyDTO.getDescription());
        company.setIsActive(true);
        
        Company savedCompany = companyRepository.save(company);
        
        // Create and save user
        User user = new User();
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setPhone(userDTO.getPhone());
        user.setPosition(userDTO.getPosition());
        user.setRole(User.UserRole.ADMIN); // Company creator is always admin
        user.setIsActive(true);
        user.setCompany(savedCompany);
        
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtService.generateToken(savedUser);
        UserProfileDTO userProfile = userMapper.toProfileDTO(savedUser);
        
        return Optional.of(new AuthResponseDTO(token, userProfile));
    }
}