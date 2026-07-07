package com.handmade.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_activity_logs")
public class AdminActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_email", nullable = false, length = 150)
    private String adminEmail;

    @Column(name = "module", nullable = false, length = 80)
    private String module;

    @Column(name = "action", nullable = false, length = 80)
    private String action;

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "target_name", length = 255)
    private String targetName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @PrePersist
    public void prePersist() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
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