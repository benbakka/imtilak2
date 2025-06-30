package com.constructmanager.repository;

import com.constructmanager.dto.ProjectSummaryDTO;
import com.constructmanager.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * Find projects by company with pagination - returns only summary data
     */
    @Query("SELECT new com.constructmanager.dto.ProjectSummaryDTO(" +
            "p.id, p.name, p.location, p.startDate, p.endDate, p.status, p.progressPercentage, p.budget, " +
            "COUNT(DISTINCT u.id), " +
            "COUNT(DISTINCT ct.team.id)) " +
            "FROM Project p " +
            "LEFT JOIN p.units u " +
            "LEFT JOIN u.categories c " +
            "LEFT JOIN c.categoryTeams ct " +
            "WHERE p.company.id = :companyId " +
            "GROUP BY p.id, p.name, p.location, p.startDate, p.endDate, p.status, p.progressPercentage, p.budget " +
            "ORDER BY p.createdAt DESC")
    Page<ProjectSummaryDTO> findProjectSummariesByCompanyId(@Param("companyId") Long companyId, Pageable pageable);

    /**
     * Find projects by status with pagination
     */
    @Query("SELECT new com.constructmanager.dto.ProjectSummaryDTO(" +
            "p.id, p.name, p.location, p.startDate, p.endDate, p.status, p.progressPercentage, p.budget, " +
            "COUNT(DISTINCT u.id), " +
            "COUNT(DISTINCT ct.team.id)) " +
            "FROM Project p " +
            "LEFT JOIN p.units u " +
            "LEFT JOIN u.categories c " +
            "LEFT JOIN c.categoryTeams ct " +
            "WHERE p.company.id = :companyId AND p.status = :status " +
            "GROUP BY p.id, p.name, p.location, p.startDate, p.endDate, p.status, p.progressPercentage, p.budget " +
            "ORDER BY p.createdAt DESC")
    Page<ProjectSummaryDTO> findProjectSummariesByCompanyIdAndStatus(
            @Param("companyId") Long companyId,
            @Param("status") Project.ProjectStatus status,
            Pageable pageable);

    /**
     * Find projects by date range
     */
    @Query("SELECT new com.constructmanager.dto.ProjectSummaryDTO(" +
            "p.id, p.name, p.location, p.startDate, p.endDate, p.status, p.progressPercentage, p.budget, " +
            "COUNT(DISTINCT u.id), " +
            "COUNT(DISTINCT ct.team.id)) " +
            "FROM Project p " +
            "LEFT JOIN p.units u " +
            "LEFT JOIN u.categories c " +
            "LEFT JOIN c.categoryTeams ct " +
            "WHERE p.company.id = :companyId " +
            "AND p.startDate >= :startDate AND p.endDate <= :endDate " +
            "GROUP BY p.id, p.name, p.location, p.startDate, p.endDate, p.status, p.progressPercentage, p.budget " +
            "ORDER BY p.createdAt DESC")
    Page<ProjectSummaryDTO> findProjectSummariesByCompanyIdAndDateRange(
            @Param("companyId") Long companyId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    /**
     * Search projects by name or location
     */
    @Query("SELECT new com.constructmanager.dto.ProjectSummaryDTO(" +
            "p.id, p.name, p.location, p.startDate, p.endDate, p.status, p.progressPercentage, p.budget, " +
            "COUNT(DISTINCT u.id), " +
            "COUNT(DISTINCT ct.team.id)) " +
            "FROM Project p " +
            "LEFT JOIN p.units u " +
            "LEFT JOIN u.categories c " +
            "LEFT JOIN c.categoryTeams ct " +
            "WHERE p.company.id = :companyId " +
            "AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(p.location) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "GROUP BY p.id, p.name, p.location, p.startDate, p.endDate, p.status, p.progressPercentage, p.budget " +
            "ORDER BY p.createdAt DESC")
    Page<ProjectSummaryDTO> searchProjectSummaries(
            @Param("companyId") Long companyId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    /**
     * Find project by ID and company ID for security
     */
    Optional<Project> findByIdAndCompanyId(Long id, Long companyId);

    /**
     * Count active projects for dashboard
     */
    @Query("SELECT COUNT(p) FROM Project p WHERE p.company.id = :companyId AND p.status = 'ACTIVE'")
    Long countActiveProjectsByCompanyId(@Param("companyId") Long companyId);

    /**
     * Get projects with delayed tasks
     */
    @Query("SELECT DISTINCT p FROM Project p " +
            "JOIN p.units u " +
            "JOIN u.categories c " +
            "JOIN c.categoryTeams ct " +
            "WHERE p.company.id = :companyId " +
            "AND ct.status = 'DELAYED'")
    Page<Project> findProjectsWithDelayedTasks(@Param("companyId") Long companyId, Pageable pageable);

    /**
     * Find all projects by company ID
     */
    @Query("SELECT p FROM Project p WHERE p.company.id = :companyId")
    List<Project> findByCompanyId(@Param("companyId") Long companyId);
}