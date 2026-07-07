package com.handmade.repository;

import com.handmade.entity.AdminActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminActivityLogRepository extends JpaRepository<AdminActivityLog, Long> {
}