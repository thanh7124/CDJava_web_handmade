package com.handmade.controller;

import com.handmade.entity.Order;
import com.handmade.entity.User;
import com.handmade.repository.UserRepository;
import com.handmade.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.handmade.dto.ApiResponse;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @GetMapping("/my")
    public ApiResponse<List<Order>> getMyOrders(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Order> orders = orderService.getOrdersByUser(user.getId());
        return ApiResponse.ok("Lấy danh sách đơn hàng thành công", orders);
    }

    @PostMapping
    public ApiResponse<Order> createOrder(Principal principal, @RequestBody Order order) {
        if (principal == null) {
             throw new RuntimeException("Unauthorized");
        }
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        order.setUserId(user.getId());
        Order createdOrder = orderService.createOrder(order);
        return ApiResponse.ok("Tạo đơn hàng thành công", createdOrder);
    }

    @GetMapping
    public ApiResponse<List<Order>> getAllOrders() {
        return ApiResponse.ok("Danh sách đơn hàng", orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ApiResponse<Order> getOrderById(@PathVariable Long id) {
        return ApiResponse.ok("Chi tiết đơn hàng", orderService.getOrderById(id).orElse(null));
    }

    @PutMapping("/{id}")
    public ApiResponse<Order> updateOrderStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        return ApiResponse.ok("Cập nhật đơn hàng thành công", orderService.updateOrderStatus(id, status));
    }
}
