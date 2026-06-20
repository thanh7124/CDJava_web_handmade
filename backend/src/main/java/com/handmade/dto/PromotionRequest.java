package com.handmade.dto;

import java.time.LocalDateTime;

public class PromotionRequest {
    private String code;
    private String name;
    private String discountType;
    private Double discountValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String description;
    private Boolean active;

    public String getCode() { return code; }
    public String getName() { return name; }
    public String getDiscountType() { return discountType; }
    public Double getDiscountValue() { return discountValue; }
    public LocalDateTime getStartDate() { return startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public String getDescription() { return description; }
    public Boolean getActive() { return active; }
    public void setCode(String code) { this.code = code; }
    public void setName(String name) { this.name = name; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public void setDescription(String description) { this.description = description; }
    public void setActive(Boolean active) { this.active = active; }
}
