package com.handmade.dto;

import com.handmade.entity.Order;
import com.handmade.entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {
    private Long id;
    private String recipientName;
    private String phone;
    private String address;
    private String note;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionCode;
    private String paymentNote;
    private LocalDateTime paidDate;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private LocalDateTime createdDate;
    private List<OrderItemResponse> items;

    public static OrderResponse from(Order order) {
        OrderResponse response = new OrderResponse();

        response.setId(order.getId());
        response.setRecipientName(order.getRecipientName());
        response.setPhone(order.getPhone());
        response.setAddress(order.getAddress());
        response.setNote(order.getNote());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setStatus(order.getStatus());
        response.setSubtotal(order.getSubtotal());
        response.setShippingFee(order.getShippingFee());
        response.setTotalAmount(order.getTotalAmount());
        response.setCreatedDate(order.getCreatedDate());

        Payment payment = order.getPayment();

        if (payment != null) {
            response.setTransactionCode(payment.getTransactionCode());
            response.setPaymentNote(payment.getNote());
            response.setPaidDate(payment.getPaidDate());

            if (payment.getPaymentStatus() != null) {
                response.setPaymentStatus(payment.getPaymentStatus());
            }
        }

        response.setItems(
                order.getItems()
                        .stream()
                        .map(OrderItemResponse::from)
                        .toList()
        );

        return response;
    }

    public Long getId() {
        return id;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public String getNote() {
        return note;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public String getTransactionCode() {
        return transactionCode;
    }

    public String getPaymentNote() {
        return paymentNote;
    }

    public LocalDateTime getPaidDate() {
        return paidDate;
    }

    public String getStatus() {
        return status;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public BigDecimal getShippingFee() {
        return shippingFee;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public void setTransactionCode(String transactionCode) {
        this.transactionCode = transactionCode;
    }

    public void setPaymentNote(String paymentNote) {
        this.paymentNote = paymentNote;
    }

    public void setPaidDate(LocalDateTime paidDate) {
        this.paidDate = paidDate;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public void setShippingFee(BigDecimal shippingFee) {
        this.shippingFee = shippingFee;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }
}