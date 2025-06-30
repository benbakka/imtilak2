package com.constructmanager.service;

import com.constructmanager.dto.*;
import com.constructmanager.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {
    
    /**
     * Convert Payment entity to detailed DTO
     */
    public PaymentDetailDTO toDetailDTO(Payment payment) {
        PaymentDetailDTO dto = new PaymentDetailDTO();
        dto.setId(payment.getId());
        dto.setAmount(payment.getAmount());
        dto.setDescription(payment.getDescription());
        dto.setStatus(payment.getStatus());
        dto.setDueDate(payment.getDueDate());
        dto.setPaidDate(payment.getPaidDate());
        dto.setInvoiceNumber(payment.getInvoiceNumber());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setNotes(payment.getNotes());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());
        dto.setCategoryTeamId(payment.getCategoryTeam().getId());
        
        // Map related entities
        if (payment.getCategoryTeam() != null) {
            if (payment.getCategoryTeam().getTeam() != null) {
                dto.setTeam(new TeamBasicDTO(
                    payment.getCategoryTeam().getTeam().getId(),
                    payment.getCategoryTeam().getTeam().getName(),
                    payment.getCategoryTeam().getTeam().getSpecialty(),
                    payment.getCategoryTeam().getTeam().getColor()
                ));
            }
            
            if (payment.getCategoryTeam().getCategory() != null) {
                dto.setCategory(new CategoryBasicDTO(
                    payment.getCategoryTeam().getCategory().getId(),
                    payment.getCategoryTeam().getCategory().getName()
                ));
                
                if (payment.getCategoryTeam().getCategory().getUnit() != null) {
                    dto.setUnit(new UnitBasicDTO(
                        payment.getCategoryTeam().getCategory().getUnit().getId(),
                        payment.getCategoryTeam().getCategory().getUnit().getName(),
                        payment.getCategoryTeam().getCategory().getUnit().getType()
                    ));
                    
                    if (payment.getCategoryTeam().getCategory().getUnit().getProject() != null) {
                        dto.setProject(new ProjectBasicDTO(
                            payment.getCategoryTeam().getCategory().getUnit().getProject().getId(),
                            payment.getCategoryTeam().getCategory().getUnit().getProject().getName(),
                            payment.getCategoryTeam().getCategory().getUnit().getProject().getLocation()
                        ));
                    }
                }
            }
        }
        
        return dto;
    }
    
    /**
     * Create a new Payment entity from DTO
     */
    public Payment toEntity(PaymentCreateDTO dto) {
        Payment payment = new Payment();
        payment.setAmount(dto.getAmount());
        payment.setDescription(dto.getDescription());
        payment.setStatus(dto.getStatus());
        payment.setDueDate(dto.getDueDate());
        payment.setInvoiceNumber(dto.getInvoiceNumber());
        payment.setNotes(dto.getNotes());
        return payment;
    }
    
    /**
     * Update Payment entity from DTO
     */
    public void updateEntity(Payment payment, PaymentUpdateDTO dto) {
        if (dto.getAmount() != null) {
            payment.setAmount(dto.getAmount());
        }
        if (dto.getDescription() != null) {
            payment.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null) {
            payment.setStatus(dto.getStatus());
        }
        if (dto.getDueDate() != null) {
            payment.setDueDate(dto.getDueDate());
        }
        if (dto.getPaidDate() != null) {
            payment.setPaidDate(dto.getPaidDate());
        }
        if (dto.getInvoiceNumber() != null) {
            payment.setInvoiceNumber(dto.getInvoiceNumber());
        }
        if (dto.getPaymentMethod() != null) {
            payment.setPaymentMethod(dto.getPaymentMethod());
        }
        if (dto.getNotes() != null) {
            payment.setNotes(dto.getNotes());
        }
    }
}