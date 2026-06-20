package com.handmade.dto;

import com.handmade.entity.Promotion;

import java.time.LocalDateTime;

public class PromotionResponse {
    private Long id;
    private String code;
    private String name;
    private String discountType;
    private Double discountValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String description;
    private Boolean active;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    public static PromotionResponse from(Promotion promotion) {
        PromotionResponse response = new PromotionResponse();
        response.setId(promotion.getId());
        response.setCode(promotion.getCode());
        response.setName(promotion.getName());
        response.setDiscountType(promotion.getDiscountType());
        response.setDiscountValue(promotion.getDiscountValue());
        response.setStartDate(promotion.getStartDate());
        response.setEndDate(promotion.getEndDate());
        response.setDescription(promotion.getDescription());
        response.setActive(promotion.getActive());
        response.setCreatedDate(promotion.getCreatedDate());
        response.setUpdatedDate(promotion.getUpdatedDate());
        return response;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getDiscountType() { return discountType; }
    public Double getDiscountValue() { return discountValue; }
    public LocalDateTime getStartDate() { return startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public String getDescription() { return description; }
    public Boolean getActive() { return active; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setId(Long id) { this.id = id; }
    public void setCode(String code) { this.code = code; }
    public void setName(String name) { this.name = name; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public void setDescription(String description) { this.description = description; }
    public void setActive(Boolean active) { this.active = active; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }
}
