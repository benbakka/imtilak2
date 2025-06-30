package com.constructmanager.service;

import com.constructmanager.dto.*;
import com.constructmanager.entity.Project;
import com.constructmanager.entity.Unit;
import com.constructmanager.repository.ProjectRepository;
import com.constructmanager.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class UnitService {
    
    @Autowired
    private UnitRepository unitRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UnitMapper unitMapper;
    
    /**
     * Get paginated unit summaries for a project
     */
    @Cacheable(value = "unitSummaries", key = "#projectId + '_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<UnitSummaryDTO> getUnitSummaries(Long projectId, Pageable pageable) {
        return unitRepository.findUnitSummariesByProjectId(projectId, pageable);
    }
    
    /**
     * Get unit summaries by type
     */
    public Page<UnitSummaryDTO> getUnitSummariesByType(Long projectId, Unit.UnitType type, Pageable pageable) {
        return unitRepository.findUnitSummariesByProjectIdAndType(projectId, type, pageable);
    }
    
    /**
     * Search units by name
     */
    public Page<UnitSummaryDTO> searchUnits(Long projectId, String searchTerm, Pageable pageable) {
        return unitRepository.searchUnitSummaries(projectId, searchTerm, pageable);
    }
    
    /**
     * Get detailed unit information
     */
    @Cacheable(value = "unitDetails", key = "#unitId + '_' + #projectId")
    public Optional<UnitDetailDTO> getUnitDetail(Long unitId, Long projectId) {
        return unitRepository.findByIdAndProjectId(unitId, projectId)
                .map(unitMapper::toDetailDTO);
    }
    
    /**
     * Create new unit
     */
    @Transactional
    public Optional<UnitDetailDTO> createUnit(Long projectId, Long companyId, UnitCreateDTO unitCreateDTO) {
        return projectRepository.findByIdAndCompanyId(projectId, companyId)
                .map(project -> {
                    Unit unit = unitMapper.toEntity(unitCreateDTO);
                    unit.setProject(project);
                    Unit savedUnit = unitRepository.save(unit);
                    return unitMapper.toDetailDTO(savedUnit);
                });
    }
    
    /**
     * Update existing unit
     */
    @Transactional
    public Optional<UnitDetailDTO> updateUnit(Long unitId, Long projectId, UnitUpdateDTO unitUpdateDTO) {
        return unitRepository.findByIdAndProjectId(unitId, projectId)
                .map(existingUnit -> {
                    unitMapper.updateEntity(existingUnit, unitUpdateDTO);
                    Unit savedUnit = unitRepository.save(existingUnit);
                    return unitMapper.toDetailDTO(savedUnit);
                });
    }
    
    /**
     * Delete unit
     */
    @Transactional
    public boolean deleteUnit(Long unitId, Long projectId) {
        return unitRepository.findByIdAndProjectId(unitId, projectId)
                .map(unit -> {
                    unitRepository.delete(unit);
                    return true;
                })
                .orElse(false);
    }
    
    /**
     * Count units by project
     */
    public Long countUnitsByProject(Long projectId) {
        return unitRepository.countByProjectId(projectId);
    }
    
    /**
     * Count units by type for a project
     */
    public Long countUnitsByProjectAndType(Long projectId, Unit.UnitType type) {
        return unitRepository.countByProjectIdAndType(projectId, type);
    }
}