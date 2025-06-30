package com.constructmanager.service;

import com.constructmanager.dto.CompanyBasicDTO;
import com.constructmanager.dto.ProjectDetailDTO;
import com.constructmanager.dto.UnitSummaryDTO;
import com.constructmanager.entity.Project;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ProjectMapper {
    
    @Autowired
    private UnitService unitService;
    
    /**
     * Convert Project entity to detailed DTO
     */
    public ProjectDetailDTO toDetailDTO(Project project) {
        ProjectDetailDTO dto = new ProjectDetailDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setLocation(project.getLocation());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setStatus(project.getStatus());
        dto.setProgressPercentage(project.getProgressPercentage());
        dto.setBudget(project.getBudget());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        
        // Map company
        if (project.getCompany() != null) {
            dto.setCompany(new CompanyBasicDTO(
                project.getCompany().getId(),
                project.getCompany().getName()
            ));
        }
        
        // Map units (using service to get summaries with counts)
        dto.setUnits(project.getUnits().stream()
                .map(unit -> new UnitSummaryDTO(
                    unit.getId(),
                    unit.getName(),
                    unit.getType(),
                    unit.getFloor(),
                    unit.getArea(),
                    unit.getProgressPercentage(),
                    (long) unit.getCategories().size(),
                    unit.getCategories().stream()
                        .mapToLong(category -> category.getCategoryTeams().size())
                        .sum()
                ))
                .collect(Collectors.toList()));
        
        return dto;
    }
}