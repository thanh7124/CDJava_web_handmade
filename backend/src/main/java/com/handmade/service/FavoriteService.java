package com.handmade.service;

import java.time.LocalDateTime;
import java.util.List;

import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.handmade.entity.Favorite;
import com.handmade.repository.FavoriteRepository;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;

    public FavoriteService(FavoriteRepository favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }

    public List<Long> getFavoriteProductIds(Long userId) {

        return favoriteRepository.findByUserId(userId)
                .stream()
                .map(Favorite::getProductId)
                .toList();
    }

    @Transactional
    public void toggleFavorite(Long userId, Long productId) {

        Optional<Favorite> favorite =
                favoriteRepository.findByUserIdAndProductId(
                        userId,
                        productId
                );

        if (favorite.isPresent()) {

            favoriteRepository.delete(favorite.get());

        } else {

            Favorite f = new Favorite();

            f.setUserId(userId);
            f.setProductId(productId);
            f.setCreatedDate(LocalDateTime.now());

            favoriteRepository.save(f);
        }
    }
}