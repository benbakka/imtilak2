package com.constructmanager.service;

import com.constructmanager.dto.*;
import com.constructmanager.entity.Project;
import com.constructmanager.entity.Unit;
import com.constructmanager.repository.ProjectRepository;
import com.constructmanager.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional(readOnly = true)
public class UnitService {

    private static final Logger logger = LoggerFactory.getLogger(UnitService.class);

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
    @CacheEvict(value = "unitSummaries", allEntries = true)
    public Optional<UnitDetailDTO> createUnit(Long projectId, Long companyId, UnitCreateDTO unitCreateDTO) {
        logger.info("UnitService: createUnit called with projectId = {}, companyId = {}", projectId, companyId);

        Optional<Project> projectOptional = projectRepository.findByIdAndCompanyId(projectId, companyId);
        logger.info("UnitService: projectRepository.findByIdAndCompanyId returned present = {}", projectOptional.isPresent());

        return projectOptional
                .map(project -> {
                    Unit unit = unitMapper.toEntity(unitCreateDTO);
                    unit.setProject(project);
                    Unit savedUnit = unitRepository.save(unit);
                    return unitMapper.toDetailDTO(savedUnit);
                })
                .or(() -> {
                    logger.warn("UnitService: Project not found with ID: {} for company ID: {}", projectId, companyId);
                    throw new IllegalArgumentException("Project not found with ID: " + projectId + " for company ID: " + companyId);
                });
    }

    /**
     * Update existing unit
     */
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "unitSummaries", allEntries = true),
            @CacheEvict(value = "unitDetails", key = "#unitId + '_' + #projectId")
    })
    public Optional<UnitDetailDTO> updateUnit(Long unitId, Long projectId, UnitUpdateDTO unitUpdateDTO) {
        return unitRepository.findByIdAndProjectId(unitId, projectId)
                .map(existingUnit -> {
                    unitMapper.updateEntity(existingUnit, unitUpdateDTO);
                    Unit savedUnit = unitRepository.save(existingUnit);
                    return unitMapper.toDetailDTO(savedUnit);
                })
                .or(() -> {
                    throw new IllegalArgumentException("Unit not found with ID: " + unitId + " for project ID: " + projectId);
                });
    }

    /**
     * Delete unit
     */
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "unitSummaries", allEntries = true),
            @CacheEvict(value = "unitDetails", key = "#unitId + '_' + #projectId")
    })
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
