package com.constructmanager.service;

import com.constructmanager.dto.PaymentCreateDTO;
import com.constructmanager.dto.PaymentDetailDTO;
import com.constructmanager.dto.PaymentSummaryDTO;
import com.constructmanager.dto.PaymentUpdateDTO;
import com.constructmanager.entity.Payment;
import com.constructmanager.repository.CategoryTeamRepository;
import com.constructmanager.repository.PaymentRepository;
import com.constructmanager.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private CategoryTeamRepository categoryTeamRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private PaymentMapper paymentMapper;
    
    /**
     * Get paginated payments for a company
     */
    @Cacheable(value = "payments", key = "#companyId + '_' + #pageable.pageNumber")
    public Page<Payment> getPayments(Long companyId, Pageable pageable) {
        return paymentRepository.findByCompanyId(companyId, pageable);
    }
    
    /**
     * Get payments by status
     */
    public Page<Payment> getPaymentsByStatus(Long companyId, Payment.PaymentStatus status, Pageable pageable) {
        return paymentRepository.findByCompanyIdAndStatus(companyId, status, pageable);
    }
    
    /**
     * Get payments by project
     */
    public Page<Payment> getPaymentsByProject(Long projectId, Pageable pageable) {
        return paymentRepository.findByProjectId(projectId, pageable);
    }
    
    /**
     * Get payments requiring approval
     */
    public Page<Payment> getPaymentsRequiringApproval(Long companyId, Pageable pageable) {
        return paymentRepository.findRequiringApproval(companyId, pageable);
    }
    
    /**
     * Get overdue payments
     */
    public Page<Payment> getOverduePayments(Long companyId, Pageable pageable) {
        LocalDate today = LocalDate.now();
        return paymentRepository.findOverduePayments(companyId, today, pageable);
    }
    
    /**
     * Get detailed payment information
     */
    @Cacheable(value = "paymentDetails", key = "#paymentId + '_' + #companyId")
    public Optional<PaymentDetailDTO> getPaymentDetail(Long paymentId, Long companyId) {
        return paymentRepository.findByIdAndCompanyId(paymentId, companyId)
                .map(paymentMapper::toDetailDTO);
    }
    
    /**
     * Create new payment
     */
    @Transactional
    @CacheEvict(value = {"payments", "paymentSummary"}, allEntries = true)
    public Optional<PaymentDetailDTO> createPayment(PaymentCreateDTO paymentCreateDTO) {
        return categoryTeamRepository.findById(paymentCreateDTO.getCategoryTeamId())
                .map(categoryTeam -> {
                    Payment payment = paymentMapper.toEntity(paymentCreateDTO);
                    payment.setCategoryTeam(categoryTeam);
                    
                    // Generate invoice number if not provided
                    if (payment.getInvoiceNumber() == null || payment.getInvoiceNumber().isEmpty()) {
                        payment.setInvoiceNumber(generateInvoiceNumber());
                    }
                    
                    Payment savedPayment = paymentRepository.save(payment);
                    return paymentMapper.toDetailDTO(savedPayment);
                });
    }
    
    /**
     * Update existing payment
     */
    @Transactional
    @CacheEvict(value = {"payments", "paymentDetails", "paymentSummary"}, allEntries = true)
    public Optional<PaymentDetailDTO> updatePayment(Long paymentId, Long companyId, PaymentUpdateDTO paymentUpdateDTO) {
        return paymentRepository.findByIdAndCompanyId(paymentId, companyId)
                .map(existingPayment -> {
                    paymentMapper.updateEntity(existingPayment, paymentUpdateDTO);
                    
                    // Check if payment is being marked as paid
                    if (paymentUpdateDTO.getStatus() == Payment.PaymentStatus.PAID && existingPayment.getPaidDate() == null) {
                        existingPayment.setPaidDate(LocalDate.now());
                    }
                    
                    Payment savedPayment = paymentRepository.save(existingPayment);
                    return paymentMapper.toDetailDTO(savedPayment);
                });
    }
    
    /**
     * Delete payment
     */
    @Transactional
    @CacheEvict(value = {"payments", "paymentSummary"}, allEntries = true)
    public boolean deletePayment(Long paymentId, Long companyId) {
        return paymentRepository.findByIdAndCompanyId(paymentId, companyId)
                .map(payment -> {
                    paymentRepository.delete(payment);
                    return true;
                })
                .orElse(false);
    }
    
    /**
     * Approve payment
     */
    @Transactional
    @CacheEvict(value = {"payments", "paymentDetails", "paymentSummary"}, allEntries = true)
    public Optional<PaymentDetailDTO> approvePayment(Long paymentId, Long companyId) {
        return paymentRepository.findByIdAndCompanyId(paymentId, companyId)
                .map(payment -> {
                    if (payment.getStatus() == Payment.PaymentStatus.PENDING) {
                        payment.setStatus(Payment.PaymentStatus.APPROVED);
                        Payment savedPayment = paymentRepository.save(payment);
                        return paymentMapper.toDetailDTO(savedPayment);
                    }
                    return paymentMapper.toDetailDTO(payment);
                });
    }
    
    /**
     * Mark payment as paid
     */
    @Transactional
    @CacheEvict(value = {"payments", "paymentDetails", "paymentSummary"}, allEntries = true)
    public Optional<PaymentDetailDTO> markAsPaid(Long paymentId, Long companyId, String paymentMethod) {
        return paymentRepository.findByIdAndCompanyId(paymentId, companyId)
                .map(payment -> {
                    if (payment.getStatus() == Payment.PaymentStatus.PENDING || 
                        payment.getStatus() == Payment.PaymentStatus.APPROVED ||
                        payment.getStatus() == Payment.PaymentStatus.OVERDUE) {
                        payment.setStatus(Payment.PaymentStatus.PAID);
                        payment.setPaidDate(LocalDate.now());
                        payment.setPaymentMethod(paymentMethod);
                        
                        // Update category team payment status
                        payment.getCategoryTeam().setPaymentStatus(true);
                        
                        Payment savedPayment = paymentRepository.save(payment);
                        return paymentMapper.toDetailDTO(savedPayment);
                    }
                    return paymentMapper.toDetailDTO(payment);
                });
    }
    
    /**
     * Get payment summary for dashboard
     */
    @Cacheable(value = "paymentSummary", key = "#companyId")
    public PaymentSummaryDTO getPaymentSummary(Long companyId) {
        LocalDate today = LocalDate.now();
        
        // Get total budget from all projects
        BigDecimal totalBudget = projectRepository.findByCompanyId(companyId)
                .stream()
                .map(project -> project.getBudget() != null ? project.getBudget() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Get payment statistics
        BigDecimal totalPaid = paymentRepository.getTotalPaidAmount(companyId);
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;
        
        BigDecimal totalPending = paymentRepository.getTotalPendingAmount(companyId);
        if (totalPending == null) totalPending = BigDecimal.ZERO;
        
        BigDecimal totalOverdue = paymentRepository.getTotalOverdueAmount(companyId, today);
        if (totalOverdue == null) totalOverdue = BigDecimal.ZERO;
        
        BigDecimal paymentsThisMonth = paymentRepository.getPaymentsThisMonth(companyId, today);
        if (paymentsThisMonth == null) paymentsThisMonth = BigDecimal.ZERO;
        
        Long pendingApprovals = paymentRepository.countPaymentsRequiringApproval(companyId);
        
        return new PaymentSummaryDTO(
            totalBudget,
            totalPaid,
            totalPending,
            totalOverdue,
            paymentsThisMonth,
            pendingApprovals
        );
    }
    
    /**
     * Generate a unique invoice number
     */
    private String generateInvoiceNumber() {
        LocalDate now = LocalDate.now();
        String prefix = "INV-" + now.getYear() + "-";
        long count = paymentRepository.count() + 1;
        return prefix + String.format("%04d", count);
    }
    
    /**
     * Update payment statuses (e.g., mark as overdue)
     * This should be called by a scheduled task
     */
    @Transactional
    @CacheEvict(value = {"payments", "paymentSummary"}, allEntries = true)
    public void updatePaymentStatuses() {
        LocalDate today = LocalDate.now();
        
        // Find payments that are due but not paid
        List<Payment> overduePayments = paymentRepository.findAll().stream()
                .filter(p -> (p.getStatus() == Payment.PaymentStatus.PENDING || p.getStatus() == Payment.PaymentStatus.APPROVED)
                        && p.getDueDate() != null && p.getDueDate().isBefore(today))
                .collect(Collectors.toList());
        
        // Mark them as overdue
        for (Payment payment : overduePayments) {
            payment.setStatus(Payment.PaymentStatus.OVERDUE);
            paymentRepository.save(payment);
        }
    }
}