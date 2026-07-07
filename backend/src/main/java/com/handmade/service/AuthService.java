package com.handmade.service;

import com.handmade.dto.AuthResponse;
import com.handmade.dto.ForgotPasswordRequest;
import com.handmade.dto.GoogleLoginRequest;
import com.handmade.dto.GoogleTokenInfoResponse;
import com.handmade.dto.LoginRequest;
import com.handmade.dto.RegisterRequest;
import com.handmade.dto.ResetPasswordRequest;
import com.handmade.dto.UserResponse;
import com.handmade.entity.User;
import com.handmade.repository.UserRepository;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AvatarStorageService avatarStorageService;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    private final String googleClientId;
    private final String frontendUrl;
    private final String mailUsername;

    private final RestTemplate restTemplate = new RestTemplate();

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AvatarStorageService avatarStorageService,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${google.client-id:}") String googleClientId,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl,
            @Value("${spring.mail.username:}") String mailUsername
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.avatarStorageService = avatarStorageService;
        this.mailSenderProvider = mailSenderProvider;
        this.googleClientId = googleClientId;
        this.frontendUrl = frontendUrl;
        this.mailUsername = mailUsername;
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
        user.setActive(true);

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

    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new RuntimeException("Chưa cấu hình Google Client ID");
        }

        if (request.getCredential() == null || request.getCredential().isBlank()) {
            throw new RuntimeException("Google credential không được để trống");
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

    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        userRepository.findByEmail(email).ifPresent(user -> {
            if (user.getActive() != null && !user.getActive()) {
                return;
            }

            String resetToken = UUID.randomUUID().toString();
            LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);

            user.setResetPasswordToken(resetToken);
            user.setResetPasswordTokenExpiry(expiryTime);

            userRepository.save(user);

            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

            sendResetPasswordEmail(user.getEmail(), resetLink);
        });
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Liên kết đặt lại mật khẩu không hợp lệ"));

        if (user.getResetPasswordTokenExpiry() == null
                || user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            user.setResetPasswordToken(null);
            user.setResetPasswordTokenExpiry(null);
            userRepository.save(user);

            throw new RuntimeException("Liên kết đặt lại mật khẩu đã hết hạn");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);

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

    private void sendResetPasswordEmail(String toEmail, String resetLink) {
        if (mailUsername == null || mailUsername.isBlank()) {
            printResetPasswordLink(resetLink);
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();

        if (mailSender == null) {
            printResetPasswordLink(resetLink);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom(mailUsername);
            message.setTo(toEmail);
            message.setSubject("Đặt lại mật khẩu Handmade Shop");
            message.setText(
                    "Xin chào,\n\n"
                            + "Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Handmade Shop.\n\n"
                            + "Vui lòng bấm vào liên kết dưới đây để đặt mật khẩu mới:\n"
                            + resetLink + "\n\n"
                            + "Liên kết này có hiệu lực trong 15 phút.\n\n"
                            + "Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email này.\n\n"
                            + "Trân trọng,\n"
                            + "Handmade Shop"
            );

            mailSender.send(message);
        } catch (Exception exception) {
            System.out.println("Không gửi được email đặt lại mật khẩu. Link demo:");
            printResetPasswordLink(resetLink);
        }
    }

    private void printResetPasswordLink(String resetLink) {
        System.out.println("========== RESET PASSWORD LINK ==========");
        System.out.println(resetLink);
        System.out.println("=========================================");
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
}