package com.constructmanager.service;

import com.constructmanager.dto.*;
import com.constructmanager.entity.Unit;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UnitMapper {
    
    /**
     * Convert Unit entity to detailed DTO
     */
    public UnitDetailDTO toDetailDTO(Unit unit) {
        UnitDetailDTO dto = new UnitDetailDTO();
        dto.setId(unit.getId());
        dto.setName(unit.getName());
        dto.setType(unit.getType());
        dto.setFloor(unit.getFloor());
        dto.setArea(unit.getArea());
        dto.setDescription(unit.getDescription());
        dto.setProgressPercentage(unit.getProgressPercentage());
        dto.setCreatedAt(unit.getCreatedAt());
        dto.setUpdatedAt(unit.getUpdatedAt());
        
        // Map project
        if (unit.getProject() != null) {
            dto.setProject(new ProjectBasicDTO(
                unit.getProject().getId(),
                unit.getProject().getName(),
                unit.getProject().getLocation()
            ));
        }
        
        // Map categories
        dto.setCategories(unit.getCategories().stream()
                .map(category -> new CategorySummaryDTO(
                    category.getId(),
                    category.getName(),
                    category.getStartDate(),
                    category.getEndDate(),
                    category.getOrderSequence(),
                    category.getProgressPercentage(),
                    (long) category.getCategoryTeams().size()
                ))
                .collect(Collectors.toList()));
        
        return dto;
    }
    
    /**
     * Convert create DTO to entity
     */
    public Unit toEntity(UnitCreateDTO dto) {
        Unit unit = new Unit();
        unit.setName(dto.getName());
        unit.setType(dto.getType());
        unit.setFloor(dto.getFloor());
        unit.setArea(dto.getArea());
        unit.setDescription(dto.getDescription());
        return unit;
    }
    
    /**
     * Update entity from update DTO
     */
    public void updateEntity(Unit unit, UnitUpdateDTO dto) {
        unit.setName(dto.getName());
        unit.setType(dto.getType());
        unit.setFloor(dto.getFloor());
        unit.setArea(dto.getArea());
        unit.setDescription(dto.getDescription());
        if (dto.getProgressPercentage() != null) {
            unit.setProgressPercentage(dto.getProgressPercentage());
        }
    }
}