package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.AuthResponse;
import com.handmade.dto.LoginRequest;
import com.handmade.dto.RegisterRequest;
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
}