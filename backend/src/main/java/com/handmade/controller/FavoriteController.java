package com.handmade.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.handmade.dto.FavoriteRequest;
import com.handmade.service.FavoriteService;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping("/{userId}")
    public List<Long> getFavorites(
            @PathVariable Long userId
    ) {
        return favoriteService.getFavoriteProductIds(userId);
    }

    @PostMapping("/toggle")
    public ResponseEntity<?> toggleFavorite(
            @RequestBody FavoriteRequest request
    ) {

        favoriteService.toggleFavorite(
                request.getUserId(),
                request.getProductId()
        );

        return ResponseEntity.ok().build();
    }
}