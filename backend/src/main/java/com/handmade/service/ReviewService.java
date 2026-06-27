package com.handmade.service;

import com.handmade.dto.ReviewRequest;
import com.handmade.dto.ReviewResponse;
import com.handmade.dto.ReviewSummaryResponse;
import com.handmade.entity.Product;
import com.handmade.entity.Review;
import com.handmade.entity.User;
import com.handmade.repository.ProductRepository;
import com.handmade.repository.ReviewRepository;
import com.handmade.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        return reviewRepository
                .findByProductIdAndActiveTrueOrderByCreatedDateDesc(productId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ReviewSummaryResponse getReviewSummary(Long productId) {
        Double average = reviewRepository.getAverageRatingByProductId(productId);
        Long total = reviewRepository.countActiveReviewsByProductId(productId);

        double roundedAverage = Math.round(average * 10.0) / 10.0;

        return new ReviewSummaryResponse(roundedAverage, total);
    }

    public ReviewResponse createReview(Long productId, ReviewRequest request) {
        User currentUser = getCurrentUser();

        validateReviewRequest(request);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        if (reviewRepository.existsByUserIdAndProductId(currentUser.getId(), productId)) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này rồi");
        }

        Long completedOrderId = reviewRepository
                .findCompletedOrderIdByUserAndProduct(currentUser.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Bạn chỉ có thể đánh giá sản phẩm đã mua"));

        Review review = new Review();
        review.setUser(currentUser);
        review.setProduct(product);
        review.setOrderId(completedOrderId);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setActive(true);

        Review savedReview = reviewRepository.save(review);

        return toResponse(savedReview);
    }

    public ReviewResponse updateReview(Long reviewId, ReviewRequest request) {
        User currentUser = getCurrentUser();

        validateReviewRequest(request);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));

        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền sửa đánh giá này");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review updatedReview = reviewRepository.save(review);

        return toResponse(updatedReview);
    }

    public void deleteReview(Long reviewId) {
        User currentUser = getCurrentUser();

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));

        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa đánh giá này");
        }

        review.setActive(false);
        reviewRepository.save(review);
    }

    private void validateReviewRequest(ReviewRequest request) {
        if (request.getRating() == null) {
            throw new RuntimeException("Vui lòng chọn số sao đánh giá");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Số sao đánh giá phải từ 1 đến 5");
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Bạn cần đăng nhập để đánh giá sản phẩm");
        }

        String emailOrUsername = authentication.getName();

        return userRepository.findByEmail(emailOrUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getProduct().getId(),
                review.getProduct().getName(),
                review.getUser().getId(),
                getDisplayName(review.getUser()),
                review.getOrderId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedDate(),
                review.getUpdatedDate()
        );
    }

    private String getDisplayName(User user) {
        if (user.getFullName() != null && !user.getFullName().isBlank()) {
            return user.getFullName();
        }

        return user.getEmail();
    }
}