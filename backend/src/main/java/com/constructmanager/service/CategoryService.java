package com.constructmanager.service;

import com.constructmanager.dto.*;
import com.constructmanager.entity.Category;
import com.constructmanager.repository.CategoryRepository;
import com.constructmanager.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UnitRepository unitRepository;
    
    @Autowired
    private CategoryMapper categoryMapper;
    
    /**
     * Get categories by unit with pagination
     */
    public Page<Category> getCategoriesByUnit(Long unitId, Pageable pageable) {
        return categoryRepository.findByUnitIdOrderByOrderSequenceAsc(unitId, pageable);
    }
    
    /**
     * Get all categories by unit (for detailed views)
     */
    @Cacheable(value = "categoryDetails", key = "#unitId")
    public List<CategoryDetailDTO> getCategoriesByUnit(Long unitId) {
        return categoryRepository.findByUnitIdOrderByOrderSequenceAsc(unitId)
                .stream()
                .map(categoryMapper::toDetailDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get detailed category information
     */
    @Cacheable(value = "categoryDetails", key = "#categoryId + '_' + #unitId")
    public Optional<CategoryDetailDTO> getCategoryDetail(Long categoryId, Long unitId) {
        return categoryRepository.findByIdAndUnitId(categoryId, unitId)
                .map(categoryMapper::toDetailDTO);
    }
    
    /**
     * Create new category
     */
    @Transactional
    public Optional<CategoryDetailDTO> createCategory(Long unitId, Long projectId, CategoryCreateDTO categoryCreateDTO) {
        return unitRepository.findByIdAndProjectId(unitId, projectId)
                .map(unit -> {
                    Category category = categoryMapper.toEntity(categoryCreateDTO);
                    category.setUnit(unit);
                    
                    // Set order sequence if not provided
                    if (category.getOrderSequence() == null) {
                        Integer nextOrder = categoryRepository.getNextOrderSequence(unitId);
                        category.setOrderSequence(nextOrder);
                    }
                    
                    Category savedCategory = categoryRepository.save(category);
                    return categoryMapper.toDetailDTO(savedCategory);
                });
    }
    
    /**
     * Update existing category
     */
    @Transactional
    public Optional<CategoryDetailDTO> updateCategory(Long categoryId, Long unitId, CategoryUpdateDTO categoryUpdateDTO) {
        return categoryRepository.findByIdAndUnitId(categoryId, unitId)
                .map(existingCategory -> {
                    categoryMapper.updateEntity(existingCategory, categoryUpdateDTO);
                    Category savedCategory = categoryRepository.save(existingCategory);
                    return categoryMapper.toDetailDTO(savedCategory);
                });
    }
    
    /**
     * Delete category
     */
    @Transactional
    public boolean deleteCategory(Long categoryId, Long unitId) {
        return categoryRepository.findByIdAndUnitId(categoryId, unitId)
                .map(category -> {
                    categoryRepository.delete(category);
                    return true;
                })
                .orElse(false);
    }
    
    /**
     * Get categories with delayed tasks
     */
    public Page<Category> getCategoriesWithDelayedTasks(Long companyId, Pageable pageable) {
        return categoryRepository.findCategoriesWithDelayedTasks(companyId, pageable);
    }
    
    /**
     * Get categories starting soon
     */
    public Page<Category> getCategoriesStartingSoon(Long companyId, int daysAhead, Pageable pageable) {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(daysAhead);
        return categoryRepository.findCategoriesStartingSoon(companyId, today, futureDate, pageable);
    }
    
    /**
     * Get overdue categories
     */
    public Page<Category> getOverdueCategories(Long companyId, Pageable pageable) {
        LocalDate today = LocalDate.now();
        return categoryRepository.findOverdueCategories(companyId, today, pageable);
    }
    
    /**
     * Count categories by unit
     */
    public Long countCategoriesByUnit(Long unitId) {
        return categoryRepository.countByUnitId(unitId);
    }
}