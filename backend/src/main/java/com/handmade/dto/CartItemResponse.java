package com.handmade.dto;

import com.handmade.entity.CartItem;
import com.handmade.entity.Product;

import java.math.BigDecimal;

public class CartItemResponse {
    private Long id;
    private Long productId;
    private String name;
    private String slug;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private String image;
    private String categoryName;
    private Integer stock;
    private Integer quantity;
    private BigDecimal totalPrice;

    public static CartItemResponse from(CartItem cartItem) {
        Product product = cartItem.getProduct();

        CartItemResponse response = new CartItemResponse();

        response.setId(cartItem.getId());
        response.setProductId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setPrice(product.getPrice());
        response.setOldPrice(product.getOldPrice());
        response.setImage(product.getImage());
        response.setStock(product.getStock());
        response.setQuantity(cartItem.getQuantity());

        if (product.getCategory() != null) {
            response.setCategoryName(product.getCategory().getName());
        }

        response.setTotalPrice(
                product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()))
        );

        return response;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
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

    public String getImage() {
        return image;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public Integer getStock() {
        return stock;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
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

    public void setImage(String image) {
        this.image = image;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
}