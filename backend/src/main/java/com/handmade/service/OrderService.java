package com.handmade.service;

import com.handmade.dto.CheckoutRequest;
import com.handmade.dto.OrderResponse;
import com.handmade.entity.CartItem;
import com.handmade.entity.Order;
import com.handmade.entity.OrderItem;
import com.handmade.entity.Product;
import com.handmade.entity.User;
import com.handmade.repository.CartItemRepository;
import com.handmade.repository.OrderRepository;
import com.handmade.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    public OrderService(
            OrderRepository orderRepository,
            CartItemRepository cartItemRepository,
            UserRepository userRepository
    ) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
    }

    public List<OrderResponse> getMyOrders() {
        User user = getCurrentUser();

        return orderRepository
                .findByUserIdOrderByCreatedDateDesc(user.getId())
                .stream()
                .map(OrderResponse::from)
                .toList();
    }

    public OrderResponse getOrderById(Long id) {
        User user = getCurrentUser();

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền xem đơn hàng này");
        }

        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        validateCheckoutRequest(request);

        User user = getCurrentUser();

        List<CartItem> cartItems = cartItemRepository
                .findByUserIdOrderByCreatedDateDesc(user.getId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng đang trống");
        }

        BigDecimal subtotal = cartItems
                .stream()
                .map(item ->
                        item.getProduct()
                                .getPrice()
                                .multiply(BigDecimal.valueOf(item.getQuantity()))
                )
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingFee = subtotal.compareTo(BigDecimal.valueOf(500000)) >= 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(30000);

        BigDecimal totalAmount = subtotal.add(shippingFee);

        Order order = new Order();

        order.setUser(user);
        order.setRecipientName(request.getRecipientName().trim());
        order.setPhone(request.getPhone().trim());
        order.setAddress(request.getAddress().trim());
        order.setNote(request.getNote());
        order.setPaymentMethod(
                request.getPaymentMethod() == null || request.getPaymentMethod().isBlank()
                        ? "COD"
                        : request.getPaymentMethod()
        );
        order.setStatus("PENDING");
        order.setSubtotal(subtotal);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            OrderItem orderItem = new OrderItem();

            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItem.setTotalPrice(
                    product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()))
            );

            order.addItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        cartItemRepository.deleteByUserId(user.getId());

        return OrderResponse.from(savedOrder);
    }

    private void validateCheckoutRequest(CheckoutRequest request) {
        if (request.getRecipientName() == null || request.getRecipientName().trim().isEmpty()) {
            throw new RuntimeException("Tên người nhận không được để trống");
        }

        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new RuntimeException("Số điện thoại không được để trống");
        }

        if (request.getAddress() == null || request.getAddress().trim().isEmpty()) {
            throw new RuntimeException("Địa chỉ không được để trống");
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null
                || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
            throw new RuntimeException("Bạn cần đăng nhập để đặt hàng");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
}