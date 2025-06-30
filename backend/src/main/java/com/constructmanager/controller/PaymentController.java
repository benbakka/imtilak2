package com.constructmanager.controller;

import com.constructmanager.dto.*;
import com.constructmanager.entity.Payment;
import com.constructmanager.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    /**
     * Get paginated payments
     * GET /api/v1/payments?companyId=1&page=0&size=10&status=PENDING&projectId=1
     */
    @GetMapping
    public ResponseEntity<Page<Payment>> getPayments(
            @RequestParam Long companyId,
            @RequestParam(required = false) Payment.PaymentStatus status,
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sort);
        
        Page<Payment> payments;
        
        if (status != null) {
            payments = paymentService.getPaymentsByStatus(companyId, status, pageable);
        } else if (projectId != null) {
            payments = paymentService.getPaymentsByProject(projectId, pageable);
        } else {
            payments = paymentService.getPayments(companyId, pageable);
        }
        
        return ResponseEntity.ok(payments);
    }
    
    /**
     * Get payment details
     * GET /api/v1/payments/{id}?companyId=1
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentDetailDTO> getPayment(
            @PathVariable Long id,
            @RequestParam Long companyId) {
        
        return paymentService.getPaymentDetail(id, companyId)
                .map(payment -> ResponseEntity.ok(payment))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create new payment
     * POST /api/v1/payments
     */
    @PostMapping
    public ResponseEntity<PaymentDetailDTO> createPayment(
            @Valid @RequestBody PaymentCreateDTO paymentCreateDTO) {
        
        return paymentService.createPayment(paymentCreateDTO)
                .map(payment -> ResponseEntity.status(HttpStatus.CREATED).body(payment))
                .orElse(ResponseEntity.badRequest().build());
    }
    
    /**
     * Update existing payment
     * PUT /api/v1/payments/{id}?companyId=1
     */
    @PutMapping("/{id}")
    public ResponseEntity<PaymentDetailDTO> updatePayment(
            @PathVariable Long id,
            @RequestParam Long companyId,
            @Valid @RequestBody PaymentUpdateDTO paymentUpdateDTO) {
        
        return paymentService.updatePayment(id, companyId, paymentUpdateDTO)
                .map(payment -> ResponseEntity.ok(payment))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete payment
     * DELETE /api/v1/payments/{id}?companyId=1
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(
            @PathVariable Long id,
            @RequestParam Long companyId) {
        
        boolean deleted = paymentService.deletePayment(id, companyId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
    
    /**
     * Get payment summary for dashboard
     * GET /api/v1/payments/summary?companyId=1
     */
    @GetMapping("/summary")
    public ResponseEntity<PaymentSummaryDTO> getPaymentSummary(@RequestParam Long companyId) {
        PaymentSummaryDTO summary = paymentService.getPaymentSummary(companyId);
        return ResponseEntity.ok(summary);
    }
    
    /**
     * Get payments requiring approval
     * GET /api/v1/payments/requiring-approval?companyId=1
     */
    @GetMapping("/requiring-approval")
    public ResponseEntity<Page<Payment>> getPaymentsRequiringApproval(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Payment> payments = paymentService.getPaymentsRequiringApproval(companyId, pageable);
        return ResponseEntity.ok(payments);
    }
    
    /**
     * Get overdue payments
     * GET /api/v1/payments/overdue?companyId=1
     */
    @GetMapping("/overdue")
    public ResponseEntity<Page<Payment>> getOverduePayments(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Payment> payments = paymentService.getOverduePayments(companyId, pageable);
        return ResponseEntity.ok(payments);
    }
    
    /**
     * Approve payment
     * POST /api/v1/payments/{id}/approve?companyId=1
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<PaymentDetailDTO> approvePayment(
            @PathVariable Long id,
            @RequestParam Long companyId) {
        
        return paymentService.approvePayment(id, companyId)
                .map(payment -> ResponseEntity.ok(payment))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Mark payment as paid
     * POST /api/v1/payments/{id}/paid?companyId=1
     */
    @PostMapping("/{id}/paid")
    public ResponseEntity<PaymentDetailDTO> markAsPaid(
            @PathVariable Long id,
            @RequestParam Long companyId,
            @RequestBody Map<String, String> payload) {
        
        String paymentMethod = payload.get("paymentMethod");
        if (paymentMethod == null || paymentMethod.isEmpty()) {
            paymentMethod = "bank_transfer"; // Default payment method
        }
        
        return paymentService.markAsPaid(id, companyId, paymentMethod)
                .map(payment -> ResponseEntity.ok(payment))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update payment statuses (e.g., mark as overdue)
     * This endpoint would typically be called by a scheduled task
     * POST /api/v1/payments/update-statuses
     */
    @PostMapping("/update-statuses")
    public ResponseEntity<Void> updatePaymentStatuses() {
        paymentService.updatePaymentStatuses();
        return ResponseEntity.ok().build();
    }
}