package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.PromotionRequest;
import com.handmade.dto.PromotionResponse;
import com.handmade.service.PromotionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@PreAuthorize("hasRole('ADMIN')")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping
    public ApiResponse<List<PromotionResponse>> getAll() {
        return ApiResponse.ok("Lấy danh sách khuyến mại thành công", promotionService.getAllPromotions());
    }

    @GetMapping("/{id}")
    public ApiResponse<PromotionResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok("Lấy chi tiết khuyến mại thành công", promotionService.getPromotionById(id));
    }

    @PostMapping
    public ApiResponse<PromotionResponse> create(@RequestBody PromotionRequest request) {
        return ApiResponse.ok("Thêm khuyến mại thành công", promotionService.createPromotion(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<PromotionResponse> update(@PathVariable Long id, @RequestBody PromotionRequest request) {
        return ApiResponse.ok("Cập nhật khuyến mại thành công", promotionService.updatePromotion(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ApiResponse.ok("Xóa khuyến mại thành công", null);
    }
}
