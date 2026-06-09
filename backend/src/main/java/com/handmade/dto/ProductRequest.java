package com.handmade.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProductRequest {
    private String name;
    private String slug;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private Double rating;
    private Integer sold;
    private Integer stock;
    private String badge;
    private String image;
    private List<String> images;
    private String description;
    private Long categoryId;
    private Boolean active;

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getOldPrice() {
        return oldPrice;
    }

    public Double getRating() {
        return rating;
    }

    public Integer getSold() {
        return sold;
    }

    public Integer getStock() {
        return stock;
    }

    public String getBadge() {
        return badge;
    }

    public String getImage() {
        return image;
    }

    public List<String> getImages() {
        return images;
    }

    public String getDescription() {
        return description;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public Boolean getActive() {
        return active;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setOldPrice(BigDecimal oldPrice) {
        this.oldPrice = oldPrice;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public void setSold(Integer sold) {
        this.sold = sold;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}