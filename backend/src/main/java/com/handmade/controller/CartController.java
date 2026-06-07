package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.CartItemRequest;
import com.handmade.dto.CartResponse;
import com.handmade.service.CartService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ApiResponse<CartResponse> getCart() {
        return ApiResponse.ok(
                "Lấy giỏ hàng thành công",
                cartService.getCart()
        );
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addItem(@RequestBody CartItemRequest request) {
        return ApiResponse.ok(
                "Thêm sản phẩm vào giỏ hàng thành công",
                cartService.addItem(request)
        );
    }

    @PutMapping("/items/{productId}")
    public ApiResponse<CartResponse> updateItem(
            @PathVariable Long productId,
            @RequestBody CartItemRequest request
    ) {
        return ApiResponse.ok(
                "Cập nhật giỏ hàng thành công",
                cartService.updateItem(productId, request)
        );
    }

    @DeleteMapping("/items/{productId}")
    public ApiResponse<CartResponse> removeItem(@PathVariable Long productId) {
        return ApiResponse.ok(
                "Xóa sản phẩm khỏi giỏ hàng thành công",
                cartService.removeItem(productId)
        );
    }

    @DeleteMapping("/clear")
    public ApiResponse<Void> clearCart() {
        cartService.clearCart();

        return ApiResponse.ok("Xóa toàn bộ giỏ hàng thành công", null);
    }
}