package com.handmade.service;

import com.handmade.dto.CheckoutRequest;
import com.handmade.dto.OrderResponse;
import com.handmade.dto.OrderStatusUpdateRequest;
import com.handmade.dto.PaymentUpdateRequest;
import com.handmade.entity.CartItem;
import com.handmade.entity.Order;
import com.handmade.entity.OrderItem;
import com.handmade.entity.Payment;
import com.handmade.entity.Product;
import com.handmade.entity.User;
import com.handmade.repository.CartItemRepository;
import com.handmade.repository.OrderRepository;
import com.handmade.repository.PaymentRepository;
import com.handmade.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.handmade.dto.AdminOrderUpdateRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_CONFIRMED = "CONFIRMED";
    private static final String STATUS_SHIPPING = "SHIPPING";
    private static final String STATUS_DELIVERED = "DELIVERED";
    private static final String STATUS_CANCELLED = "CANCELLED";

    private static final String PAYMENT_COD = "COD";
    private static final String PAYMENT_BANK_TRANSFER = "BANK_TRANSFER";

    private static final String PAYMENT_UNPAID = "UNPAID";
    private static final String PAYMENT_PENDING = "PENDING";
    private static final String PAYMENT_PAID = "PAID";
    private static final String PAYMENT_FAILED = "FAILED";
    private static final String PAYMENT_REFUNDED = "REFUNDED";
    private static final String PAYMENT_CANCELLED = "CANCELLED";

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    public OrderService(
            OrderRepository orderRepository,
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            PaymentRepository paymentRepository
    ) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {
        User user = getCurrentUser();

        return orderRepository
                .findByUserIdOrderByCreatedDateDesc(user.getId())
                .stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdForAdmin(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        return OrderResponse.from(order);
    }
    @Transactional
public OrderResponse updateOrderInfo(Long id, AdminOrderUpdateRequest request) {
    Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

    if (request.getRecipientName() != null && !request.getRecipientName().trim().isEmpty()) {
        order.setRecipientName(request.getRecipientName().trim());
    }

    if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
        order.setPhone(request.getPhone().trim());
    }

    if (request.getAddress() != null && !request.getAddress().trim().isEmpty()) {
        order.setAddress(request.getAddress().trim());
    }

    order.setNote(request.getNote());

    if (request.getPaymentMethod() != null && !request.getPaymentMethod().trim().isEmpty()) {
        String paymentMethod = request.getPaymentMethod().trim().toUpperCase();

        if ("BANKING".equals(paymentMethod) || "BANK".equals(paymentMethod)) {
            paymentMethod = "BANK_TRANSFER";
        }

        if (!"COD".equals(paymentMethod) && !"BANK_TRANSFER".equals(paymentMethod)) {
            throw new RuntimeException("Phương thức thanh toán không hợp lệ");
        }

        order.setPaymentMethod(paymentMethod);
    }

    return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
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

        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());
        String paymentStatus = getInitialPaymentStatus(paymentMethod);

        Order order = new Order();

        order.setUser(user);
        order.setRecipientName(request.getRecipientName().trim());
        order.setPhone(request.getPhone().trim());
        order.setAddress(request.getAddress().trim());
        order.setNote(request.getNote());
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(paymentStatus);
        order.setStatus(STATUS_PENDING);
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

        Payment payment = new Payment();
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus(paymentStatus);
        payment.setAmount(totalAmount);
        payment.setTransactionCode(request.getTransactionCode());
        payment.setNote(request.getPaymentNote());

        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);

        cartItemRepository.deleteByUserId(user.getId());

        return OrderResponse.from(savedOrder);
    }

    @Transactional
    public OrderResponse cancelMyOrder(Long id) {
        User user = getCurrentUser();

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }

        if (!STATUS_PENDING.equals(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng đang chờ xác nhận");
        }

        Payment payment = order.getPayment();
        boolean isPaid = PAYMENT_PAID.equals(order.getPaymentStatus())
                || (payment != null && PAYMENT_PAID.equals(payment.getPaymentStatus()));

        if (isPaid) {
            throw new RuntimeException("Đơn hàng đã thanh toán, vui lòng liên hệ cửa hàng để được hỗ trợ");
        }

        order.setStatus(STATUS_CANCELLED);
        order.setPaymentStatus(PAYMENT_CANCELLED);

        if (payment != null) {
            payment.setPaymentStatus(PAYMENT_CANCELLED);
            payment.setNote("Khách hàng đã hủy đơn trước khi xác nhận");
        }

        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            throw new RuntimeException("Trạng thái không được để trống");
        }

        String status = request.getStatus().trim().toUpperCase();

        if (!isValidOrderStatus(status)) {
            throw new RuntimeException("Trạng thái không hợp lệ");
        }

        if (STATUS_CANCELLED.equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng đã hủy, không thể cập nhật trạng thái");
        }

        order.setStatus(status);

        if (STATUS_DELIVERED.equals(status) && PAYMENT_COD.equals(order.getPaymentMethod())) {
            markPaymentAsPaid(order, "Thanh toán COD khi giao hàng thành công");
        }

        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updatePaymentStatus(Long id, PaymentUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (request.getPaymentStatus() == null || request.getPaymentStatus().trim().isEmpty()) {
            throw new RuntimeException("Trạng thái thanh toán không được để trống");
        }

        String paymentStatus = request.getPaymentStatus().trim().toUpperCase();

        if (!isValidPaymentStatus(paymentStatus)) {
            throw new RuntimeException("Trạng thái thanh toán không hợp lệ");
        }

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> {
                    Payment newPayment = new Payment();
                    newPayment.setOrder(order);
                    newPayment.setPaymentMethod(order.getPaymentMethod());
                    newPayment.setAmount(order.getTotalAmount());
                    return newPayment;
                });

        payment.setPaymentStatus(paymentStatus);
        payment.setTransactionCode(request.getTransactionCode());
        payment.setNote(request.getNote());

        if (PAYMENT_PAID.equals(paymentStatus)) {
            payment.setPaidDate(LocalDateTime.now());
        }

        order.setPaymentStatus(paymentStatus);
        order.setPayment(payment);

        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        orderRepository.delete(order);
    }

    private void markPaymentAsPaid(Order order, String note) {
        order.setPaymentStatus(PAYMENT_PAID);

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> {
                    Payment newPayment = new Payment();
                    newPayment.setOrder(order);
                    newPayment.setPaymentMethod(order.getPaymentMethod());
                    newPayment.setAmount(order.getTotalAmount());
                    return newPayment;
                });

        payment.setPaymentStatus(PAYMENT_PAID);
        payment.setPaidDate(LocalDateTime.now());
        payment.setNote(note);

        order.setPayment(payment);
    }

    private void validateCheckoutRequest(CheckoutRequest request) {
        if (request.getRecipientName() == null || request.getRecipientName().trim().isEmpty()) {
            throw new RuntimeException("Tên người nhận không được để trống");
        }

        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new RuntimeException("Số điện thoại không được để trống");
        }

        if (!request.getPhone().trim().matches("\\d{10}")) {
            throw new RuntimeException("Số điện thoại phải có đúng 10 chữ số");
        }

        if (request.getAddress() == null || request.getAddress().trim().isEmpty()) {
            throw new RuntimeException("Địa chỉ không được để trống");
        }
    }

    private String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return PAYMENT_COD;
        }

        String normalized = paymentMethod.trim().toUpperCase();

        if ("BANKING".equals(normalized) || "BANK".equals(normalized)) {
            return PAYMENT_BANK_TRANSFER;
        }

        if (!PAYMENT_COD.equals(normalized) && !PAYMENT_BANK_TRANSFER.equals(normalized)) {
            throw new RuntimeException("Phương thức thanh toán không hợp lệ");
        }

        return normalized;
    }

    private String getInitialPaymentStatus(String paymentMethod) {
        if (PAYMENT_BANK_TRANSFER.equals(paymentMethod)) {
            return PAYMENT_PENDING;
        }

        return PAYMENT_UNPAID;
    }

    private boolean isValidOrderStatus(String status) {
        return STATUS_PENDING.equals(status)
                || STATUS_CONFIRMED.equals(status)
                || STATUS_SHIPPING.equals(status)
                || STATUS_DELIVERED.equals(status)
                || STATUS_CANCELLED.equals(status);
    }

    private boolean isValidPaymentStatus(String paymentStatus) {
        return PAYMENT_UNPAID.equals(paymentStatus)
                || PAYMENT_PENDING.equals(paymentStatus)
                || PAYMENT_PAID.equals(paymentStatus)
                || PAYMENT_FAILED.equals(paymentStatus)
                || PAYMENT_REFUNDED.equals(paymentStatus)
                || PAYMENT_CANCELLED.equals(paymentStatus);
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
