package com.handmade.service;

import com.handmade.dto.AdminActivityLogResponse;
import com.handmade.entity.AdminActivityLog;
import com.handmade.repository.AdminActivityLogRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminActivityLogService {

    private final AdminActivityLogRepository adminActivityLogRepository;

    public AdminActivityLogService(AdminActivityLogRepository adminActivityLogRepository) {
        this.adminActivityLogRepository = adminActivityLogRepository;
    }

    public void log(
            String module,
            String action,
            Long targetId,
            String targetName,
            String description
    ) {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        String adminEmail = authentication != null && authentication.getName() != null
                ? authentication.getName()
                : "SYSTEM";

        AdminActivityLog log = new AdminActivityLog();

        log.setAdminEmail(adminEmail);
        log.setModule(module);
        log.setAction(action);
        log.setTargetId(targetId);
        log.setTargetName(targetName);
        log.setDescription(description);

        adminActivityLogRepository.save(log);
    }

    public List<AdminActivityLogResponse> getRecentLogs(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 200));

        return adminActivityLogRepository
                .findAll(PageRequest.of(
                        0,
                        safeLimit,
                        Sort.by(Sort.Direction.DESC, "createdDate")
                ))
                .getContent()
                .stream()
                .map(AdminActivityLogResponse::from)
                .toList();
    }
}