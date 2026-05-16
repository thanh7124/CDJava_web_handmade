package com.handmade.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    // TODO: Inject CategoryService

    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        // TODO: Return all categories
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        // TODO: Return category by id
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Object request) {
        // TODO: Create new category
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Object request) {
        // TODO: Update category
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        // TODO: Delete category
        return ResponseEntity.ok().build();
    }
}
