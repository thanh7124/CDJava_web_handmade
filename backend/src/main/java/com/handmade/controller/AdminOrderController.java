package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.OrderResponse;
import com.handmade.dto.OrderStatusUpdateRequest;
import com.handmade.dto.PaymentUpdateRequest;
import com.handmade.service.OrderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.handmade.dto.AdminOrderUpdateRequest;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> getAllOrders() {
        return ApiResponse.ok("Lấy danh sách đơn hàng thành công", orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable Long id) {
        return ApiResponse.ok("Lấy chi tiết đơn hàng thành công", orderService.getOrderByIdForAdmin(id));
    }
    @PutMapping("/{id}")
    public ApiResponse<OrderResponse> updateOrderInfo(
            @PathVariable Long id,
            @RequestBody AdminOrderUpdateRequest request
    ) {
        return ApiResponse.ok(
                "Cập nhật thông tin đơn hàng thành công",
                orderService.updateOrderInfo(id, request)
        );
    }

    @PutMapping("/{id}/status")
    public ApiResponse<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody OrderStatusUpdateRequest request
    ) {
        return ApiResponse.ok(
                "Cập nhật trạng thái đơn hàng thành công",
                orderService.updateOrderStatus(id, request)
        );
    }

    @PutMapping("/{id}/payment")
    public ApiResponse<OrderResponse> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody PaymentUpdateRequest request
    ) {
        return ApiResponse.ok(
                "Cập nhật trạng thái thanh toán thành công",
                orderService.updatePaymentStatus(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ApiResponse.ok("Xóa đơn hàng thành công", null);
    }
}