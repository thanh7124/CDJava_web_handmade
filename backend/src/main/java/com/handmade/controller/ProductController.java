package com.handmade.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        // Fetch all products
        return ResponseEntity.ok("Products list");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        // Fetch product by ID
        return ResponseEntity.ok("Product detail");
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Object productDTO) {
        // Create new product
        return ResponseEntity.ok("Product created");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Object productDTO) {
        // Update product
        return ResponseEntity.ok("Product updated");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        // Delete product
        return ResponseEntity.ok("Product deleted");
    }
}
