package com.handmade.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "old_price")
    private BigDecimal oldPrice;

    private Double rating = 0.0;

    private Integer sold = 0;

    private Integer stock = 0;

    private String badge;

    @Column(length = 800)
    private String image;

    @ElementCollection
    @CollectionTable(
            name = "product_images",
            joinColumns = @JoinColumn(name = "product_id")
    )
    @Column(name = "image_url", length = 800)
    private List<String> images = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    private Boolean active = true;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    public Product() {
    }

    public Product(
            String name,
            String slug,
            BigDecimal price,
            BigDecimal oldPrice,
            Double rating,
            Integer sold,
            Integer stock,
            String badge,
            String image,
            String description,
            Category category
    ) {
        this.name = name;
        this.slug = slug;
        this.price = price;
        this.oldPrice = oldPrice;
        this.rating = rating;
        this.sold = sold;
        this.stock = stock;
        this.badge = badge;
        this.image = image;
        this.description = description;
        this.category = category;
        this.active = true;

        if (image != null && !image.isBlank()) {
            this.images.add(image);
        }
    }

    @PrePersist
    public void prePersist() {
        if (rating == null) {
            rating = 0.0;
        }

        if (sold == null) {
            sold = 0;
        }

        if (stock == null) {
            stock = 0;
        }

        if (active == null) {
            active = true;
        }

        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedDate = LocalDateTime.now();
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

    public Category getCategory() {
        return category;
    }

    public Boolean getActive() {
        return active;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
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

    public void setCategory(Category category) {
        this.category = category;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }
}