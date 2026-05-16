package com.handmade.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {

    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        // Fetch all orders
        return ResponseEntity.ok("Orders list");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        // Fetch order by ID
        return ResponseEntity.ok("Order detail");
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Object orderDTO) {
        // Create new order
        return ResponseEntity.ok("Order created");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable Long id, @RequestBody Object orderDTO) {
        // Update order
        return ResponseEntity.ok("Order updated");
    }
}
