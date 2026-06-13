package com.handmade.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.handmade.entity.Favorite;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserId(Long userId);

    Optional<Favorite> findByUserIdAndProductId(
            Long userId,
            Long productId
    );

    void deleteByUserIdAndProductId(
            Long userId,
            Long productId
    );
}