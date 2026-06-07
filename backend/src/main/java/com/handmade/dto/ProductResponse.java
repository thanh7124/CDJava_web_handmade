package com.handmade.dto;

import com.handmade.entity.Product;

import java.math.BigDecimal;
import java.util.List;

public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private String category;
    private Double rating;
    private Integer sold;
    private Integer stock;
    private String badge;
    private String image;
    private List<String> images;
    private String description;

    public static ProductResponse from(Product product) {
        ProductResponse response = new ProductResponse();

        response.setId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setPrice(product.getPrice());
        response.setOldPrice(product.getOldPrice());
        response.setCategory(
                product.getCategory() != null ? product.getCategory().getName() : null
        );
        response.setRating(product.getRating());
        response.setSold(product.getSold());
        response.setStock(product.getStock());
        response.setBadge(product.getBadge());
        response.setImage(product.getImage());
        response.setImages(product.getImages());
        response.setDescription(product.getDescription());

        return response;
    }

    public Long getId() {
        return id;
    }

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

    public String getCategory() {
        return category;
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

    public void setId(Long id) {
        this.id = id;
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

    public void setCategory(String category) {
        this.category = category;
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
}