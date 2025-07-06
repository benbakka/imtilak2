package com.constructmanager.controller;

import com.constructmanager.entity.Category;
import com.constructmanager.entity.CategoryTeam;
import com.constructmanager.entity.Project;
import com.constructmanager.entity.Unit;
import com.constructmanager.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/progress")
@CrossOrigin(origins = "*")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    /**
     * Update project progress based on its units
     * PUT /api/v1/progress/project/{id}
     */
    @PutMapping("/project/{id}")
    public ResponseEntity<Project> updateProjectProgress(
            @PathVariable Long id,
            @RequestParam(required = false) Integer progressPercentage) {
        try {
            Project project;
            if (progressPercentage != null) {
                project = progressService.updateProjectProgress(id, progressPercentage);
            } else {
                project = progressService.updateProjectProgress(id);
            }
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update unit progress based on its categories
     * PUT /api/v1/progress/unit/{id}
     */
    @PutMapping("/unit/{id}")
    public ResponseEntity<Unit> updateUnitProgress(@PathVariable Long id) {
        try {
            Unit unit = progressService.updateUnitProgress(id);
            return ResponseEntity.ok(unit);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update category progress based on its teams
     * PUT /api/v1/progress/category/{id}
     */
    @PutMapping("/category/{id}")
    public ResponseEntity<Category> updateCategoryProgress(@PathVariable Long id) {
        try {
            Category category = progressService.updateCategoryProgress(id);
            return ResponseEntity.ok(category);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update category team progress and propagate changes up the hierarchy
     * PUT /api/v1/progress/category-team/{id}
     */
    @PutMapping("/category-team/{id}")
    public ResponseEntity<CategoryTeam> updateCategoryTeamProgress(
            @PathVariable Long id,
            @RequestParam Integer progressPercentage) {
        try {
            CategoryTeam categoryTeam = progressService.updateCategoryTeamProgress(id, progressPercentage);
            return ResponseEntity.ok(categoryTeam);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}