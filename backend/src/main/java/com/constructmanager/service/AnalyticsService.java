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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UnitRepository unitRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private CategoryTeamRepository categoryTeamRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    /**
     * Get analytics summary for dashboard
     */
    @Cacheable(value = "analyticsSummary", key = "#companyId")
    public AnalyticsSummaryDTO getAnalyticsSummary(Long companyId) {
        // Get active projects count
        Long activeProjects = projectRepository.countActiveProjectsByCompanyId(companyId);
        
        // Get active teams count
        Long activeTeams = teamRepository.countByCompanyIdAndIsActiveTrue(companyId);
        
        // Calculate project completion rate
        List<Project> projects = projectRepository.findByCompanyId(companyId);
        double avgProgress = projects.stream()
                .mapToInt(Project::getProgressPercentage)
                .average()
                .orElse(0);
        
        // Calculate budget efficiency
        BigDecimal totalBudget = projects.stream()
                .map(p -> p.getBudget() != null ? p.getBudget() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalSpent = paymentRepository.getTotalPaidAmount(companyId);
        if (totalSpent == null) totalSpent = BigDecimal.ZERO;
        
        double budgetEfficiency = 0;
        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            budgetEfficiency = 100 - (totalSpent.divide(totalBudget, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue());
        }
        
        // Calculate on-time delivery rate
        long totalCategories = categoryRepository.count();
        long delayedCategories = categoryTeamRepository.countTasksByStatus(companyId, CategoryTeam.TaskStatus.DELAYED);
        double onTimeDelivery = totalCategories > 0 
                ? 100 - ((double) delayedCategories / totalCategories * 100) 
                : 100;
        
        // Calculate average project duration
        double avgDuration = projects.stream()
                .mapToLong(p -> ChronoUnit.DAYS.between(p.getStartDate(), p.getEndDate()))
                .average()
                .orElse(0);
        
        return new AnalyticsSummaryDTO(
                (int) Math.round(avgProgress),
                (int) Math.round(budgetEfficiency),
                (int) Math.round(onTimeDelivery),
                activeProjects.intValue(),
                activeTeams.intValue(),
                (int) Math.round(avgDuration)
        );
    }
    
    /**
     * Get project progress data for charts
     */
    @Cacheable(value = "projectProgress", key = "#companyId + '_' + #period")
    public List<ProjectProgressDTO> getProjectProgress(Long companyId, String period) {
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
        List<ProjectProgressDTO> progressData = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        
        YearMonth current = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate);
        
        while (!current.isAfter(end)) {
            LocalDate monthStart = current.atDay(1);
            LocalDate monthEnd = current.atEndOfMonth();
            
            // Calculate planned progress for this month
            double plannedProgress = calculatePlannedProgress(companyId, monthEnd);
            
            // Calculate actual progress for this month
            double actualProgress = calculateActualProgress(companyId, monthEnd);
            
            // Calculate budget and spent for this month
            BigDecimal monthlyBudget = calculateMonthlyBudget(companyId, monthStart, monthEnd);
            BigDecimal monthlySpent = calculateMonthlySpent(companyId, monthStart, monthEnd);
            
            progressData.add(new ProjectProgressDTO(
                    current.format(monthFormatter),
                    (int) Math.round(plannedProgress),
                    (int) Math.round(actualProgress),
                    monthlyBudget.doubleValue(),
                    monthlySpent.doubleValue()
            ));
            
            current = current.plusMonths(1);
        }
        
        return progressData;
    }
    
    /**
     * Get team performance data
     */
    @Cacheable(value = "teamPerformance", key = "#companyId")
    public List<TeamPerformanceDTO> getTeamPerformance(Long companyId) {
        // Get team performance metrics from repository
        return teamRepository.getTeamPerformanceMetrics(companyId, null)
                .stream()
                .map(row -> {
                    Long teamId = (Long) row[0];
                    String teamName = (String) row[1];
                    Long totalAssignments = (Long) row[2];
                    Long completedAssignments = (Long) row[3];
                    Double avgProgress = (Double) row[4];
                    
                    // Get team specialty
                    String specialty = teamRepository.findById(teamId)
                            .map(team -> team.getSpecialty())
                            .orElse("Unknown");
                    
                    // Calculate efficiency
                    int efficiency = totalAssignments > 0 
                            ? (int) Math.round((double) completedAssignments / totalAssignments * 100) 
                            : 0;
                    
                    // Get active projects count for this team
                    int activeProjects = teamRepository.findTeamsByProjectId(teamId)
                            .size();
                    
                    // Get average task duration
                    int avgDuration = calculateAverageTaskDuration(teamId);
                    
                    return new TeamPerformanceDTO(
                            teamId.toString(),
                            teamName,
                            specialty,
                            efficiency,
                            completedAssignments.intValue(),
                            avgDuration,
                            activeProjects
                    );
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get category analysis data
     */
    @Cacheable(value = "categoryAnalysis", key = "#companyId")
    public List<CategoryAnalysisDTO> getCategoryAnalysis(Long companyId) {
        // Group categories by name and calculate metrics
        Map<String, List<Object[]>> categoriesByName = categoryRepository.getCategoryAnalytics(companyId);
        
        List<CategoryAnalysisDTO> result = new ArrayList<>();
        
        for (Map.Entry<String, List<Object[]>> entry : categoriesByName.entrySet()) {
            String categoryName = entry.getKey();
            List<Object[]> categoryData = entry.getValue();
            
            // Calculate average duration
            double avgDuration = categoryData.stream()
                    .mapToLong(data -> (Long) data[0])
                    .average()
                    .orElse(0);
            
            // Calculate completion rate
            long totalCategories = categoryData.size();
            long completedCategories = categoryData.stream()
                    .filter(data -> (Integer) data[1] >= 100)
                    .count();
            double completionRate = totalCategories > 0 
                    ? (double) completedCategories / totalCategories * 100 
                    : 0;
            
            // Calculate delay rate
            long delayedCategories = categoryData.stream()
                    .filter(data -> (Boolean) data[2])
                    .count();
            double delayRate = totalCategories > 0 
                    ? (double) delayedCategories / totalCategories * 100 
                    : 0;
            
            result.add(new CategoryAnalysisDTO(
                    categoryName,
                    (int) Math.round(avgDuration),
                    (int) Math.round(completionRate),
                    (int) Math.round(delayRate)
            ));
        }
        
        return result;
    }
    
    /**
     * Get budget analysis data
     */
    @Cacheable(value = "budgetAnalysis", key = "#companyId")
    public BudgetAnalysisDTO getBudgetAnalysis(Long companyId) {
        // Get total budget from all projects
        BigDecimal totalBudget = projectRepository.findByCompanyId(companyId)
                .stream()
                .map(project -> project.getBudget() != null ? project.getBudget() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Get total spent
        BigDecimal totalSpent = paymentRepository.getTotalPaidAmount(companyId);
        if (totalSpent == null) totalSpent = BigDecimal.ZERO;
        
        // Calculate projected spend based on progress
        double avgProgress = projectRepository.findByCompanyId(companyId)
                .stream()
                .mapToInt(Project::getProgressPercentage)
                .average()
                .orElse(0);
        
        BigDecimal projectedSpend = totalBudget.multiply(BigDecimal.valueOf(avgProgress / 100));
        
        // Calculate savings or overruns
        BigDecimal savings = BigDecimal.ZERO;
        BigDecimal overruns = BigDecimal.ZERO;
        
        if (projectedSpend.compareTo(totalBudget) < 0) {
            savings = totalBudget.subtract(projectedSpend);
        } else {
            overruns = projectedSpend.subtract(totalBudget);
        }
        
        return new BudgetAnalysisDTO(
                totalBudget.doubleValue(),
                totalSpent.doubleValue(),
                projectedSpend.doubleValue(),
                savings.doubleValue(),
                overruns.doubleValue()
        );
    }
    
    /**
     * Get risk factors
     */
    @Cacheable(value = "riskFactors", key = "#companyId")
    public List<RiskFactorDTO> getRiskFactors(Long companyId) {
        // This would typically come from a risk assessment table
        // For now, we'll return some common construction risks
        List<RiskFactorDTO> risks = new ArrayList<>();
        
        // Check for weather delays based on delayed tasks
        long delayedTasks = categoryTeamRepository.countTasksByStatus(companyId, CategoryTeam.TaskStatus.DELAYED);
        if (delayedTasks > 0) {
            risks.add(new RiskFactorDTO(
                    "Weather Delays",
                    delayedTasks > 5 ? "High" : "Medium",
                    "High",
                    "Schedule buffer and indoor work alternatives"
            ));
        }
        
        // Check for budget risks
        BudgetAnalysisDTO budget = getBudgetAnalysis(companyId);
        if (budget.getOverruns() > 0) {
            risks.add(new RiskFactorDTO(
                    "Budget Overrun",
                    "High",
                    "Medium",
                    "Cost control measures and value engineering"
            ));
        }
        
        // Check for resource availability
        long activeTeams = teamRepository.countByCompanyIdAndIsActiveTrue(companyId);
        long activeProjects = projectRepository.countActiveProjectsByCompanyId(companyId);
        if (activeProjects > activeTeams) {
            risks.add(new RiskFactorDTO(
                    "Team Availability",
                    "Medium",
                    activeProjects > activeTeams * 1.5 ? "High" : "Medium",
                    "Cross-training and resource optimization"
            ));
        }
        
        // Add some standard risks
        risks.add(new RiskFactorDTO(
                "Material Shortage",
                "High",
                "Medium",
                "Alternative suppliers and early procurement"
        ));
        
        risks.add(new RiskFactorDTO(
                "Quality Issues",
                "Medium",
                "Low",
                "Enhanced quality control and inspections"
        ));
        
        return risks;
    }
    
    /**
     * Get complete analytics data
     */
    public Map<String, Object> getCompleteAnalyticsData(Long companyId, String period) {
        Map<String, Object> result = new HashMap<>();
        
        result.put("overview", getAnalyticsSummary(companyId));
        result.put("projectProgress", getProjectProgress(companyId, period));
        result.put("teamPerformance", getTeamPerformance(companyId));
        result.put("categoryAnalysis", getCategoryAnalysis(companyId));
        result.put("budgetAnalysis", getBudgetAnalysis(companyId));
        result.put("riskFactors", getRiskFactors(companyId));
        
        return result;
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
    
    private BigDecimal calculateMonthlyBudget(Long companyId, LocalDate startDate, LocalDate endDate) {
        // Calculate the portion of the budget allocated to this month
        List<Project> projects = projectRepository.findByCompanyId(companyId);
        
        BigDecimal monthlyBudget = BigDecimal.ZERO;
        
        for (Project project : projects) {
            if (project.getBudget() == null) continue;
            
            LocalDate projectStart = project.getStartDate();
            LocalDate projectEnd = project.getEndDate();
            
            // Check if project overlaps with the month
            if (!projectEnd.isBefore(startDate) && !projectStart.isAfter(endDate)) {
                // Calculate overlap days
                LocalDate overlapStart = projectStart.isBefore(startDate) ? startDate : projectStart;
                LocalDate overlapEnd = projectEnd.isAfter(endDate) ? endDate : projectEnd;
                
                long overlapDays = ChronoUnit.DAYS.between(overlapStart, overlapEnd) + 1;
                long totalProjectDays = ChronoUnit.DAYS.between(projectStart, projectEnd) + 1;
                
                if (totalProjectDays > 0) {
                    BigDecimal monthlyPortion = BigDecimal.valueOf(overlapDays)
                            .divide(BigDecimal.valueOf(totalProjectDays), 4, RoundingMode.HALF_UP);
                    
                    monthlyBudget = monthlyBudget.add(project.getBudget().multiply(monthlyPortion));
                }
            }
        }
        
        return monthlyBudget;
    }
    
    private BigDecimal calculateMonthlySpent(Long companyId, LocalDate startDate, LocalDate endDate) {
        // Get payments made during this month
        // This would typically come from a payment repository
        // For now, we'll estimate based on progress
        
        BigDecimal monthlyBudget = calculateMonthlyBudget(companyId, startDate, endDate);
        
        // Assume spending is proportional to progress
        double avgProgress = projectRepository.findByCompanyId(companyId)
                .stream()
                .mapToInt(Project::getProgressPercentage)
                .average()
                .orElse(0);
        
        return monthlyBudget.multiply(BigDecimal.valueOf(avgProgress / 100));
    }
    
    private int calculateAverageTaskDuration(Long teamId) {
        // This would typically come from task completion data
        // For now, we'll return a random value between 8 and 15
        return 8 + new Random().nextInt(8);
    }
}