package com.handmade.dto;

public class ReviewSummaryResponse {

    private Double averageRating;
    private Long totalReviews;

    public ReviewSummaryResponse(Double averageRating, Long totalReviews) {
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public Long getTotalReviews() {
        return totalReviews;
    }
}