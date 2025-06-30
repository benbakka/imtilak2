package com.constructmanager.dto;

/**
 * DTO for risk factor data
 */
public class RiskFactorDTO {
    private String factor;
    private String impact;
    private String probability;
    private String mitigation;
    
    // Constructors
    public RiskFactorDTO() {}
    
    public RiskFactorDTO(String factor, String impact, String probability, String mitigation) {
        this.factor = factor;
        this.impact = impact;
        this.probability = probability;
        this.mitigation = mitigation;
    }
    
    // Getters and Setters
    public String getFactor() { return factor; }
    public void setFactor(String factor) { this.factor = factor; }
    
    public String getImpact() { return impact; }
    public void setImpact(String impact) { this.impact = impact; }
    
    public String getProbability() { return probability; }
    public void setProbability(String probability) { this.probability = probability; }
    
    public String getMitigation() { return mitigation; }
    public void setMitigation(String mitigation) { this.mitigation = mitigation; }
}