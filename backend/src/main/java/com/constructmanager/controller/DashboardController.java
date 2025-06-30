package com.constructmanager.controller;

import com.constructmanager.dto.DashboardStatsDTO;
import com.constructmanager.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {
    
    @Autowired
    private DashboardService dashboardService;
    
    /**
     * Get comprehensive dashboard statistics
     * GET /api/v1/dashboard/stats?companyId=1
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(@RequestParam Long companyId) {
        DashboardStatsDTO stats = dashboardService.getDashboardStats(companyId);
        return ResponseEntity.ok(stats);
    }
}