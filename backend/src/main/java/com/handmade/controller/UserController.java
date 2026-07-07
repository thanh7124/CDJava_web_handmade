package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.UserAdminUpdateRequest;
import com.handmade.dto.UserResponse;
import com.handmade.service.AdminActivityLogService;
import com.handmade.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;
    private final AdminActivityLogService adminActivityLogService;

    public UserController(
            UserService userService,
            AdminActivityLogService adminActivityLogService
    ) {
        this.userService = userService;
        this.adminActivityLogService = adminActivityLogService;
    }

    @GetMapping
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.ok(
                "Lấy danh sách người dùng thành công",
                userService.getAllUsers()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id) {
        return ApiResponse.ok(
                "Lấy chi tiết người dùng thành công",
                userService.getUserById(id)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UserAdminUpdateRequest request
    ) {
        UserResponse updatedUser = userService.updateUser(id, request);
        String targetName = buildUserTargetName(updatedUser);

        adminActivityLogService.log(
                "Người dùng",
                "Cập nhật người dùng",
                id,
                targetName,
                "Cập nhật thông tin người dùng: " + targetName
        );

        return ApiResponse.ok(
                "Cập nhật người dùng thành công",
                updatedUser
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        String targetName = buildUserTargetName(user);

        userService.deleteUser(id);

        adminActivityLogService.log(
                "Người dùng",
                "Xóa người dùng",
                id,
                targetName,
                "Xóa người dùng khỏi hệ thống: " + targetName
        );

        return ApiResponse.ok("Xóa người dùng thành công", null);
    }

    private String buildUserTargetName(UserResponse user) {
        if (user == null) {
            return "Người dùng";
        }

        String fullName = user.getFullName();
        String email = user.getEmail();

        if (fullName != null && !fullName.isBlank()
                && email != null && !email.isBlank()) {
            return fullName + " (" + email + ")";
        }

        if (fullName != null && !fullName.isBlank()) {
            return fullName;
        }

        if (email != null && !email.isBlank()) {
            return email;
        }

        if (user.getId() != null) {
            return "Người dùng #" + user.getId();
        }

        return "Người dùng";
    }
}