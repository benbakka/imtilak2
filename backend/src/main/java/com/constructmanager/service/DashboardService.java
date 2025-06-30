package com.constructmanager.service;

import com.constructmanager.dto.DashboardStatsDTO;
import com.constructmanager.entity.CategoryTeam;
import com.constructmanager.entity.Project;
import com.constructmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UnitRepository unitRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private CategoryTeamRepository categoryTeamRepository;
    
    /**
     * Get comprehensive dashboard statistics
     */
    @Cacheable(value = "dashboardStats", key = "#companyId")
    public DashboardStatsDTO getDashboardStats(Long companyId) {
        // Get project stats
        Long totalProjects = projectRepository.count();
        Long activeProjects = projectRepository.countActiveProjectsByCompanyId(companyId);
        
        // Get unit stats (you'll need to add this query to ProjectRepository)
        Long totalUnits = getTotalUnitsByCompany(companyId);
        
        // Get team stats
        Long totalTeams = teamRepository.count();
        Long activeTeams = teamRepository.countByCompanyIdAndIsActiveTrue(companyId);
        
        // Get task stats
        Long completedTasks = categoryTeamRepository.countTasksByStatus(companyId, CategoryTeam.TaskStatus.DONE);
        Long inProgressTasks = categoryTeamRepository.countTasksByStatus(companyId, CategoryTeam.TaskStatus.IN_PROGRESS);
        Long delayedTasks = categoryTeamRepository.countTasksByStatus(companyId, CategoryTeam.TaskStatus.DELAYED);
        Long totalTasks = completedTasks + inProgressTasks + delayedTasks + 
                         categoryTeamRepository.countTasksByStatus(companyId, CategoryTeam.TaskStatus.NOT_STARTED);
        
        // Get payment stats
        Long tasksRequiringPayment = getTasksRequiringPaymentCount(companyId);
        
        // Get average project progress
        Double avgProjectProgress = getAverageProjectProgress(companyId);
        
        return new DashboardStatsDTO(
            totalProjects, activeProjects, totalUnits, totalTeams, activeTeams,
            totalTasks, completedTasks, inProgressTasks, delayedTasks,
            tasksRequiringPayment, avgProjectProgress
        );
    }
    
    private Long getTotalUnitsByCompany(Long companyId) {
        // This would need a custom query in ProjectRepository
        // For now, return a placeholder
        return 0L;
    }
    
    private Long getTasksRequiringPaymentCount(Long companyId) {
        // This would need a custom query
        return 0L;
    }
    
    private Double getAverageProjectProgress(Long companyId) {
        // This would need a custom query
        return 0.0;
    }
}