package com.constructmanager.repository;

import com.constructmanager.dto.UnitSummaryDTO;
import com.constructmanager.entity.Unit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {
    
    /**
     * Find units by project with pagination - returns only summary data
     */
    @Query("SELECT new com.constructmanager.dto.UnitSummaryDTO(" +
           "u.id, u.name, u.type, u.floor, u.area, u.progressPercentage, " +
           "COUNT(DISTINCT c.id), " +
           "COUNT(DISTINCT ct.team.id)) " +
           "FROM Unit u " +
           "LEFT JOIN u.categories c " +
           "LEFT JOIN c.categoryTeams ct " +
           "WHERE u.project.id = :projectId " +
           "GROUP BY u.id, u.name, u.type, u.floor, u.area, u.progressPercentage " +
           "ORDER BY u.createdAt ASC")
    Page<UnitSummaryDTO> findUnitSummariesByProjectId(@Param("projectId") Long projectId, Pageable pageable);
    
    /**
     * Find units by type with pagination
     */
    @Query("SELECT new com.constructmanager.dto.UnitSummaryDTO(" +
           "u.id, u.name, u.type, u.floor, u.area, u.progressPercentage, " +
           "COUNT(DISTINCT c.id), " +
           "COUNT(DISTINCT ct.team.id)) " +
           "FROM Unit u " +
           "LEFT JOIN u.categories c " +
           "LEFT JOIN c.categoryTeams ct " +
           "WHERE u.project.id = :projectId AND u.type = :type " +
           "GROUP BY u.id, u.name, u.type, u.floor, u.area, u.progressPercentage " +
           "ORDER BY u.createdAt ASC")
    Page<UnitSummaryDTO> findUnitSummariesByProjectIdAndType(
        @Param("projectId") Long projectId, 
        @Param("type") Unit.UnitType type, 
        Pageable pageable);
    
    /**
     * Search units by name
     */
    @Query("SELECT new com.constructmanager.dto.UnitSummaryDTO(" +
           "u.id, u.name, u.type, u.floor, u.area, u.progressPercentage, " +
           "COUNT(DISTINCT c.id), " +
           "COUNT(DISTINCT ct.team.id)) " +
           "FROM Unit u " +
           "LEFT JOIN u.categories c " +
           "LEFT JOIN c.categoryTeams ct " +
           "WHERE u.project.id = :projectId " +
           "AND LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "GROUP BY u.id, u.name, u.type, u.floor, u.area, u.progressPercentage " +
           "ORDER BY u.createdAt ASC")
    Page<UnitSummaryDTO> searchUnitSummaries(
        @Param("projectId") Long projectId,
        @Param("searchTerm") String searchTerm,
        Pageable pageable);
    
    /**
     * Find unit by ID and project ID for security
     */
    Optional<Unit> findByIdAndProjectId(Long id, Long projectId);
    
    /**
     * Count units by project
     */
    Long countByProjectId(Long projectId);
    
    /**
     * Count units by type for a project
     */
    Long countByProjectIdAndType(Long projectId, Unit.UnitType type);
    
    /**
     * Count completed units by project
     */
    @Query("SELECT COUNT(u) FROM Unit u WHERE u.project.id = :projectId AND u.progressPercentage = 100")
    Long countCompletedUnitsByProjectId(@Param("projectId") Long projectId);

    List<Unit> findByProjectId(Long projectId);
}