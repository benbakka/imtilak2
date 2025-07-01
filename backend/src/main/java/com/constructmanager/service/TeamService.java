package com.constructmanager.service;

import com.constructmanager.dto.*;
import com.constructmanager.entity.Team;
import com.constructmanager.repository.CompanyRepository;
import com.constructmanager.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class TeamService {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private TeamMapper teamMapper;

    /**
     * Get paginated teams for a company
     */
    @Cacheable(value = "teams", key = "#companyId + '_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<Team> getTeams(Long companyId, Pageable pageable) {
        return teamRepository.findByCompanyIdAndIsActiveTrueOrderByNameAsc(companyId, pageable);
    }

    /**
     * Get all active teams for a company (for dropdowns)
     */
    @Cacheable(value = "teams", key = "#companyId + '_all'")
    public List<Team> getAllActiveTeams(Long companyId) {
        return teamRepository.findByCompanyIdAndIsActiveTrueOrderByNameAsc(companyId);
    }

    /**
     * Search teams by name or specialty
     */
    public Page<Team> searchTeams(Long companyId, String searchTerm, Pageable pageable) {
        return teamRepository.searchTeams(companyId, searchTerm, pageable);
    }

    /**
     * Get teams by specialty
     */
    public Page<Team> getTeamsBySpecialty(Long companyId, String specialty, Pageable pageable) {
        return teamRepository.findByCompanyIdAndSpecialtyContainingIgnoreCaseAndIsActiveTrueOrderByNameAsc(
                companyId, specialty, pageable);
    }

    /**
     * Get detailed team information
     */
    @Cacheable(value = "teamDetails", key = "#teamId + '_' + #companyId")
    public Optional<TeamDetailDTO> getTeamDetail(Long teamId, Long companyId) {
        return teamRepository.findByIdAndCompanyId(teamId, companyId)
                .map(teamMapper::toDetailDTO);
    }

    /**
     * Create new team
     */
    @Transactional
    @CacheEvict(value = "teams", allEntries = true)
    public Optional<TeamDetailDTO> createTeam(Long companyId, TeamCreateDTO teamCreateDTO) {
        return companyRepository.findById(companyId)
                .map(company -> {
                    Team team = teamMapper.toEntity(teamCreateDTO);
                    team.setCompany(company);
                    Team savedTeam = teamRepository.save(team);
                    return teamMapper.toDetailDTO(savedTeam);
                });
    }

    /**
     * Update existing team
     */
    @Transactional
    @CacheEvict(value = "teams", allEntries = true)
    public Optional<TeamDetailDTO> updateTeam(Long teamId, Long companyId, TeamUpdateDTO teamUpdateDTO) {
        return teamRepository.findByIdAndCompanyId(teamId, companyId)
                .map(existingTeam -> {
                    teamMapper.updateEntity(existingTeam, teamUpdateDTO);
                    Team savedTeam = teamRepository.save(existingTeam);
                    return teamMapper.toDetailDTO(savedTeam);
                });
    }

    /**
     * Delete team (soft delete by setting isActive to false)
     */
    @Transactional
    @CacheEvict(value = "teams", allEntries = true)
    public boolean deleteTeam(Long teamId, Long companyId) {
        return teamRepository.findByIdAndCompanyId(teamId, companyId)
                .map(team -> {
                    team.setIsActive(false);
                    teamRepository.save(team);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Count active teams for dashboard
     */
    @Cacheable(value = "activeTeamsCount", key = "#companyId")
    public Long getActiveTeamsCount(Long companyId) {
        return teamRepository.countByCompanyIdAndIsActiveTrue(companyId);
    }

    /**
     * Get teams working on a specific project
     */
    public List<Team> getTeamsByProject(Long projectId) {
        return teamRepository.findTeamsByProjectId(projectId);
    }

    /**
     * Get team performance metrics
     */
    public Page<Object[]> getTeamPerformanceMetrics(Long companyId, Pageable pageable) {
        return teamRepository.getTeamPerformanceMetrics(companyId, pageable);
    }
}