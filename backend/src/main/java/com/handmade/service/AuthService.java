package com.handmade.service;

import com.handmade.dto.AuthResponse;
import com.handmade.dto.LoginRequest;
import com.handmade.dto.RegisterRequest;
import com.handmade.dto.UserResponse;
import com.handmade.entity.User;
import com.handmade.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.handmade.dto.GoogleLoginRequest;
import com.handmade.dto.GoogleTokenInfoResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.UUID;


@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AvatarStorageService avatarStorageService;

    private final String googleClientId;
    private final RestTemplate restTemplate = new RestTemplate();

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AvatarStorageService avatarStorageService,
            @Value("${google.client-id:}") String googleClientId
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.avatarStorageService = avatarStorageService;
        this.googleClientId = googleClientId;
    }

    public AuthResponse register(RegisterRequest request) {
        validateRegisterRequest(request);

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole("USER");

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser);

        return new AuthResponse(token, UserResponse.from(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email không được để trống");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Mật khẩu không được để trống");
        }

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không đúng"));

        if (user.getActive() != null && !user.getActive()) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(token, UserResponse.from(user));
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @org.springframework.transaction.annotation.Transactional
    public UserResponse updateProfile(String email, String fullName, String phone, String address) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName.trim());
        }

        user.setPhone(phone);
        user.setAddress(address);

        User savedUser = userRepository.save(user);
        return UserResponse.from(savedUser);
    }


    @org.springframework.transaction.annotation.Transactional
    public UserResponse updateAvatar(String email, MultipartFile avatar) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        String oldAvatar = user.getAvatar();
        String newAvatar = avatarStorageService.store(avatar);

        try {
            user.setAvatar(newAvatar);
            User savedUser = userRepository.save(user);
            avatarStorageService.delete(oldAvatar);
            return UserResponse.from(savedUser);
        } catch (RuntimeException exception) {
            avatarStorageService.delete(newAvatar);
            throw exception;
        }
    }

    private void validateRegisterRequest(RegisterRequest request) {
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new RuntimeException("Họ tên không được để trống");
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email không được để trống");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Mật khẩu không được để trống");
        }

        if (request.getPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 6 ký tự");
        }
    }
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
    if (googleClientId == null || googleClientId.isBlank()) {
        throw new RuntimeException("Chưa cấu hình Google Client ID");
    }

    String url = UriComponentsBuilder
            .fromHttpUrl("https://oauth2.googleapis.com/tokeninfo")
            .queryParam("id_token", request.getCredential())
            .toUriString();

    GoogleTokenInfoResponse tokenInfo;

    try {
        tokenInfo = restTemplate.getForObject(url, GoogleTokenInfoResponse.class);
    } catch (Exception exception) {
        throw new RuntimeException("Google token không hợp lệ");
    }

    if (tokenInfo == null) {
        throw new RuntimeException("Không xác thực được tài khoản Google");
    }

    if (tokenInfo.getAud() == null || !tokenInfo.getAud().equals(googleClientId)) {
        throw new RuntimeException("Google Client ID không hợp lệ");
    }

    if (!tokenInfo.isEmailVerified()) {
        throw new RuntimeException("Email Google chưa được xác minh");
    }

    if (tokenInfo.getEmail() == null || tokenInfo.getEmail().isBlank()) {
        throw new RuntimeException("Không lấy được email từ Google");
    }

    String email = tokenInfo.getEmail().trim().toLowerCase();

    User user = userRepository.findByEmail(email).orElseGet(() -> {
        User newUser = new User();

        String fullName = tokenInfo.getName();

        if (fullName == null || fullName.isBlank()) {
            fullName = email.substring(0, email.indexOf("@"));
        }

        newUser.setEmail(email);
        newUser.setFullName(fullName);
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        newUser.setRole("USER");
        newUser.setActive(true);
        newUser.setAvatar(tokenInfo.getPicture());

        return userRepository.save(newUser);
    });

    if (user.getActive() != null && !user.getActive()) {
        throw new RuntimeException("Tài khoản đã bị khóa");
    }

    String token = jwtService.generateToken(user);

    return new AuthResponse(token, UserResponse.from(user));
    }
}
