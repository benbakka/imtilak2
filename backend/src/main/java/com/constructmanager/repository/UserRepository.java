package com.constructmanager.repository;

import com.constructmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find user by email and company
     */
    Optional<User> findByEmailAndCompanyId(String email, Long companyId);
    
    /**
     * Find user by ID and company for security
     */
    Optional<User> findByIdAndCompanyId(Long id, Long companyId);
    
    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);
    
    /**
     * Count users by company
     */
    Long countByCompanyId(Long companyId);
}