package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.AuthResponse;
import com.handmade.dto.ForgotPasswordRequest;
import com.handmade.dto.GoogleLoginRequest;
import com.handmade.dto.LoginRequest;
import com.handmade.dto.RegisterRequest;
import com.handmade.dto.ResetPasswordRequest;
import com.handmade.dto.UserResponse;
import com.handmade.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(
                "Đăng ký tài khoản thành công",
                authService.register(request)
        );
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(
                "Đăng nhập thành công",
                authService.login(request)
        );
    }

    @PostMapping("/google")
    public ApiResponse<AuthResponse> loginWithGoogle(
            @Valid @RequestBody GoogleLoginRequest request
    ) {
        return ApiResponse.ok(
                "Đăng nhập bằng Google thành công",
                authService.loginWithGoogle(request)
        );
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        authService.forgotPassword(request);

        return ApiResponse.ok(
                "Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi",
                null
        );
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        authService.resetPassword(request);

        return ApiResponse.ok(
                "Đặt lại mật khẩu thành công",
                null
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

    @PutMapping(value = "/avatar", consumes = "multipart/form-data")
    public ApiResponse<UserResponse> updateAvatar(
            java.security.Principal principal,
            @RequestPart("avatar") MultipartFile avatar
    ) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        return ApiResponse.ok(
                "Cập nhật ảnh đại diện thành công",
                authService.updateAvatar(principal.getName(), avatar)
        );
    }
}