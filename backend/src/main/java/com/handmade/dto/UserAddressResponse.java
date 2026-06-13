package com.handmade.dto;

import com.handmade.entity.UserAddress;

import java.time.LocalDateTime;

public class UserAddressResponse {

    private Long id;
    private Long userId;
    private String recipientName;
    private String phone;
    private String address;
    private Boolean isDefault;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    public static UserAddressResponse from(UserAddress a) {
        UserAddressResponse r = new UserAddressResponse();
        r.setId(a.getId());
        r.setUserId(a.getUserId());
        r.setRecipientName(a.getRecipientName());
        r.setPhone(a.getPhone());
        r.setAddress(a.getAddress());
        r.setIsDefault(a.getIsDefault());
        r.setCreatedDate(a.getCreatedDate());
        r.setUpdatedDate(a.getUpdatedDate());
        return r;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }
}
