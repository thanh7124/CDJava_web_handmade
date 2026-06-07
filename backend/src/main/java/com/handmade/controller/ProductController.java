package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.PageResponse;
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
            @RequestParam(defaultValue = "Tất cả") String category,
            @RequestParam(defaultValue = "default") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int limit
    ) {
        PageResponse<ProductResponse> result = productService.getProducts(
                search,
                category,
                sort,
                page,
                limit
        );

        return ApiResponse.ok("Lấy danh sách sản phẩm thành công", result);
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse result = productService.getProductById(id);

        return ApiResponse.ok("Lấy chi tiết sản phẩm thành công", result);
    }
}