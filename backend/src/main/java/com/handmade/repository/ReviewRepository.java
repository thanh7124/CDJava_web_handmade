package com.handmade.repository;

import com.handmade.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdAndActiveTrueOrderByCreatedDateDesc(Long productId);

    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.product.id = :productId AND r.active = true")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.active = true")
    Long countActiveReviewsByProductId(@Param("productId") Long productId);

    @Query(value = """
        SELECT o.id
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = :userId
          AND oi.product_id = :productId
          AND LOWER(o.status) IN ('completed', 'delivered', 'success', 'done', 'paid')
        ORDER BY o.created_date DESC
        LIMIT 1
        """, nativeQuery = true)
    Optional<Long> findCompletedOrderIdByUserAndProduct(
            @Param("userId") Long userId,
            @Param("productId") Long productId
    );
}