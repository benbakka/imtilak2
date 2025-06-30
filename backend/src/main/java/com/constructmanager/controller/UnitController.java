package com.constructmanager.controller;

import com.constructmanager.dto.*;
import com.constructmanager.entity.Unit;
import com.constructmanager.service.UnitService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/units")
@CrossOrigin(origins = "*")
public class UnitController {
    
    @Autowired
    private UnitService unitService;
    
    /**
     * Get paginated unit summaries for a project
     * GET /api/v1/units?projectId=1&page=0&size=10&sort=name,asc&type=VILLA
     */
    @GetMapping
    public ResponseEntity<Page<UnitSummaryDTO>> getUnits(
            @RequestParam Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) Unit.UnitType type,
            @RequestParam(required = false) String search) {
        
        // Create pageable with sorting
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sort);
        
        Page<UnitSummaryDTO> units;
        
        if (search != null && !search.trim().isEmpty()) {
            units = unitService.searchUnits(projectId, search.trim(), pageable);
        } else if (type != null) {
            units = unitService.getUnitSummariesByType(projectId, type, pageable);
        } else {
            units = unitService.getUnitSummaries(projectId, pageable);
        }
        
        return ResponseEntity.ok(units);
    }
    
    /**
     * Get detailed unit information
     * GET /api/v1/units/{id}?projectId=1
     */
    @GetMapping("/{id}")
    public ResponseEntity<UnitDetailDTO> getUnit(
            @PathVariable Long id,
            @RequestParam Long projectId) {
        
        return unitService.getUnitDetail(id, projectId)
                .map(unit -> ResponseEntity.ok(unit))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create new unit
     * POST /api/v1/units?projectId=1&companyId=1
     */
    @PostMapping
    public ResponseEntity<UnitDetailDTO> createUnit(
            @RequestParam Long projectId,
            @RequestParam Long companyId,
            @Valid @RequestBody UnitCreateDTO unitCreateDTO) {
        
        return unitService.createUnit(projectId, companyId, unitCreateDTO)
                .map(unit -> ResponseEntity.status(HttpStatus.CREATED).body(unit))
                .orElse(ResponseEntity.badRequest().build());
    }
    
    /**
     * Update existing unit
     * PUT /api/v1/units/{id}?projectId=1
     */
    @PutMapping("/{id}")
    public ResponseEntity<UnitDetailDTO> updateUnit(
            @PathVariable Long id,
            @RequestParam Long projectId,
            @Valid @RequestBody UnitUpdateDTO unitUpdateDTO) {
        
        return unitService.updateUnit(id, projectId, unitUpdateDTO)
                .map(unit -> ResponseEntity.ok(unit))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete unit
     * DELETE /api/v1/units/{id}?projectId=1
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(
            @PathVariable Long id,
            @RequestParam Long projectId) {
        
        boolean deleted = unitService.deleteUnit(id, projectId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
    
    /**
     * Count units by project
     * GET /api/v1/units/count?projectId=1
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countUnits(@RequestParam Long projectId) {
        Long count = unitService.countUnitsByProject(projectId);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Count units by type for a project
     * GET /api/v1/units/count/type?projectId=1&type=VILLA
     */
    @GetMapping("/count/type")
    public ResponseEntity<Long> countUnitsByType(
            @RequestParam Long projectId,
            @RequestParam Unit.UnitType type) {
        Long count = unitService.countUnitsByProjectAndType(projectId, type);
        return ResponseEntity.ok(count);
    }
}