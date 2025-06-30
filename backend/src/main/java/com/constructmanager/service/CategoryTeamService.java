package com.constructmanager.service;

import com.constructmanager.dto.*;
import com.constructmanager.entity.CategoryTeam;
import com.constructmanager.repository.CategoryRepository;
import com.constructmanager.repository.CategoryTeamRepository;
import com.constructmanager.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
                            
                            return categoryTeamRepository.save(categoryTeam);
                        }));
    }
    
    /**
     * Update category team assignment
     */
    @Transactional
    public Optional<CategoryTeam> updateCategoryTeam(Long categoryTeamId, CategoryTeamUpdateDTO dto) {
        return categoryTeamRepository.findById(categoryTeamId)
                .map(categoryTeam -> {
                    if (dto.getStatus() != null) {
                        categoryTeam.setStatus(dto.getStatus());
                    }
                    if (dto.getReceptionStatus() != null) {
                        categoryTeam.setReceptionStatus(dto.getReceptionStatus());
                    }
                    if (dto.getPaymentStatus() != null) {
                        categoryTeam.setPaymentStatus(dto.getPaymentStatus());
                    }
                    if (dto.getNotes() != null) {
                        categoryTeam.setNotes(dto.getNotes());
                    }
                    if (dto.getProgressPercentage() != null) {
                        categoryTeam.setProgressPercentage(dto.getProgressPercentage());
                    }
                    
                    return categoryTeamRepository.save(categoryTeam);
                });
    }
    
    /**
     * Delete category team assignment
     */
    @Transactional
    public boolean deleteCategoryTeam(Long categoryTeamId) {
        return categoryTeamRepository.findById(categoryTeamId)
                .map(categoryTeam -> {
                    categoryTeamRepository.delete(categoryTeam);
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