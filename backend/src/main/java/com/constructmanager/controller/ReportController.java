package com.constructmanager.controller;

import com.constructmanager.dto.*;
import com.constructmanager.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "*")
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    /**
     * Get report data for overview
     * GET /api/v1/reports/data?companyId=1&period=last-6-months&projectId=1
     */
    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getReportData(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "last-6-months") String period,
            @RequestParam(required = false) Long projectId) {
        
        Map<String, Object> reportData = reportService.getReportData(companyId, period, projectId);
        return ResponseEntity.ok(reportData);
    }
    
    /**
     * Get project details for report
     * GET /api/v1/reports/projects/{id}?companyId=1
     */
    @GetMapping("/projects/{id}")
    public ResponseEntity<ProjectReportDTO> getProjectReport(
            @PathVariable Long id,
            @RequestParam Long companyId) {
        
        ProjectReportDTO projectReport = reportService.getProjectReport(id, companyId);
        return ResponseEntity.ok(projectReport);
    }
    
    /**
     * Get team performance report
     * GET /api/v1/reports/team-performance?companyId=1
     */
    @GetMapping("/team-performance")
    public ResponseEntity<List<TeamPerformanceDTO>> getTeamPerformanceReport(@RequestParam Long companyId) {
        List<TeamPerformanceDTO> teamData = reportService.getTeamPerformanceReport(companyId);
        return ResponseEntity.ok(teamData);
    }
    
    /**
     * Get financial summary report
     * GET /api/v1/reports/financial-summary?companyId=1&period=last-6-months
     */
    @GetMapping("/financial-summary")
    public ResponseEntity<FinancialSummaryDTO> getFinancialSummary(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "last-6-months") String period) {
        
        FinancialSummaryDTO financialData = reportService.getFinancialSummary(companyId, period);
        return ResponseEntity.ok(financialData);
    }
    
    /**
     * Get monthly progress report
     * GET /api/v1/reports/monthly-progress?companyId=1&period=last-6-months
     */
    @GetMapping("/monthly-progress")
    public ResponseEntity<List<MonthlyProgressDTO>> getMonthlyProgress(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "last-6-months") String period) {
        
        List<MonthlyProgressDTO> progressData = reportService.getMonthlyProgress(companyId, period);
        return ResponseEntity.ok(progressData);
    }
}