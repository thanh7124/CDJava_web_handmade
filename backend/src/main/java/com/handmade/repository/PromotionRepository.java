package com.handmade.repository;

import com.handmade.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    boolean existsByCode(String code);
    Optional<Promotion> findByCode(String code);
}
