package com.constructmanager.controller;

import com.constructmanager.dto.CompanyDetailDTO;
import com.constructmanager.dto.CompanyUpdateDTO;
import com.constructmanager.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/companies")
@CrossOrigin(origins = "*")
public class CompanyController {
    
    @Autowired
    private CompanyService companyService;
    
    /**
     * Get company details
     * GET /api/v1/companies/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CompanyDetailDTO> getCompany(@PathVariable Long id) {
        return companyService.getCompanyDetail(id)
                .map(company -> ResponseEntity.ok(company))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update company information
     * PUT /api/v1/companies/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CompanyDetailDTO> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyUpdateDTO updateDTO) {
        
        return companyService.updateCompany(id, updateDTO)
                .map(company -> ResponseEntity.ok(company))
                .orElse(ResponseEntity.notFound().build());
    }
}