package com.constructmanager.repository;

import com.constructmanager.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    /**
     * Find categories by unit with pagination, ordered by sequence
     */
    Page<Category> findByUnitIdOrderByOrderSequenceAsc(Long unitId, Pageable pageable);
    
    /**
     * Find categories by unit without pagination, ordered by sequence
     */
    List<Category> findByUnitIdOrderByOrderSequenceAsc(Long unitId);
    
    /**
     * Find category by ID and unit ID for security
     */
    Optional<Category> findByIdAndUnitId(Long id, Long unitId);
    
    /**
     * Find categories with delayed tasks
     */
    @Query("SELECT DISTINCT c FROM Category c " +
           "JOIN c.categoryTeams ct " +
           "WHERE c.unit.project.company.id = :companyId " +
           "AND ct.status = 'DELAYED'")
    Page<Category> findCategoriesWithDelayedTasks(@Param("companyId") Long companyId, Pageable pageable);
    
    /**
     * Find categories starting soon (within specified days)
     */
    @Query("SELECT c FROM Category c " +
           "WHERE c.unit.project.company.id = :companyId " +
           "AND c.startDate BETWEEN :today AND :futureDate " +
           "ORDER BY c.startDate ASC")
    Page<Category> findCategoriesStartingSoon(
        @Param("companyId") Long companyId,
        @Param("today") LocalDate today,
        @Param("futureDate") LocalDate futureDate,
        Pageable pageable);
    
    /**
     * Find overdue categories
     */
    @Query("SELECT c FROM Category c " +
           "WHERE c.unit.project.company.id = :companyId " +
           "AND c.endDate < :today " +
           "AND c.progressPercentage < 100 " +
           "ORDER BY c.endDate ASC")
    Page<Category> findOverdueCategories(@Param("companyId") Long companyId, @Param("today") LocalDate today, Pageable pageable);
    
    /**
     * Count categories by unit
     */
    Long countByUnitId(Long unitId);
    
    /**
     * Get next order sequence for a unit
     */
    @Query("SELECT COALESCE(MAX(c.orderSequence), 0) + 1 FROM Category c WHERE c.unit.id = :unitId")
    Integer getNextOrderSequence(@Param("unitId") Long unitId);
    
    /**
     * Count categories by project
     */
    @Query("SELECT COUNT(c) FROM Category c JOIN c.unit u WHERE u.project.id = :projectId")
    Long countCategoriesByProjectId(@Param("projectId") Long projectId);
    
    /**
     * Count completed categories by project
     */
    @Query("SELECT COUNT(c) FROM Category c JOIN c.unit u WHERE u.project.id = :projectId AND c.progressPercentage = 100")
    Long countCompletedCategoriesByProjectId(@Param("projectId") Long projectId);
    
    /**
     * Get category analytics grouped by name
     */
    @Query("SELECT c.name, " +
           "DATEDIFF(c.endDate, c.startDate) as duration, " +
           "c.progressPercentage, " +
           "CASE WHEN c.endDate < CURRENT_DATE AND c.progressPercentage < 100 THEN true ELSE false END as isDelayed " +
           "FROM Category c " +
           "WHERE c.unit.project.company.id = :companyId")
    List<Object[]> getCategoryAnalyticsRaw(@Param("companyId") Long companyId);
    
    /**
     * Get category analytics grouped by name
     */
    default Map<String, List<Object[]>> getCategoryAnalytics(Long companyId) {
        List<Object[]> rawData = getCategoryAnalyticsRaw(companyId);
        
        return rawData.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        row -> (String) row[0]
                ));
    }
}