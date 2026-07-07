package com.handmade.dto;

import com.handmade.entity.AdminActivityLog;

import java.time.LocalDateTime;

public class AdminActivityLogResponse {

    private Long id;
    private String adminEmail;
    private String module;
    private String action;
    private Long targetId;
    private String targetName;
    private String description;
    private LocalDateTime createdDate;

    public static AdminActivityLogResponse from(AdminActivityLog log) {
        AdminActivityLogResponse response = new AdminActivityLogResponse();

        response.setId(log.getId());
        response.setAdminEmail(log.getAdminEmail());
        response.setModule(log.getModule());
        response.setAction(log.getAction());
        response.setTargetId(log.getTargetId());
        response.setTargetName(log.getTargetName());
        response.setDescription(log.getDescription());
        response.setCreatedDate(log.getCreatedDate());

        return response;
    }

    public Long getId() {
        return id;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public String getModule() {
        return module;
    }

    public String getAction() {
        return action;
    }

    public Long getTargetId() {
        return targetId;
    }

    public String getTargetName() {
        return targetName;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public void setTargetName(String targetName) {
        this.targetName = targetName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
}