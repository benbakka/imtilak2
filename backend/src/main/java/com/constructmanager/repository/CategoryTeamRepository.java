package com.constructmanager.repository;

import com.constructmanager.entity.CategoryTeam;
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
public interface CategoryTeamRepository extends JpaRepository<CategoryTeam, Long> {
    
    /**
     * Find category teams by category
     */
    List<CategoryTeam> findByCategoryIdOrderByCreatedAtAsc(Long categoryId);
    
    /**
     * Find category teams by team
     */
    Page<CategoryTeam> findByTeamIdOrderByCreatedAtDesc(Long teamId, Pageable pageable);
    
    /**
     * Find category team by category and team
     */
    Optional<CategoryTeam> findByCategoryIdAndTeamId(Long categoryId, Long teamId);
    
    /**
     * Find delayed tasks for alerts
     */
    @Query("SELECT ct FROM CategoryTeam ct " +
           "JOIN ct.category c " +
           "WHERE c.unit.project.company.id = :companyId " +
           "AND ct.status = 'DELAYED' " +
           "ORDER BY c.endDate ASC")
    Page<CategoryTeam> findDelayedTasks(@Param("companyId") Long companyId, Pageable pageable);
    
    /**
     * Find tasks starting soon for alerts
     */
    @Query("SELECT ct FROM CategoryTeam ct " +
           "JOIN ct.category c " +
           "WHERE c.unit.project.company.id = :companyId " +
           "AND ct.status = 'NOT_STARTED' " +
           "AND c.startDate BETWEEN :today AND :futureDate " +
           "ORDER BY c.startDate ASC")
    Page<CategoryTeam> findTasksStartingSoon(
        @Param("companyId") Long companyId,
        @Param("today") LocalDate today,
        @Param("futureDate") LocalDate futureDate,
        Pageable pageable);
    
    /**
     * Find tasks by status
     */
    @Query("SELECT ct FROM CategoryTeam ct " +
           "JOIN ct.category c " +
           "WHERE c.unit.project.company.id = :companyId " +
           "AND ct.status = :status " +
           "ORDER BY ct.updatedAt DESC")
    Page<CategoryTeam> findTasksByStatus(
        @Param("companyId") Long companyId,
        @Param("status") CategoryTeam.TaskStatus status,
        Pageable pageable);
    
    /**
     * Count tasks by status for dashboard
     */
    @Query("SELECT COUNT(ct) FROM CategoryTeam ct " +
           "JOIN ct.category c " +
           "WHERE c.unit.project.company.id = :companyId " +
           "AND ct.status = :status")
    Long countTasksByStatus(@Param("companyId") Long companyId, @Param("status") CategoryTeam.TaskStatus status);
    
    /**
     * Find tasks requiring payment
     */
    @Query("SELECT ct FROM CategoryTeam ct " +
           "JOIN ct.category c " +
           "WHERE c.unit.project.company.id = :companyId " +
           "AND ct.status = 'DONE' " +
           "AND ct.receptionStatus = true " +
           "AND ct.paymentStatus = false " +
           "ORDER BY ct.updatedAt ASC")
    Page<CategoryTeam> findTasksRequiringPayment(@Param("companyId") Long companyId, Pageable pageable);
    
    /**
     * Get team workload
     */
    @Query("SELECT ct.team.id, ct.team.name, " +
           "COUNT(ct.id) as totalTasks, " +
           "COUNT(CASE WHEN ct.status = 'IN_PROGRESS' THEN 1 END) as activeTasks " +
           "FROM CategoryTeam ct " +
           "JOIN ct.category c " +
           "WHERE c.unit.project.company.id = :companyId " +
           "GROUP BY ct.team.id, ct.team.name " +
           "ORDER BY activeTasks DESC")
    Page<Object[]> getTeamWorkload(@Param("companyId") Long companyId, Pageable pageable);
    
    /**
     * Count delayed tasks by project
     */
    @Query("SELECT COUNT(ct) FROM CategoryTeam ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "WHERE u.project.id = :projectId " +
           "AND ct.status = 'DELAYED'")
    Long countDelayedTasksByProjectId(@Param("projectId") Long projectId);
}