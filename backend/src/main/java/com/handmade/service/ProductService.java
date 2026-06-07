package com.handmade.service;

import com.handmade.dto.PageResponse;
import com.handmade.dto.ProductResponse;
import com.handmade.entity.Product;
import com.handmade.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public PageResponse<ProductResponse> getProducts(
            String search,
            String category,
            String sort,
            int page,
            int limit
    ) {
        int safePage = Math.max(page, 1);
        int safeLimit = Math.max(limit, 1);

        Sort springSort = buildSort(sort);
        Pageable pageable = PageRequest.of(safePage - 1, safeLimit, springSort);

        Specification<Product> specification = buildSpecification(search, category);

        Page<Product> productPage = productRepository.findAll(specification, pageable);

        List<ProductResponse> data = productPage
                .getContent()
                .stream()
                .map(ProductResponse::from)
                .toList();

        return new PageResponse<>(
                data,
                safePage,
                safeLimit,
                productPage.getTotalPages(),
                productPage.getTotalElements()
        );
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        return ProductResponse.from(product);
    }

    private Specification<Product> buildSpecification(String search, String category) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String keyword = "%" + search.trim().toLowerCase() + "%";

                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        keyword
                );

                Predicate categoryPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.join("category").get("name")),
                        keyword
                );

                predicates.add(criteriaBuilder.or(namePredicate, categoryPredicate));
            }

            if (category != null
                    && !category.trim().isEmpty()
                    && !"Tất cả".equalsIgnoreCase(category.trim())) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.join("category").get("name"),
                                category.trim()
                        )
                );
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort buildSort(String sort) {
        if (sort == null) {
            return Sort.by(Sort.Direction.DESC, "id");
        }

        return switch (sort) {
            case "price-asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price-desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "best-seller" -> Sort.by(Sort.Direction.DESC, "sold");
            case "rating" -> Sort.by(Sort.Direction.DESC, "rating");
            case "newest" -> Sort.by(Sort.Direction.DESC, "id");
            default -> Sort.by(Sort.Direction.DESC, "id");
        };
    }
}