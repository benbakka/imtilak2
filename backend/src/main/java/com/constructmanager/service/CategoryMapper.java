package com.constructmanager.service;

import com.constructmanager.dto.*;
import com.constructmanager.entity.Category;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class CategoryMapper {
    
    /**
     * Convert Category entity to detailed DTO
     */
    public CategoryDetailDTO toDetailDTO(Category category) {
        CategoryDetailDTO dto = new CategoryDetailDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setStartDate(category.getStartDate());
        dto.setEndDate(category.getEndDate());
        dto.setOrderSequence(category.getOrderSequence());
        dto.setProgressPercentage(category.getProgressPercentage());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        
        // Map category teams
        dto.setCategoryTeams(category.getCategoryTeams().stream()
                .map(this::toCategoryTeamDetailDTO)
                .collect(Collectors.toList()));
        
        return dto;
    }
    
    /**
     * Convert CategoryTeam to detailed DTO
     */
    private CategoryTeamDetailDTO toCategoryTeamDetailDTO(com.constructmanager.entity.CategoryTeam categoryTeam) {
        CategoryTeamDetailDTO dto = new CategoryTeamDetailDTO();
        dto.setId(categoryTeam.getId());
        dto.setStatus(categoryTeam.getStatus());
        dto.setReceptionStatus(categoryTeam.getReceptionStatus());
        dto.setPaymentStatus(categoryTeam.getPaymentStatus());
        dto.setNotes(categoryTeam.getNotes());
        dto.setProgressPercentage(categoryTeam.getProgressPercentage());
        dto.setCreatedAt(categoryTeam.getCreatedAt());
        dto.setUpdatedAt(categoryTeam.getUpdatedAt());
        
        // Map team
        if (categoryTeam.getTeam() != null) {
            dto.setTeam(new TeamBasicDTO(
                categoryTeam.getTeam().getId(),
                categoryTeam.getTeam().getName(),
                categoryTeam.getTeam().getSpecialty(),
                categoryTeam.getTeam().getColor()
            ));
        }
        
        // Map tasks
        dto.setTasks(categoryTeam.getTasks().stream()
                .map(task -> new TaskSummaryDTO(
                    task.getId(),
                    task.getName(),
                    task.getDescription(),
                    task.getStatus(),
                    task.getDueDate(),
                    task.getCompletedDate(),
                    task.getProgressPercentage()
                ))
                .collect(Collectors.toList()));
        
        return dto;
    }
    
    /**
     * Convert create DTO to entity
     */
    public Category toEntity(CategoryCreateDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setStartDate(dto.getStartDate());
        category.setEndDate(dto.getEndDate());
        category.setOrderSequence(dto.getOrderSequence());
        return category;
    }
    
    /**
     * Update entity from update DTO
     */
    public void updateEntity(Category category, CategoryUpdateDTO dto) {
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setStartDate(dto.getStartDate());
        category.setEndDate(dto.getEndDate());
        category.setOrderSequence(dto.getOrderSequence());
        if (dto.getProgressPercentage() != null) {
            category.setProgressPercentage(dto.getProgressPercentage());
        }
    }
}