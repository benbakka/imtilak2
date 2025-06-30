package com.constructmanager.repository;

import com.constructmanager.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    /**
     * Find payments by company with pagination
     */
    @Query("SELECT p FROM Payment p " +
           "JOIN p.categoryTeam ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "JOIN u.project pr " +
           "WHERE pr.company.id = :companyId " +
           "ORDER BY p.createdAt DESC")
    Page<Payment> findByCompanyId(@Param("companyId") Long companyId, Pageable pageable);
    
    /**
     * Find payments by status
     */
    @Query("SELECT p FROM Payment p " +
           "JOIN p.categoryTeam ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "JOIN u.project pr " +
           "WHERE pr.company.id = :companyId " +
           "AND p.status = :status " +
           "ORDER BY p.createdAt DESC")
    Page<Payment> findByCompanyIdAndStatus(
        @Param("companyId") Long companyId, 
        @Param("status") Payment.PaymentStatus status, 
        Pageable pageable);
    
    /**
     * Find payments by project
     */
    @Query("SELECT p FROM Payment p " +
           "JOIN p.categoryTeam ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "WHERE u.project.id = :projectId " +
           "ORDER BY p.createdAt DESC")
    Page<Payment> findByProjectId(@Param("projectId") Long projectId, Pageable pageable);
    
    /**
     * Find payments requiring approval
     */
    @Query("SELECT p FROM Payment p " +
           "JOIN p.categoryTeam ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "JOIN u.project pr " +
           "WHERE pr.company.id = :companyId " +
           "AND p.status = 'PENDING' " +
           "ORDER BY p.dueDate ASC")
    Page<Payment> findRequiringApproval(@Param("companyId") Long companyId, Pageable pageable);
    
    /**
     * Find overdue payments
     */
    @Query("SELECT p FROM Payment p " +
           "JOIN p.categoryTeam ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "JOIN u.project pr " +
           "WHERE pr.company.id = :companyId " +
           "AND p.status IN ('PENDING', 'APPROVED') " +
           "AND p.dueDate < :today " +
           "ORDER BY p.dueDate ASC")
    Page<Payment> findOverduePayments(
        @Param("companyId") Long companyId, 
        @Param("today") LocalDate today, 
        Pageable pageable);
    
    /**
     * Find payments by category team
     */
    Page<Payment> findByCategoryTeamId(Long categoryTeamId, Pageable pageable);
    
    /**
     * Find payment by ID and company ID for security
     */
    @Query("SELECT p FROM Payment p " +
           "JOIN p.categoryTeam ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "JOIN u.project pr " +
           "WHERE p.id = :id " +
           "AND pr.company.id = :companyId")
    Optional<Payment> findByIdAndCompanyId(@Param("id") Long id, @Param("companyId") Long companyId);
    
    /**
     * Get total paid amount for a company
     */
    @Query("SELECT SUM(p.amount) FROM Payment p " +
           "JOIN p.categoryTeam ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "JOIN u.project pr " +
           "WHERE pr.company.id = :companyId " +
           "AND p.status = 'PAID'")
    BigDecimal getTotalPaidAmount(@Param("companyId") Long companyId);
    
    /**
     * Get total pending amount for a company
     */
    @Query("SELECT SUM(p.amount) FROM Payment p " +
           "JOIN p.categoryTeam ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "JOIN u.project pr " +
           "WHERE pr.company.id = :companyId " +
           "AND p.status IN ('PENDING', 'APPROVED')")
    BigDecimal getTotalPendingAmount(@Param("companyId") Long companyId);
    
    /**
     * Get total overdue amount for a company
     */
    @Query("SELECT SUM(p.amount) FROM Payment p " +
           "JOIN p.categoryTeam ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "JOIN u.project pr " +
           "WHERE pr.company.id = :companyId " +
           "AND p.status IN ('PENDING', 'APPROVED') " +
           "AND p.dueDate < :today")
    BigDecimal getTotalOverdueAmount(@Param("companyId") Long companyId, @Param("today") LocalDate today);
    
    /**
     * Count payments requiring approval
     */
    @Query("SELECT COUNT(p) FROM Payment p " +
           "JOIN p.categoryTeam ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "JOIN u.project pr " +
           "WHERE pr.company.id = :companyId " +
           "AND p.status = 'PENDING'")
    Long countPaymentsRequiringApproval(@Param("companyId") Long companyId);
    
    /**
     * Get payments for this month
     */
    @Query("SELECT SUM(p.amount) FROM Payment p " +
           "JOIN p.categoryTeam ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "JOIN u.project pr " +
           "WHERE pr.company.id = :companyId " +
           "AND p.status = 'PAID' " +
           "AND YEAR(p.paidDate) = YEAR(:today) " +
           "AND MONTH(p.paidDate) = MONTH(:today)")
    BigDecimal getPaymentsThisMonth(@Param("companyId") Long companyId, @Param("today") LocalDate today);
    
    /**
     * Get spent amount by project
     */
    @Query("SELECT SUM(p.amount) FROM Payment p " +
           "JOIN p.categoryTeam ct " +
           "JOIN ct.category c " +
           "JOIN c.unit u " +
           "WHERE u.project.id = :projectId " +
           "AND p.status = 'PAID'")
    BigDecimal getSpentAmountByProjectId(@Param("projectId") Long projectId);
}