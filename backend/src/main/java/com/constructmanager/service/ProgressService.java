package com.constructmanager.service;

import com.constructmanager.entity.Category;
import com.constructmanager.entity.CategoryTeam;
import com.constructmanager.entity.Project;
import com.constructmanager.entity.Unit;
import com.constructmanager.repository.CategoryRepository;
import com.constructmanager.repository.CategoryTeamRepository;
import com.constructmanager.repository.ProjectRepository;
import com.constructmanager.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProgressService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryTeamRepository categoryTeamRepository;

    /**
     * Update project progress based on its units' progress
     */
    public Project updateProjectProgress(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + projectId));

        List<Unit> units = unitRepository.findByProjectId(projectId);
        
        if (units.isEmpty()) {
            project.setProgressPercentage(0);
        } else {
            int totalProgress = 0;
            for (Unit unit : units) {
                totalProgress += unit.getProgressPercentage();
            }
            int averageProgress = totalProgress / units.size();
            project.setProgressPercentage(averageProgress);
        }

        return projectRepository.save(project);
    }
    
    /**
     * Update project progress with a manually specified percentage
     */
    public Project updateProjectProgress(Long projectId, Integer progressPercentage) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + projectId));

        // Ensure progressPercentage is between 0 and 100
        progressPercentage = Math.max(0, Math.min(100, progressPercentage));
        project.setProgressPercentage(progressPercentage);

        return projectRepository.save(project);
    }

    /**
     * Update unit progress based on its categories' progress
     */
    public Unit updateUnitProgress(Long unitId) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new IllegalArgumentException("Unit not found with ID: " + unitId));

        List<Category> categories = categoryRepository.findByUnitIdOrderByOrderSequenceAsc(unitId);
        
        if (categories.isEmpty()) {
            unit.setProgressPercentage(0);
        } else {
            int totalProgress = 0;
            for (Category category : categories) {
                totalProgress += category.getProgressPercentage();
            }
            int averageProgress = totalProgress / categories.size();
            unit.setProgressPercentage(averageProgress);
        }

        Unit savedUnit = unitRepository.save(unit);
        
        // Update parent project progress
        updateProjectProgress(unit.getProject().getId());
        
        return savedUnit;
    }

    /**
     * Update category progress based on its teams' progress
     */
    public Category updateCategoryProgress(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + categoryId));

        List<CategoryTeam> categoryTeams = categoryTeamRepository.findByCategoryIdOrderByCreatedAtAsc(categoryId);
        
        if (categoryTeams.isEmpty()) {
            category.setProgressPercentage(0);
        } else {
            int totalProgress = 0;
            for (CategoryTeam categoryTeam : categoryTeams) {
                totalProgress += categoryTeam.getProgressPercentage();
            }
            int averageProgress = totalProgress / categoryTeams.size();
            category.setProgressPercentage(averageProgress);
        }

        Category savedCategory = categoryRepository.save(category);
        
        // Update parent unit progress
        updateUnitProgress(category.getUnit().getId());
        
        return savedCategory;
    }

    /**
     * Update progress for a CategoryTeam and propagate changes up the hierarchy
     */
    public CategoryTeam updateCategoryTeamProgress(Long categoryTeamId, Integer progressPercentage) {
        CategoryTeam categoryTeam = categoryTeamRepository.findById(categoryTeamId)
                .orElseThrow(() -> new IllegalArgumentException("CategoryTeam not found with ID: " + categoryTeamId));

        // Ensure progressPercentage is between 0 and 100
        progressPercentage = Math.max(0, Math.min(100, progressPercentage));
        categoryTeam.setProgressPercentage(progressPercentage);

        CategoryTeam savedCategoryTeam = categoryTeamRepository.save(categoryTeam);
        
        // Update parent category progress
        updateCategoryProgress(categoryTeam.getCategory().getId());
        
        return savedCategoryTeam;
    }
}