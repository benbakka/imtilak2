package com.constructmanager.service;

import com.constructmanager.dto.*;
import com.constructmanager.entity.CategoryTeam;
import com.constructmanager.exception.ResourceNotFoundException;
import com.constructmanager.repository.CategoryRepository;
import com.constructmanager.repository.CategoryTeamRepository;
import com.constructmanager.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class CategoryTeamService {
    
    @Autowired
    private CategoryTeamRepository categoryTeamRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private CacheManager cacheManager;
    
    @Autowired
    private ProgressService progressService;
    
    /**
     * Get category teams by category
     */
    public List<CategoryTeam> getCategoryTeamsByCategory(Long categoryId) {
        return categoryTeamRepository.findByCategoryIdOrderByCreatedAtAsc(categoryId);
    }
    
    /**
     * Get category teams by team
     */
    public Page<CategoryTeam> getCategoryTeamsByTeam(Long teamId, Pageable pageable) {
        return categoryTeamRepository.findByTeamIdOrderByCreatedAtDesc(teamId, pageable);
    }
    
    /**
     * Get category team by category and team
     */
    public Optional<CategoryTeam> getCategoryTeam(Long categoryId, Long teamId) {
        return categoryTeamRepository.findByCategoryIdAndTeamId(categoryId, teamId);
    }
    
    /**
     * Create category team assignment
     */
    @Transactional
    public Optional<CategoryTeam> createCategoryTeam(Long categoryId, CategoryTeamCreateDTO dto) {
        return categoryRepository.findById(categoryId)
                .flatMap(category -> teamRepository.findById(dto.getTeamId())
                        .map(team -> {
                            CategoryTeam categoryTeam = new CategoryTeam();
                            categoryTeam.setCategory(category);
                            categoryTeam.setTeam(team);
                            categoryTeam.setStatus(dto.getStatus());
                            categoryTeam.setReceptionStatus(dto.getReceptionStatus());
                            categoryTeam.setPaymentStatus(dto.getPaymentStatus());
                            categoryTeam.setNotes(dto.getNotes());
                            
                            CategoryTeam savedCategoryTeam = categoryTeamRepository.save(categoryTeam);
                            
                            // Evict the categoryDetails cache for the unit associated with this category team
                            if (category.getUnit() != null) {
                                Long unitId = category.getUnit().getId();
                                cacheManager.getCache("categoryDetails").evict(unitId);
                            }
                            
                            return savedCategoryTeam;
                        }));
    }
    
    /**
     * Update category team assignment
     */
    @Transactional
    public CategoryTeam updateCategoryTeam(Long id, CategoryTeamUpdateDTO updateDTO) {
        CategoryTeam categoryTeam = categoryTeamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CategoryTeam not found with id: " + id));
        
        if (updateDTO.getStatus() != null) {
            categoryTeam.setStatus(updateDTO.getStatus());
        }
        
        if (updateDTO.getReceptionStatus() != null) {
            categoryTeam.setReceptionStatus(updateDTO.getReceptionStatus());
        }
        
        if (updateDTO.getPaymentStatus() != null) {
            categoryTeam.setPaymentStatus(updateDTO.getPaymentStatus());
        }
        
        if (updateDTO.getNotes() != null) {
            categoryTeam.setNotes(updateDTO.getNotes());
        }
        
        // Save the basic updates first
        CategoryTeam savedCategoryTeam = categoryTeamRepository.save(categoryTeam);
        
        // Evict the categoryDetails cache for the unit associated with this category team
        if (savedCategoryTeam.getCategory() != null && savedCategoryTeam.getCategory().getUnit() != null) {
            Long unitId = savedCategoryTeam.getCategory().getUnit().getId();
            cacheManager.getCache("categoryDetails").evict(unitId);
        }
        
        // If progress percentage is updated, use ProgressService to update and propagate changes
        if (updateDTO.getProgressPercentage() != null) {
            return progressService.updateCategoryTeamProgress(id, updateDTO.getProgressPercentage());
        }
        
        return savedCategoryTeam;
    }
    
    /**
     * Delete category team assignment
     */
    @Transactional
    public boolean deleteCategoryTeam(Long categoryTeamId) {
        return categoryTeamRepository.findById(categoryTeamId)
                .map(categoryTeam -> {
                    // Store the unitId before deleting the categoryTeam
                    Long unitId = null;
                    if (categoryTeam.getCategory() != null && categoryTeam.getCategory().getUnit() != null) {
                        unitId = categoryTeam.getCategory().getUnit().getId();
                    }
                    
                    categoryTeamRepository.delete(categoryTeam);
                    
                    // Evict the categoryDetails cache for the unit associated with this category team
                    if (unitId != null) {
                        cacheManager.getCache("categoryDetails").evict(unitId);
                    }
                    
                    return true;
                })
                .orElse(false);
    }
    
    /**
     * Get delayed tasks for alerts
     */
    public Page<CategoryTeam> getDelayedTasks(Long companyId, Pageable pageable) {
        return categoryTeamRepository.findDelayedTasks(companyId, pageable);
    }
    
    /**
     * Get tasks starting soon for alerts
     */
    public Page<CategoryTeam> getTasksStartingSoon(Long companyId, int daysAhead, Pageable pageable) {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(daysAhead);
        return categoryTeamRepository.findTasksStartingSoon(companyId, today, futureDate, pageable);
    }
    
    /**
     * Get tasks by status
     */
    public Page<CategoryTeam> getTasksByStatus(Long companyId, CategoryTeam.TaskStatus status, Pageable pageable) {
        return categoryTeamRepository.findTasksByStatus(companyId, status, pageable);
    }
    
    /**
     * Count tasks by status for dashboard
     */
    public Long countTasksByStatus(Long companyId, CategoryTeam.TaskStatus status) {
        return categoryTeamRepository.countTasksByStatus(companyId, status);
    }
    
    /**
     * Get tasks requiring payment
     */
    public Page<CategoryTeam> getTasksRequiringPayment(Long companyId, Pageable pageable) {
        return categoryTeamRepository.findTasksRequiringPayment(companyId, pageable);
    }
    
    /**
     * Get team workload
     */
    public Page<Object[]> getTeamWorkload(Long companyId, Pageable pageable) {
        return categoryTeamRepository.getTeamWorkload(companyId, pageable);
    }
}