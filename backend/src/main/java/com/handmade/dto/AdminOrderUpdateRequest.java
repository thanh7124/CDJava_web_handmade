package com.handmade.dto;

public class AdminOrderUpdateRequest {

    private String recipientName;
    private String phone;
    private String address;
    private String note;
    private String paymentMethod;

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
}