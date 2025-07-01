package com.constructmanager.service;

import com.constructmanager.dto.ProjectDetailDTO;
import com.constructmanager.dto.ProjectSummaryDTO;
import com.constructmanager.entity.Project;
import com.constructmanager.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMapper projectMapper;

    /**
     * Get paginated project summaries for a company
     * Uses caching for better performance
     */
    @Cacheable(value = "projectSummaries", key = "#companyId + '_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<ProjectSummaryDTO> getProjectSummaries(Long companyId, Pageable pageable) {
        return projectRepository.findProjectSummariesByCompanyId(companyId, pageable);
    }

    /**
     * Get project summaries by status
     */
    @Cacheable(value = "projectSummariesByStatus", key = "#companyId + '_' + #status + '_' + #pageable.pageNumber")
    public Page<ProjectSummaryDTO> getProjectSummariesByStatus(Long companyId, Project.ProjectStatus status, Pageable pageable) {
        return projectRepository.findProjectSummariesByCompanyIdAndStatus(companyId, status, pageable);
    }

    /**
     * Search projects by name or location
     */
    public Page<ProjectSummaryDTO> searchProjects(Long companyId, String searchTerm, Pageable pageable) {
        return projectRepository.searchProjectSummaries(companyId, searchTerm, pageable);
    }

    /**
     * Get project summaries by date range
     */
    public Page<ProjectSummaryDTO> getProjectsByDateRange(Long companyId, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return projectRepository.findProjectSummariesByCompanyIdAndDateRange(companyId, startDate, endDate, pageable);
    }

    /**
     * Get detailed project information
     */
    @Cacheable(value = "projectDetails", key = "#projectId + '_' + #companyId")
    public Optional<ProjectDetailDTO> getProjectDetail(Long projectId, Long companyId) {
        return projectRepository.findByIdAndCompanyId(projectId, companyId)
                .map(projectMapper::toDetailDTO);
    }

    /**
     * Create new project
     */
    @Transactional
    @CacheEvict(value = {"projectSummaries", "projectSummariesByStatus", "activeProjectsCount"}, allEntries = true)
    public ProjectDetailDTO createProject(Project project) {
        Project savedProject = projectRepository.save(project);
        return projectMapper.toDetailDTO(savedProject);
    }

    /**
     * Update existing project
     */
    @Transactional
    @CacheEvict(value = {"projectSummaries", "projectSummariesByStatus", "projectDetails", "activeProjectsCount"}, allEntries = true)
    public Optional<ProjectDetailDTO> updateProject(Long projectId, Long companyId, Project projectUpdates) {
        return projectRepository.findByIdAndCompanyId(projectId, companyId)
                .map(existingProject -> {
                    // Update fields
                    existingProject.setName(projectUpdates.getName());
                    existingProject.setDescription(projectUpdates.getDescription());
                    existingProject.setLocation(projectUpdates.getLocation());
                    existingProject.setStartDate(projectUpdates.getStartDate());
                    existingProject.setEndDate(projectUpdates.getEndDate());
                    existingProject.setStatus(projectUpdates.getStatus());
                    existingProject.setBudget(projectUpdates.getBudget());

                    Project savedProject = projectRepository.save(existingProject);
                    return projectMapper.toDetailDTO(savedProject);
                });
    }

    /**
     * Delete project
     */
    @Transactional
    @CacheEvict(value = {"projectSummaries", "projectSummariesByStatus", "projectDetails", "activeProjectsCount"}, allEntries = true)
    public boolean deleteProject(Long projectId, Long companyId) {
        return projectRepository.findByIdAndCompanyId(projectId, companyId)
                .map(project -> {
                    projectRepository.delete(project);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Get active projects count for dashboard
     */
    @Cacheable(value = "activeProjectsCount", key = "#companyId")
    public Long getActiveProjectsCount(Long companyId) {
        return projectRepository.countActiveProjectsByCompanyId(companyId);
    }

    /**
     * Get projects with delayed tasks
     */
    public Page<Project> getProjectsWithDelayedTasks(Long companyId, Pageable pageable) {
        return projectRepository.findProjectsWithDelayedTasks(companyId, pageable);
    }
}