package com.handmade.service;

import com.handmade.dto.CartItemRequest;
import com.handmade.dto.CartItemResponse;
import com.handmade.dto.CartResponse;
import com.handmade.entity.CartItem;
import com.handmade.entity.Product;
import com.handmade.entity.User;
import com.handmade.repository.CartItemRepository;
import com.handmade.repository.ProductRepository;
import com.handmade.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository
    ) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public CartResponse getCart() {
        User user = getCurrentUser();

        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByCreatedDateDesc(user.getId());

        return buildCartResponse(cartItems);
    }

    public CartResponse addItem(CartItemRequest request) {
        User user = getCurrentUser();

        if (request.getProductId() == null) {
            throw new RuntimeException("Sản phẩm không được để trống");
        }

        int quantity = request.getQuantity() == null ? 1 : request.getQuantity();

        if (quantity <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        CartItem cartItem = cartItemRepository
                .findByUserIdAndProductId(user.getId(), product.getId())
                .orElseGet(CartItem::new);

        int currentQuantity = cartItem.getId() == null ? 0 : cartItem.getQuantity();
        int newQuantity = currentQuantity + quantity;

        if (product.getStock() != null && newQuantity > product.getStock()) {
            newQuantity = product.getStock();
        }

        cartItem.setUser(user);
        cartItem.setProduct(product);
        cartItem.setQuantity(newQuantity);

        cartItemRepository.save(cartItem);

        return getCart();
    }

    public CartResponse updateItem(Long productId, CartItemRequest request) {
        User user = getCurrentUser();

        int quantity = request.getQuantity() == null ? 1 : request.getQuantity();

        if (quantity <= 0) {
            removeItem(productId);
            return getCart();
        }

        CartItem cartItem = cartItemRepository
                .findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong giỏ hàng"));

        Product product = cartItem.getProduct();

        if (product.getStock() != null && quantity > product.getStock()) {
            quantity = product.getStock();
        }

        cartItem.setQuantity(quantity);

        cartItemRepository.save(cartItem);

        return getCart();
    }

    @Transactional
    public CartResponse removeItem(Long productId) {
        User user = getCurrentUser();

        cartItemRepository.deleteByUserIdAndProductId(user.getId(), productId);

        return getCart();
    }

    @Transactional
    public void clearCart() {
        User user = getCurrentUser();

        cartItemRepository.deleteByUserId(user.getId());
    }

    private CartResponse buildCartResponse(List<CartItem> cartItems) {
        List<CartItemResponse> items = cartItems
                .stream()
                .map(CartItemResponse::from)
                .toList();

        int totalItems = items
                .stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        BigDecimal totalPrice = items
                .stream()
                .map(CartItemResponse::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(items, totalItems, totalPrice);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null
                || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
            throw new RuntimeException("Bạn cần đăng nhập để sử dụng giỏ hàng");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
}