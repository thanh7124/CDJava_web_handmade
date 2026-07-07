package com.handmade.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class ProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 150, message = "Tên sản phẩm không được vượt quá 150 ký tự")
    private String name;

    @Size(max = 180, message = "Slug không được vượt quá 180 ký tự")
    private String slug;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá sản phẩm phải lớn hơn 0")
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = false, message = "Giá cũ phải lớn hơn 0")
    private BigDecimal oldPrice;

    @Min(value = 0, message = "Đánh giá không được nhỏ hơn 0")
    @Max(value = 5, message = "Đánh giá không được lớn hơn 5")
    private Double rating;

    @Min(value = 0, message = "Số lượng đã bán không được âm")
    private Integer sold;

    @Min(value = 0, message = "Số lượng tồn kho không được âm")
    private Integer stock;

    @Size(max = 50, message = "Nhãn sản phẩm không được vượt quá 50 ký tự")
    private String badge;

    @Size(max = 800, message = "Đường dẫn ảnh không được vượt quá 800 ký tự")
    private String image;

    @Size(max = 10, message = "Mỗi sản phẩm chỉ được có tối đa 10 ảnh")
    private List<String> images;

    @Size(max = 5000, message = "Mô tả sản phẩm không được vượt quá 5000 ký tự")
    private String description;

    @NotNull(message = "Danh mục sản phẩm không được để trống")
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