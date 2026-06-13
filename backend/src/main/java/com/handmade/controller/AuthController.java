package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.AuthResponse;
import com.handmade.dto.LoginRequest;
import com.handmade.dto.RegisterRequest;
import com.handmade.dto.UserResponse;
import com.handmade.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ApiResponse.ok(
                "Đăng ký tài khoản thành công",
                authService.register(request)
        );
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@RequestBody LoginRequest request) {
        return ApiResponse.ok(
                "Đăng nhập thành công",
                authService.login(request)
        );
    }

    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(
            java.security.Principal principal,
            @RequestBody java.util.Map<String, String> request
    ) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }
        
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        
        authService.changePassword(principal.getName(), oldPassword, newPassword);
        
        return ApiResponse.ok("Đổi mật khẩu thành công", null);
    }

    @PutMapping("/profile")
    public ApiResponse<UserResponse> updateProfile(
            java.security.Principal principal,
            @RequestBody java.util.Map<String, String> request
    ) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }
        
        String fullName = request.get("fullName");
        String phone = request.get("phone");
        String address = request.get("address");
        
        UserResponse updated = authService.updateProfile(
                principal.getName(),
                fullName,
                phone,
                address
        );
        
        return ApiResponse.ok("Cập nhật thông tin thành công", updated);
    }
}