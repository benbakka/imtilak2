package com.constructmanager.controller;

import com.constructmanager.dto.*;
import com.constructmanager.entity.Category;
import com.constructmanager.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;
    
    /**
     * Get categories by unit
     * GET /api/v1/categories?unitId=1&page=0&size=10
     */
    @GetMapping
    public ResponseEntity<List<CategoryDetailDTO>> getCategories(@RequestParam Long unitId) {
        List<CategoryDetailDTO> categories = categoryService.getCategoriesByUnit(unitId);
        return ResponseEntity.ok(categories);
    }
    
    /**
     * Get categories by unit with pagination
     * GET /api/v1/categories/paginated?unitId=1&page=0&size=10
     */
    @GetMapping("/paginated")
    public ResponseEntity<Page<Category>> getCategoriesPaginated(
            @RequestParam Long unitId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "orderSequence") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sort);
        
        Page<Category> categories = categoryService.getCategoriesByUnit(unitId, pageable);
        return ResponseEntity.ok(categories);
    }
    
    /**
     * Get detailed category information
     * GET /api/v1/categories/{id}?unitId=1
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDetailDTO> getCategory(
            @PathVariable Long id,
            @RequestParam Long unitId) {
        
        return categoryService.getCategoryDetail(id, unitId)
                .map(category -> ResponseEntity.ok(category))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create new category
     * POST /api/v1/categories?unitId=1&projectId=1
     */
    @PostMapping
    public ResponseEntity<CategoryDetailDTO> createCategory(
            @RequestParam Long unitId,
            @RequestParam Long projectId,
            @Valid @RequestBody CategoryCreateDTO categoryCreateDTO) {
        
        return categoryService.createCategory(unitId, projectId, categoryCreateDTO)
                .map(category -> ResponseEntity.status(HttpStatus.CREATED).body(category))
                .orElse(ResponseEntity.badRequest().build());
    }
    
    /**
     * Update existing category
     * PUT /api/v1/categories/{id}?unitId=1
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryDetailDTO> updateCategory(
            @PathVariable Long id,
            @RequestParam Long unitId,
            @Valid @RequestBody CategoryUpdateDTO categoryUpdateDTO) {
        
        return categoryService.updateCategory(id, unitId, categoryUpdateDTO)
                .map(category -> ResponseEntity.ok(category))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete category
     * DELETE /api/v1/categories/{id}?unitId=1
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id,
            @RequestParam Long unitId) {
        
        boolean deleted = categoryService.deleteCategory(id, unitId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
    
    /**
     * Get categories with delayed tasks
     * GET /api/v1/categories/delayed?companyId=1
     */
    @GetMapping("/delayed")
    public ResponseEntity<Page<Category>> getCategoriesWithDelayedTasks(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Category> categories = categoryService.getCategoriesWithDelayedTasks(companyId, pageable);
        return ResponseEntity.ok(categories);
    }
    
    /**
     * Get categories starting soon
     * GET /api/v1/categories/starting-soon?companyId=1&daysAhead=7
     */
    @GetMapping("/starting-soon")
    public ResponseEntity<Page<Category>> getCategoriesStartingSoon(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "7") int daysAhead,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Category> categories = categoryService.getCategoriesStartingSoon(companyId, daysAhead, pageable);
        return ResponseEntity.ok(categories);
    }
    
    /**
     * Get overdue categories
     * GET /api/v1/categories/overdue?companyId=1
     */
    @GetMapping("/overdue")
    public ResponseEntity<Page<Category>> getOverdueCategories(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Category> categories = categoryService.getOverdueCategories(companyId, pageable);
        return ResponseEntity.ok(categories);
    }
    
    /**
     * Count categories by unit
     * GET /api/v1/categories/count?unitId=1
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countCategories(@RequestParam Long unitId) {
        Long count = categoryService.countCategoriesByUnit(unitId);
        return ResponseEntity.ok(count);
    }
}