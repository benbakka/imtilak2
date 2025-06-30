package com.constructmanager.controller;

import com.constructmanager.dto.*;
import com.constructmanager.entity.Team;
import com.constructmanager.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@CrossOrigin(origins = "*")
public class TeamController {
    
    @Autowired
    private TeamService teamService;
    
    /**
     * Get paginated teams for a company
     * GET /api/v1/teams?companyId=1&page=0&size=10&sort=name,asc&specialty=Electrical
     */
    @GetMapping
    public ResponseEntity<Page<Team>> getTeams(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String search) {
        
        // Create pageable with sorting
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sort);
        
        Page<Team> teams;
        
        if (search != null && !search.trim().isEmpty()) {
            teams = teamService.searchTeams(companyId, search.trim(), pageable);
        } else if (specialty != null && !specialty.trim().isEmpty()) {
            teams = teamService.getTeamsBySpecialty(companyId, specialty.trim(), pageable);
        } else {
            teams = teamService.getTeams(companyId, pageable);
        }
        
        return ResponseEntity.ok(teams);
    }
    
    /**
     * Get all active teams for a company (for dropdowns)
     * GET /api/v1/teams/all?companyId=1
     */
    @GetMapping("/all")
    public ResponseEntity<List<Team>> getAllActiveTeams(@RequestParam Long companyId) {
        List<Team> teams = teamService.getAllActiveTeams(companyId);
        return ResponseEntity.ok(teams);
    }
    
    /**
     * Get detailed team information
     * GET /api/v1/teams/{id}?companyId=1
     */
    @GetMapping("/{id}")
    public ResponseEntity<TeamDetailDTO> getTeam(
            @PathVariable Long id,
            @RequestParam Long companyId) {
        
        return teamService.getTeamDetail(id, companyId)
                .map(team -> ResponseEntity.ok(team))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create new team
     * POST /api/v1/teams?companyId=1
     */
    @PostMapping
    public ResponseEntity<TeamDetailDTO> createTeam(
            @RequestParam Long companyId,
            @Valid @RequestBody TeamCreateDTO teamCreateDTO) {
        
        return teamService.createTeam(companyId, teamCreateDTO)
                .map(team -> ResponseEntity.status(HttpStatus.CREATED).body(team))
                .orElse(ResponseEntity.badRequest().build());
    }
    
    /**
     * Update existing team
     * PUT /api/v1/teams/{id}?companyId=1
     */
    @PutMapping("/{id}")
    public ResponseEntity<TeamDetailDTO> updateTeam(
            @PathVariable Long id,
            @RequestParam Long companyId,
            @Valid @RequestBody TeamUpdateDTO teamUpdateDTO) {
        
        return teamService.updateTeam(id, companyId, teamUpdateDTO)
                .map(team -> ResponseEntity.ok(team))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete team (soft delete)
     * DELETE /api/v1/teams/{id}?companyId=1
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(
            @PathVariable Long id,
            @RequestParam Long companyId) {
        
        boolean deleted = teamService.deleteTeam(id, companyId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
    
    /**
     * Get active teams count for dashboard
     * GET /api/v1/teams/count/active?companyId=1
     */
    @GetMapping("/count/active")
    public ResponseEntity<Long> getActiveTeamsCount(@RequestParam Long companyId) {
        Long count = teamService.getActiveTeamsCount(companyId);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Get teams working on a specific project
     * GET /api/v1/teams/project/{projectId}
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Team>> getTeamsByProject(@PathVariable Long projectId) {
        List<Team> teams = teamService.getTeamsByProject(projectId);
        return ResponseEntity.ok(teams);
    }
    
    /**
     * Get team performance metrics
     * GET /api/v1/teams/performance?companyId=1
     */
    @GetMapping("/performance")
    public ResponseEntity<Page<Object[]>> getTeamPerformanceMetrics(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Object[]> metrics = teamService.getTeamPerformanceMetrics(companyId, pageable);
        return ResponseEntity.ok(metrics);
    }
}