package com.constructmanager.service;

import com.constructmanager.dto.*;
import com.constructmanager.entity.CategoryTeam;
import com.constructmanager.entity.Project;
import com.constructmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportService {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UnitRepository unitRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private CategoryTeamRepository categoryTeamRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private AnalyticsService analyticsService;
    
    /**
     * Get report data for overview
     */
    @Cacheable(value = "reportData", key = "#companyId + '_' + #period + '_' + #projectId")
    public Map<String, Object> getReportData(Long companyId, String period, Long projectId) {
        Map<String, Object> result = new HashMap<>();
        
        // Get projects data
        List<ProjectReportDTO> projects;
        if (projectId != null) {
            projects = Collections.singletonList(getProjectReport(projectId, companyId));
        } else {
            projects = getProjectsReport(companyId);
        }
        result.put("projects", projects);
        
        // Get team performance data
        List<TeamPerformanceDTO> teams = analyticsService.getTeamPerformance(companyId);
        result.put("teams", teams);
        
        // Get monthly progress data
        List<MonthlyProgressDTO> monthlyProgress = getMonthlyProgress(companyId, period);
        result.put("monthlyProgress", monthlyProgress);
        
        return result;
    }
    
    /**
     * Get detailed project report
     */
    @Cacheable(value = "projectReport", key = "#projectId + '_' + #companyId")
    public ProjectReportDTO getProjectReport(Long projectId, Long companyId) {
        return projectRepository.findByIdAndCompanyId(projectId, companyId)
                .map(project -> {
                    ProjectReportDTO dto = new ProjectReportDTO();
                    dto.setId(project.getId().toString());
                    dto.setName(project.getName());
                    dto.setLocation(project.getLocation());
                    dto.setProgress(project.getProgressPercentage());
                    dto.setStatus(project.getStatus().name().toLowerCase());
                    dto.setStartDate(project.getStartDate().toString());
                    dto.setEndDate(project.getEndDate().toString());
                    dto.setBudget(project.getBudget());
                    
                    // Get units count
                    Long unitsCount = unitRepository.countByProjectId(projectId);
                    dto.setUnits(unitsCount.intValue());
                    
                    // Get completed units count (progress = 100%)
                    Long completedUnitsCount = unitRepository.countCompletedUnitsByProjectId(projectId);
                    dto.setCompletedUnits(completedUnitsCount.intValue());
                    
                    // Get teams count
                    List<Long> teamIds = teamRepository.findTeamsByProjectId(projectId)
                            .stream()
                            .map(team -> team.getId())
                            .collect(Collectors.toList());
                    dto.setTeams(teamIds.size());
                    
                    // Get categories count
                    Long categoriesCount = categoryRepository.countCategoriesByProjectId(projectId);
                    dto.setCategories(categoriesCount.intValue());
                    
                    // Get completed categories count
                    Long completedCategoriesCount = categoryRepository.countCompletedCategoriesByProjectId(projectId);
                    dto.setCompletedCategories(completedCategoriesCount.intValue());
                    
                    // Get delayed tasks count
                    Long delayedTasksCount = categoryTeamRepository.countDelayedTasksByProjectId(projectId);
                    dto.setDelayedTasks(delayedTasksCount.intValue());
                    
                    // Get spent amount
                    BigDecimal spentAmount = paymentRepository.getSpentAmountByProjectId(projectId);
                    dto.setSpent(spentAmount != null ? spentAmount.doubleValue() : 0);
                    
                    return dto;
                })
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }
    
    /**
     * Get projects report
     */
    private List<ProjectReportDTO> getProjectsReport(Long companyId) {
        return projectRepository.findByCompanyId(companyId)
                .stream()
                .map(project -> {
                    ProjectReportDTO dto = new ProjectReportDTO();
                    dto.setId(project.getId().toString());
                    dto.setName(project.getName());
                    dto.setLocation(project.getLocation());
                    dto.setProgress(project.getProgressPercentage());
                    dto.setStatus(project.getStatus().name().toLowerCase());
                    dto.setStartDate(project.getStartDate().toString());
                    dto.setEndDate(project.getEndDate().toString());
                    dto.setBudget(project.getBudget());
                    
                    // Get units count
                    Long unitsCount = unitRepository.countByProjectId(project.getId());
                    dto.setUnits(unitsCount.intValue());
                    
                    // Get completed units count (progress = 100%)
                    Long completedUnitsCount = unitRepository.countCompletedUnitsByProjectId(project.getId());
                    dto.setCompletedUnits(completedUnitsCount.intValue());
                    
                    // Get teams count
                    List<Long> teamIds = teamRepository.findTeamsByProjectId(project.getId())
                            .stream()
                            .map(team -> team.getId())
                            .collect(Collectors.toList());
                    dto.setTeams(teamIds.size());
                    
                    // Get categories count
                    Long categoriesCount = categoryRepository.countCategoriesByProjectId(project.getId());
                    dto.setCategories(categoriesCount.intValue());
                    
                    // Get completed categories count
                    Long completedCategoriesCount = categoryRepository.countCompletedCategoriesByProjectId(project.getId());
                    dto.setCompletedCategories(completedCategoriesCount.intValue());
                    
                    // Get delayed tasks count
                    Long delayedTasksCount = categoryTeamRepository.countDelayedTasksByProjectId(project.getId());
                    dto.setDelayedTasks(delayedTasksCount.intValue());
                    
                    // Get spent amount
                    BigDecimal spentAmount = paymentRepository.getSpentAmountByProjectId(project.getId());
                    dto.setSpent(spentAmount != null ? spentAmount.doubleValue() : 0);
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get team performance report
     */
    @Cacheable(value = "teamPerformanceReport", key = "#companyId")
    public List<TeamPerformanceDTO> getTeamPerformanceReport(Long companyId) {
        return analyticsService.getTeamPerformance(companyId);
    }
    
    /**
     * Get financial summary report
     */
    @Cacheable(value = "financialSummaryReport", key = "#companyId + '_' + #period")
    public FinancialSummaryDTO getFinancialSummary(Long companyId, String period) {
        // Get total budget from all projects
        BigDecimal totalBudget = projectRepository.findByCompanyId(companyId)
                .stream()
                .map(project -> project.getBudget() != null ? project.getBudget() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Get total spent
        BigDecimal totalSpent = paymentRepository.getTotalPaidAmount(companyId);
        if (totalSpent == null) totalSpent = BigDecimal.ZERO;
        
        // Get total remaining
        BigDecimal totalRemaining = totalBudget.subtract(totalSpent);
        
        // Get project financial details
        List<ProjectFinancialDTO> projectFinancials = projectRepository.findByCompanyId(companyId)
                .stream()
                .map(project -> {
                    BigDecimal spent = paymentRepository.getSpentAmountByProjectId(project.getId());
                    if (spent == null) spent = BigDecimal.ZERO;
                    
                    return new ProjectFinancialDTO(
                            project.getId().toString(),
                            project.getName(),
                            project.getBudget() != null ? project.getBudget() : BigDecimal.ZERO,
                            spent
                    );
                })
                .collect(Collectors.toList());
        
        return new FinancialSummaryDTO(
                totalBudget,
                totalSpent,
                totalRemaining,
                projectFinancials
        );
    }
    
    /**
     * Get monthly progress report
     */
    @Cacheable(value = "monthlyProgressReport", key = "#companyId + '_' + #period")
    public List<MonthlyProgressDTO> getMonthlyProgress(Long companyId, String period) {
        // Determine date range based on period
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;
        
        switch (period) {
            case "last-month":
                startDate = endDate.minusMonths(1);
                break;
            case "last-3-months":
                startDate = endDate.minusMonths(3);
                break;
            case "last-year":
                startDate = endDate.minusYears(1);
                break;
            case "last-6-months":
            default:
                startDate = endDate.minusMonths(6);
                break;
        }
        
        // Generate monthly data points
        List<MonthlyProgressDTO> progressData = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        
        YearMonth current = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate);
        
        while (!current.isAfter(end)) {
            LocalDate monthEnd = current.atEndOfMonth();
            
            // Calculate planned progress for this month
            double plannedProgress = calculatePlannedProgress(companyId, monthEnd);
            
            // Calculate actual progress for this month
            double actualProgress = calculateActualProgress(companyId, monthEnd);
            
            progressData.add(new MonthlyProgressDTO(
                    current.format(monthFormatter),
                    (int) Math.round(actualProgress),
                    (int) Math.round(plannedProgress)
            ));
            
            current = current.plusMonths(1);
        }
        
        return progressData;
    }
    
    // Helper methods
    
    private double calculatePlannedProgress(Long companyId, LocalDate date) {
        // Calculate planned progress based on project timelines
        List<Project> projects = projectRepository.findByCompanyId(companyId);
        
        if (projects.isEmpty()) {
            return 0;
        }
        
        double totalPlannedProgress = 0;
        
        for (Project project : projects) {
            LocalDate startDate = project.getStartDate();
            LocalDate endDate = project.getEndDate();
            
            if (date.isBefore(startDate)) {
                // Project hasn't started yet
                continue;
            } else if (date.isAfter(endDate)) {
                // Project should be complete
                totalPlannedProgress += 100;
            } else {
                // Project is in progress
                long totalDays = ChronoUnit.DAYS.between(startDate, endDate);
                long daysPassed = ChronoUnit.DAYS.between(startDate, date);
                
                if (totalDays > 0) {
                    double plannedProgress = (double) daysPassed / totalDays * 100;
                    totalPlannedProgress += plannedProgress;
                }
            }
        }
        
        return projects.isEmpty() ? 0 : totalPlannedProgress / projects.size();
    }
    
    private double calculateActualProgress(Long companyId, LocalDate date) {
        // Get projects as of the given date
        List<Project> projects = projectRepository.findByCompanyId(companyId);
        
        if (projects.isEmpty()) {
            return 0;
        }
        
        // For simplicity, we'll use the current progress percentage
        // In a real system, you would track historical progress
        double totalProgress = projects.stream()
                .mapToInt(Project::getProgressPercentage)
                .sum();
        
        return totalProgress / projects.size();
    }
}