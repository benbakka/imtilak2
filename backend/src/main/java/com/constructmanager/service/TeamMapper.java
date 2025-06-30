package com.constructmanager.service;

import com.constructmanager.dto.*;
import com.constructmanager.entity.Team;
import org.springframework.stereotype.Component;

@Component
public class TeamMapper {
    
    /**
     * Convert Team entity to detailed DTO
     */
    public TeamDetailDTO toDetailDTO(Team team) {
        TeamDetailDTO dto = new TeamDetailDTO();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setSpecialty(team.getSpecialty());
        dto.setColor(team.getColor());
        dto.setDescription(team.getDescription());
        dto.setIsActive(team.getIsActive());
        dto.setCreatedAt(team.getCreatedAt());
        dto.setUpdatedAt(team.getUpdatedAt());
        
        // Map company
        if (team.getCompany() != null) {
            dto.setCompany(new CompanyBasicDTO(
                team.getCompany().getId(),
                team.getCompany().getName()
            ));
        }
        
        // Calculate performance metrics
        long totalAssignments = team.getCategoryTeams().size();
        long completedAssignments = team.getCategoryTeams().stream()
                .mapToLong(ct -> ct.getStatus().name().equals("DONE") ? 1 : 0)
                .sum();
        
        double avgProgress = team.getCategoryTeams().stream()
                .mapToInt(ct -> ct.getProgressPercentage())
                .average()
                .orElse(0.0);
        
        dto.setTotalAssignments(totalAssignments);
        dto.setCompletedAssignments(completedAssignments);
        dto.setAvgProgress(avgProgress);
        
        return dto;
    }
    
    /**
     * Convert create DTO to entity
     */
    public Team toEntity(TeamCreateDTO dto) {
        Team team = new Team();
        team.setName(dto.getName());
        team.setSpecialty(dto.getSpecialty());
        team.setColor(dto.getColor());
        team.setDescription(dto.getDescription());
        return team;
    }
    
    /**
     * Update entity from update DTO
     */
    public void updateEntity(Team team, TeamUpdateDTO dto) {
        team.setName(dto.getName());
        team.setSpecialty(dto.getSpecialty());
        team.setColor(dto.getColor());
        team.setDescription(dto.getDescription());
        if (dto.getIsActive() != null) {
            team.setIsActive(dto.getIsActive());
        }
    }
}