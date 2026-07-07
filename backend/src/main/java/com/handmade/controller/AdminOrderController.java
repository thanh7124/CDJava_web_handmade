package com.handmade.controller;

import com.handmade.dto.AdminOrderUpdateRequest;
import com.handmade.dto.ApiResponse;
import com.handmade.dto.OrderResponse;
import com.handmade.dto.OrderStatusUpdateRequest;
import com.handmade.dto.PaymentUpdateRequest;
import com.handmade.service.AdminActivityLogService;
import com.handmade.service.OrderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;
    private final AdminActivityLogService adminActivityLogService;

    public AdminOrderController(
            OrderService orderService,
            AdminActivityLogService adminActivityLogService
    ) {
        this.orderService = orderService;
        this.adminActivityLogService = adminActivityLogService;
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
        OrderResponse updatedOrder = orderService.updateOrderInfo(id, request);

        adminActivityLogService.log(
                "Đơn hàng",
                "Cập nhật thông tin",
                id,
                "Đơn hàng #" + id,
                "Cập nhật thông tin nhận hàng của đơn hàng #" + id
        );

        return ApiResponse.ok(
                "Cập nhật thông tin đơn hàng thành công",
                updatedOrder
        );
    }

    @PutMapping("/{id}/status")
    public ApiResponse<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody OrderStatusUpdateRequest request
    ) {
        OrderResponse updatedOrder = orderService.updateOrderStatus(id, request);

        adminActivityLogService.log(
                "Đơn hàng",
                "Cập nhật trạng thái",
                id,
                "Đơn hàng #" + id,
                "Cập nhật trạng thái đơn hàng #" + id + " thành " + updatedOrder.getStatus()
        );

        return ApiResponse.ok(
                "Cập nhật trạng thái đơn hàng thành công",
                updatedOrder
        );
    }

    @PutMapping("/{id}/payment")
    public ApiResponse<OrderResponse> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody PaymentUpdateRequest request
    ) {
        OrderResponse updatedOrder = orderService.updatePaymentStatus(id, request);

        adminActivityLogService.log(
                "Đơn hàng",
                "Cập nhật thanh toán",
                id,
                "Đơn hàng #" + id,
                "Cập nhật trạng thái thanh toán đơn hàng #" + id + " thành " + updatedOrder.getPaymentStatus()
        );

        return ApiResponse.ok(
                "Cập nhật trạng thái thanh toán thành công",
                updatedOrder
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);

        adminActivityLogService.log(
                "Đơn hàng",
                "Xóa đơn hàng",
                id,
                "Đơn hàng #" + id,
                "Xóa đơn hàng #" + id + " khỏi hệ thống"
        );

        return ApiResponse.ok("Xóa đơn hàng thành công", null);
    }
}