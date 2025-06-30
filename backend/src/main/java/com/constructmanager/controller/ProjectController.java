package com.constructmanager.controller;

import com.constructmanager.dto.ProjectDetailDTO;
import com.constructmanager.dto.ProjectSummaryDTO;
import com.constructmanager.entity.Project;
import com.constructmanager.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = "*")
public class ProjectController {
    
    @Autowired
    private ProjectService projectService;
    
    /**
     * Get paginated project summaries
     * GET /api/v1/projects?page=0&size=10&sort=name,asc&status=ACTIVE
     */
    @GetMapping
    public ResponseEntity<Page<ProjectSummaryDTO>> getProjects(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Project.ProjectStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        // Create pageable with sorting
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sort); // Max 100 items per page
        
        Page<ProjectSummaryDTO> projects;
        
        if (search != null && !search.trim().isEmpty()) {
            projects = projectService.searchProjects(companyId, search.trim(), pageable);
        } else if (status != null) {
            projects = projectService.getProjectSummariesByStatus(companyId, status, pageable);
        } else if (startDate != null && endDate != null) {
            projects = projectService.getProjectsByDateRange(companyId, startDate, endDate, pageable);
        } else {
            projects = projectService.getProjectSummaries(companyId, pageable);
        }
        
        return ResponseEntity.ok(projects);
    }
    
    /**
     * Get detailed project information
     * GET /api/v1/projects/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDetailDTO> getProject(
            @PathVariable Long id,
            @RequestParam Long companyId) {
        
        return projectService.getProjectDetail(id, companyId)
                .map(project -> ResponseEntity.ok(project))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create new project
     * POST /api/v1/projects
     */
    @PostMapping
    public ResponseEntity<ProjectDetailDTO> createProject(
            @Valid @RequestBody Project project,
            @RequestParam Long companyId) {
        
        // Set company ID for security
        project.getCompany().setId(companyId);
        
        ProjectDetailDTO createdProject = projectService.createProject(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
    }
    
    /**
     * Update existing project
     * PUT /api/v1/projects/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDetailDTO> updateProject(
            @PathVariable Long id,
            @RequestParam Long companyId,
            @Valid @RequestBody Project projectUpdates) {
        
        return projectService.updateProject(id, companyId, projectUpdates)
                .map(project -> ResponseEntity.ok(project))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete project
     * DELETE /api/v1/projects/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @RequestParam Long companyId) {
        
        boolean deleted = projectService.deleteProject(id, companyId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
    
    /**
     * Get active projects count for dashboard
     * GET /api/v1/projects/count/active
     */
    @GetMapping("/count/active")
    public ResponseEntity<Long> getActiveProjectsCount(@RequestParam Long companyId) {
        Long count = projectService.getActiveProjectsCount(companyId);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Get projects with delayed tasks
     * GET /api/v1/projects/delayed
     */
    @GetMapping("/delayed")
    public ResponseEntity<Page<Project>> getProjectsWithDelayedTasks(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Project> projects = projectService.getProjectsWithDelayedTasks(companyId, pageable);
        return ResponseEntity.ok(projects);
    }
}