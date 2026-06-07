package com.handmade.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartResponse {
    private List<CartItemResponse> items;
    private Integer totalItems;
    private BigDecimal totalPrice;

    public CartResponse() {
    }

    public CartResponse(
            List<CartItemResponse> items,
            Integer totalItems,
            BigDecimal totalPrice
    ) {
        this.items = items;
        this.totalItems = totalItems;
        this.totalPrice = totalPrice;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }

    public Integer getTotalItems() {
        return totalItems;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setItems(List<CartItemResponse> items) {
        this.items = items;
    }

    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
}