package com.constructmanager.service;

import com.constructmanager.dto.CompanyDetailDTO;
import com.constructmanager.dto.CompanyUpdateDTO;
import com.constructmanager.entity.Company;
import org.springframework.stereotype.Component;

@Component
public class CompanyMapper {
    
    /**
     * Convert Company entity to detailed DTO
     */
    public CompanyDetailDTO toDetailDTO(Company company) {
        CompanyDetailDTO dto = new CompanyDetailDTO();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setAddress(company.getAddress());
        dto.setPhone(company.getPhone());
        dto.setEmail(company.getEmail());
        dto.setWebsite(company.getWebsite());
        dto.setCreatedAt(company.getCreatedAt());
        dto.setUpdatedAt(company.getUpdatedAt());
        return dto;
    }
    
    /**
     * Update company entity from update DTO
     */
    public void updateCompanyFromDTO(Company company, CompanyUpdateDTO dto) {
        company.setName(dto.getName());
        company.setAddress(dto.getAddress());
        company.setPhone(dto.getPhone());
        company.setEmail(dto.getEmail());
        company.setWebsite(dto.getWebsite());
    }
}