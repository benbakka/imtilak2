package com.constructmanager.service;

import com.constructmanager.dto.CompanyDetailDTO;
import com.constructmanager.dto.CompanyUpdateDTO;
import com.constructmanager.entity.Company;
import com.constructmanager.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class CompanyService {
    
    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private CompanyMapper companyMapper;
    
    /**
     * Get company details by ID
     */
    @Cacheable(value = "companyDetails", key = "#companyId")
    public Optional<CompanyDetailDTO> getCompanyDetail(Long companyId) {
        return companyRepository.findById(companyId)
                .map(companyMapper::toDetailDTO);
    }
    
    /**
     * Update company information
     */
    @Transactional
    public Optional<CompanyDetailDTO> updateCompany(Long companyId, CompanyUpdateDTO updateDTO) {
        return companyRepository.findById(companyId)
                .map(company -> {
                    companyMapper.updateCompanyFromDTO(company, updateDTO);
                    Company savedCompany = companyRepository.save(company);
                    return companyMapper.toDetailDTO(savedCompany);
                });
    }
    
    /**
     * Create new company
     */
    @Transactional
    public CompanyDetailDTO createCompany(Company company) {
        Company savedCompany = companyRepository.save(company);
        return companyMapper.toDetailDTO(savedCompany);
    }
}