package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.CheckoutRequest;
import com.handmade.dto.OrderResponse;
import com.handmade.service.OrderService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/my")
    public ApiResponse<List<OrderResponse>> getMyOrders() {
        return ApiResponse.ok(
                "Lấy danh sách đơn hàng thành công",
                orderService.getMyOrders()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable Long id) {
        return ApiResponse.ok(
                "Lấy chi tiết đơn hàng thành công",
                orderService.getOrderById(id)
        );
    }

    @PostMapping("/checkout")
    public ApiResponse<OrderResponse> checkout(@Valid @RequestBody CheckoutRequest request) {
        return ApiResponse.ok(
                "Đặt hàng thành công",
                orderService.checkout(request)
        );
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(@PathVariable Long id) {
        return ApiResponse.ok(
                "Hủy đơn hàng thành công",
                orderService.cancelMyOrder(id)
        );
    }
}
