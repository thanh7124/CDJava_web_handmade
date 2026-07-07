package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.PageResponse;
import com.handmade.dto.ProductRequest;
import com.handmade.dto.ProductResponse;
import com.handmade.service.AdminActivityLogService;
import com.handmade.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final AdminActivityLogService adminActivityLogService;

    public ProductController(
            ProductService productService,
            AdminActivityLogService adminActivityLogService
    ) {
        this.productService = productService;
        this.adminActivityLogService = adminActivityLogService;
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

    @PostMapping(
            value = "/upload-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> uploadProductImage(
            @RequestParam("file") MultipartFile file
    ) {
        String imageUrl = productService.uploadProductImage(file);

        adminActivityLogService.log(
                "Sản phẩm",
                "Upload ảnh",
                null,
                file.getOriginalFilename(),
                "Upload ảnh sản phẩm: " + file.getOriginalFilename()
        );

        return ApiResponse.ok(
                "Tải ảnh sản phẩm thành công",
                imageUrl
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request
    ) {
        ProductResponse createdProduct = productService.createProduct(request);

        adminActivityLogService.log(
                "Sản phẩm",
                "Thêm sản phẩm",
                createdProduct.getId(),
                createdProduct.getName(),
                "Thêm sản phẩm mới: " + createdProduct.getName()
        );

        return ApiResponse.ok(
                "Thêm sản phẩm thành công",
                createdProduct
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        ProductResponse updatedProduct = productService.updateProduct(id, request);

        adminActivityLogService.log(
                "Sản phẩm",
                "Cập nhật sản phẩm",
                id,
                updatedProduct.getName(),
                "Cập nhật thông tin sản phẩm: " + updatedProduct.getName()
        );

        return ApiResponse.ok(
                "Cập nhật sản phẩm thành công",
                updatedProduct
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);

        productService.deleteProduct(id);

        adminActivityLogService.log(
                "Sản phẩm",
                "Xóa sản phẩm",
                id,
                product.getName(),
                "Xóa sản phẩm: " + product.getName()
        );

        return ApiResponse.ok("Xóa sản phẩm thành công", null);
    }
}