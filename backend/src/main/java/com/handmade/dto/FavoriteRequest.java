package com.handmade.dto;

import lombok.Data;

@Data
public class FavoriteRequest {

    private Long userId;
    private Long productId;
    public FavoriteRequest(Long userId, Long productId) {
        this.userId = userId;
        this.productId = productId;
    }
        public Long getUserId() { return userId; }
        public Long getProductId() { return productId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public void setProductId(Long productId) { this.productId = productId; }
}
