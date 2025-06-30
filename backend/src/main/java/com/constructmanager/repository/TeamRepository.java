package com.constructmanager.repository;

import com.constructmanager.entity.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    
    /**
     * Find teams by company with pagination
     */
    Page<Team> findByCompanyIdAndIsActiveTrueOrderByNameAsc(Long companyId, Pageable pageable);
    
    /**
     * Find teams by company without pagination
     */
    List<Team> findByCompanyIdAndIsActiveTrueOrderByNameAsc(Long companyId);
    
    /**
     * Find teams by specialty
     */
    Page<Team> findByCompanyIdAndSpecialtyContainingIgnoreCaseAndIsActiveTrueOrderByNameAsc(
        Long companyId, String specialty, Pageable pageable);
    
    /**
     * Search teams by name or specialty
     */
    @Query("SELECT t FROM Team t " +
           "WHERE t.company.id = :companyId " +
           "AND t.isActive = true " +
           "AND (LOWER(t.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(t.specialty) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY t.name ASC")
    Page<Team> searchTeams(@Param("companyId") Long companyId, @Param("searchTerm") String searchTerm, Pageable pageable);
    
    /**
     * Find team by ID and company ID for security
     */
    Optional<Team> findByIdAndCompanyId(Long id, Long companyId);
    
    /**
     * Count active teams by company
     */
    Long countByCompanyIdAndIsActiveTrue(Long companyId);
    
    /**
     * Find teams working on a specific project
     */
    @Query("SELECT DISTINCT t FROM Team t " +
           "JOIN t.categoryTeams ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "WHERE u.project.id = :projectId " +
           "AND t.isActive = true " +
           "ORDER BY t.name ASC")
    List<Team> findTeamsByProjectId(@Param("projectId") Long projectId);
    
    /**
     * Get team performance metrics
     */
    @Query("SELECT t.id, t.name, " +
           "COUNT(ct.id) as totalAssignments, " +
           "COUNT(CASE WHEN ct.status = 'DONE' THEN 1 END) as completedAssignments, " +
           "AVG(ct.progressPercentage) as avgProgress " +
           "FROM Team t " +
           "LEFT JOIN t.categoryTeams ct " +
           "WHERE t.company.id = :companyId AND t.isActive = true " +
           "GROUP BY t.id, t.name " +
           "ORDER BY t.name ASC")
    Page<Object[]> getTeamPerformanceMetrics(@Param("companyId") Long companyId, Pageable pageable);
}