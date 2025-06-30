package com.constructmanager.controller;

import com.constructmanager.dto.*;
import com.constructmanager.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {
    
    @Autowired
    private AnalyticsService analyticsService;
    
    /**
     * Get analytics summary for dashboard
     * GET /api/v1/analytics/summary?companyId=1
     */
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDTO> getAnalyticsSummary(@RequestParam Long companyId) {
        AnalyticsSummaryDTO summary = analyticsService.getAnalyticsSummary(companyId);
        return ResponseEntity.ok(summary);
    }
    
    /**
     * Get project progress data for charts
     * GET /api/v1/analytics/project-progress?companyId=1&period=last-6-months
     */
    @GetMapping("/project-progress")
    public ResponseEntity<List<ProjectProgressDTO>> getProjectProgress(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "last-6-months") String period) {
        
        List<ProjectProgressDTO> progressData = analyticsService.getProjectProgress(companyId, period);
        return ResponseEntity.ok(progressData);
    }
    
    /**
     * Get team performance data
     * GET /api/v1/analytics/team-performance?companyId=1
     */
    @GetMapping("/team-performance")
    public ResponseEntity<List<TeamPerformanceDTO>> getTeamPerformance(@RequestParam Long companyId) {
        List<TeamPerformanceDTO> teamData = analyticsService.getTeamPerformance(companyId);
        return ResponseEntity.ok(teamData);
    }
    
    /**
     * Get category analysis data
     * GET /api/v1/analytics/category-analysis?companyId=1
     */
    @GetMapping("/category-analysis")
    public ResponseEntity<List<CategoryAnalysisDTO>> getCategoryAnalysis(@RequestParam Long companyId) {
        List<CategoryAnalysisDTO> categoryData = analyticsService.getCategoryAnalysis(companyId);
        return ResponseEntity.ok(categoryData);
    }
    
    /**
     * Get budget analysis data
     * GET /api/v1/analytics/budget-analysis?companyId=1
     */
    @GetMapping("/budget-analysis")
    public ResponseEntity<BudgetAnalysisDTO> getBudgetAnalysis(@RequestParam Long companyId) {
        BudgetAnalysisDTO budgetData = analyticsService.getBudgetAnalysis(companyId);
        return ResponseEntity.ok(budgetData);
    }
    
    /**
     * Get risk factors
     * GET /api/v1/analytics/risk-factors?companyId=1
     */
    @GetMapping("/risk-factors")
    public ResponseEntity<List<RiskFactorDTO>> getRiskFactors(@RequestParam Long companyId) {
        List<RiskFactorDTO> riskFactors = analyticsService.getRiskFactors(companyId);
        return ResponseEntity.ok(riskFactors);
    }
    
    /**
     * Get complete analytics data
     * GET /api/v1/analytics/complete?companyId=1&period=last-6-months
     */
    @GetMapping("/complete")
    public ResponseEntity<Map<String, Object>> getCompleteAnalyticsData(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "last-6-months") String period) {
        
        Map<String, Object> completeData = analyticsService.getCompleteAnalyticsData(companyId, period);
        return ResponseEntity.ok(completeData);
    }
}