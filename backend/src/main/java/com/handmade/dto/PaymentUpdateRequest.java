package com.handmade.dto;

public class PaymentUpdateRequest {

    private String paymentStatus;
    private String transactionCode;
    private String note;

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public String getTransactionCode() {
        return transactionCode;
    }

    public String getNote() {
        return note;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public void setTransactionCode(String transactionCode) {
        this.transactionCode = transactionCode;
    }

    public void setNote(String note) {
        this.note = note;
    }
}