package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.PageResponse;
import com.handmade.dto.ProductRequest;
import com.handmade.dto.ProductResponse;
import com.handmade.service.ProductService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ApiResponse<PageResponse<ProductResponse>> getProducts(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int limit
    ) {
        return ApiResponse.ok(
                "Lấy danh sách sản phẩm thành công",
                productService.getProducts(search, categoryId, sort, page, limit)
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable Long id) {
        return ApiResponse.ok(
                "Lấy chi tiết sản phẩm thành công",
                productService.getProductById(id)
        );
    }

    @PostMapping
    public ApiResponse<ProductResponse> createProduct(
            @RequestBody ProductRequest request
    ) {
        return ApiResponse.ok(
                "Thêm sản phẩm thành công",
                productService.createProduct(request)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request
    ) {
        return ApiResponse.ok(
                "Cập nhật sản phẩm thành công",
                productService.updateProduct(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);

        return ApiResponse.ok("Xóa sản phẩm thành công", null);
    }
}