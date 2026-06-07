package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.CategoryRequest;
import com.handmade.dto.CategoryResponse;
import com.handmade.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ApiResponse<Map<String, List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();

        return ApiResponse.ok(
                "Lấy danh sách danh mục thành công",
                Map.of("data", categories)
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> getCategoryById(@PathVariable Long id) {
        return ApiResponse.ok(
                "Lấy chi tiết danh mục thành công",
                categoryService.getCategoryById(id)
        );
    }

    @PostMapping
    public ApiResponse<CategoryResponse> createCategory(
            @RequestBody CategoryRequest request
    ) {
        return ApiResponse.ok(
                "Thêm danh mục thành công",
                categoryService.createCategory(request)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryRequest request
    ) {
        return ApiResponse.ok(
                "Cập nhật danh mục thành công",
                categoryService.updateCategory(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);

        return ApiResponse.ok("Xóa danh mục thành công", null);
    }
}