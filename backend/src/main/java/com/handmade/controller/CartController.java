package com.handmade.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    // TODO: Inject CartService

    @GetMapping
    public ResponseEntity<?> getCartItems() {
        // TODO: Return cart items for current user
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody Object request) {
        // TODO: Add item to cart
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCartItem(@PathVariable Long id, @RequestBody Object request) {
        // TODO: Update cart item quantity
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long id) {
        // TODO: Remove item from cart
        return ResponseEntity.ok().build();
    }
}
