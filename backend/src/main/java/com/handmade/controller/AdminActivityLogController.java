package com.handmade.controller;

import com.handmade.dto.AdminActivityLogResponse;
import com.handmade.dto.ApiResponse;
import com.handmade.service.AdminActivityLogService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/activity-logs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminActivityLogController {

    private final AdminActivityLogService adminActivityLogService;

    public AdminActivityLogController(AdminActivityLogService adminActivityLogService) {
        this.adminActivityLogService = adminActivityLogService;
    }

    @GetMapping
    public ApiResponse<List<AdminActivityLogResponse>> getRecentLogs(
            @RequestParam(defaultValue = "100") int limit
    ) {
        return ApiResponse.ok(
                "Lấy nhật ký hoạt động thành công",
                adminActivityLogService.getRecentLogs(limit)
        );
    }
}