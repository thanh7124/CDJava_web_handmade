package com.handmade.service;

import com.handmade.dto.PromotionRequest;
import com.handmade.dto.PromotionResponse;
import com.handmade.entity.Promotion;
import com.handmade.repository.PromotionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public PromotionService(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll().stream().map(PromotionResponse::from).toList();
    }

    public PromotionResponse getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mại"));
        return PromotionResponse.from(promotion);
    }

    public PromotionResponse createPromotion(PromotionRequest request) {
        validate(request);

        String code = request.getCode().trim().toUpperCase();
        if (promotionRepository.existsByCode(code)) {
            throw new RuntimeException("Mã khuyến mại đã tồn tại");
        }

        Promotion promotion = new Promotion();
        apply(promotion, request);
        promotion.setCode(code);
        return PromotionResponse.from(promotionRepository.save(promotion));
    }

    public PromotionResponse updatePromotion(Long id, PromotionRequest request) {
        validate(request);

        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mại"));

        String code = request.getCode().trim().toUpperCase();
        promotionRepository.findByCode(code).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new RuntimeException("Mã khuyến mại đã tồn tại");
            }
        });

        apply(promotion, request);
        promotion.setCode(code);
        return PromotionResponse.from(promotionRepository.save(promotion));
    }

    public void deletePromotion(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy khuyến mại");
        }
        promotionRepository.deleteById(id);
    }

    private void apply(Promotion promotion, PromotionRequest request) {
        promotion.setName(request.getName().trim());
        promotion.setDiscountType(request.getDiscountType() == null ? "PERCENT" : request.getDiscountType().trim().toUpperCase());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setDescription(request.getDescription());
        promotion.setActive(request.getActive() == null ? true : request.getActive());
    }

    private void validate(PromotionRequest request) {
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            throw new RuntimeException("Mã khuyến mại không được để trống");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Tên khuyến mại không được để trống");
        }
        if (request.getDiscountValue() == null) {
            throw new RuntimeException("Giá trị giảm không được để trống");
        }
    }
}
