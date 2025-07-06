package com.constructmanager.controller;

import com.constructmanager.dto.*;
import com.constructmanager.entity.CategoryTeam;
import com.constructmanager.service.CategoryTeamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category-teams")
@CrossOrigin(origins = "*")
public class CategoryTeamController {
    
    @Autowired
    private CategoryTeamService categoryTeamService;
    
    /**
     * Get category teams by category
     * GET /api/v1/category-teams?categoryId=1
     */
    @GetMapping
    public ResponseEntity<List<CategoryTeam>> getCategoryTeamsByCategory(@RequestParam Long categoryId) {
        List<CategoryTeam> categoryTeams = categoryTeamService.getCategoryTeamsByCategory(categoryId);
        return ResponseEntity.ok(categoryTeams);
    }
    
    /**
     * Get category teams by team
     * GET /api/v1/category-teams/team/{teamId}
     */
    @GetMapping("/team/{teamId}")
    public ResponseEntity<Page<CategoryTeam>> getCategoryTeamsByTeam(
            @PathVariable Long teamId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CategoryTeam> categoryTeams = categoryTeamService.getCategoryTeamsByTeam(teamId, pageable);
        return ResponseEntity.ok(categoryTeams);
    }
    
    /**
     * Get specific category team assignment
     * GET /api/v1/category-teams/{categoryId}/{teamId}
     */
    @GetMapping("/{categoryId}/{teamId}")
    public ResponseEntity<CategoryTeam> getCategoryTeam(
            @PathVariable Long categoryId,
            @PathVariable Long teamId) {
        
        return categoryTeamService.getCategoryTeam(categoryId, teamId)
                .map(categoryTeam -> ResponseEntity.ok(categoryTeam))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create category team assignment
     * POST /api/v1/category-teams?categoryId=1
     */
    @PostMapping
    public ResponseEntity<CategoryTeam> createCategoryTeam(
            @RequestParam Long categoryId,
            @Valid @RequestBody CategoryTeamCreateDTO dto) {
        
        return categoryTeamService.createCategoryTeam(categoryId, dto)
                .map(categoryTeam -> ResponseEntity.status(HttpStatus.CREATED).body(categoryTeam))
                .orElse(ResponseEntity.badRequest().build());
    }
    
    /**
     * Update category team assignment
     * PUT /api/v1/category-teams/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryTeam> updateCategoryTeam(
            @PathVariable Long id,
            @Valid @RequestBody CategoryTeamUpdateDTO dto) {
        
        try {
            CategoryTeam updatedCategoryTeam = categoryTeamService.updateCategoryTeam(id, dto);
            return ResponseEntity.ok(updatedCategoryTeam);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete category team assignment
     * DELETE /api/v1/category-teams/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategoryTeam(@PathVariable Long id) {
        boolean deleted = categoryTeamService.deleteCategoryTeam(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
    
    /**
     * Get delayed tasks for alerts
     * GET /api/v1/category-teams/delayed?companyId=1
     */
    @GetMapping("/delayed")
    public ResponseEntity<Page<CategoryTeam>> getDelayedTasks(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CategoryTeam> tasks = categoryTeamService.getDelayedTasks(companyId, pageable);
        return ResponseEntity.ok(tasks);
    }
    
    /**
     * Get tasks starting soon for alerts
     * GET /api/v1/category-teams/starting-soon?companyId=1&daysAhead=7
     */
    @GetMapping("/starting-soon")
    public ResponseEntity<Page<CategoryTeam>> getTasksStartingSoon(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "7") int daysAhead,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CategoryTeam> tasks = categoryTeamService.getTasksStartingSoon(companyId, daysAhead, pageable);
        return ResponseEntity.ok(tasks);
    }
    
    /**
     * Get tasks by status
     * GET /api/v1/category-teams/status/{status}?companyId=1
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<CategoryTeam>> getTasksByStatus(
            @PathVariable CategoryTeam.TaskStatus status,
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CategoryTeam> tasks = categoryTeamService.getTasksByStatus(companyId, status, pageable);
        return ResponseEntity.ok(tasks);
    }
    
    /**
     * Count tasks by status for dashboard
     * GET /api/v1/category-teams/count/{status}?companyId=1
     */
    @GetMapping("/count/{status}")
    public ResponseEntity<Long> countTasksByStatus(
            @PathVariable CategoryTeam.TaskStatus status,
            @RequestParam Long companyId) {
        
        Long count = categoryTeamService.countTasksByStatus(companyId, status);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Get tasks requiring payment
     * GET /api/v1/category-teams/requiring-payment?companyId=1
     */
    @GetMapping("/requiring-payment")
    public ResponseEntity<Page<CategoryTeam>> getTasksRequiringPayment(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CategoryTeam> tasks = categoryTeamService.getTasksRequiringPayment(companyId, pageable);
        return ResponseEntity.ok(tasks);
    }
    
    /**
     * Get team workload
     * GET /api/v1/category-teams/workload?companyId=1
     */
    @GetMapping("/workload")
    public ResponseEntity<Page<Object[]>> getTeamWorkload(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Object[]> workload = categoryTeamService.getTeamWorkload(companyId, pageable);
        return ResponseEntity.ok(workload);
    }
}