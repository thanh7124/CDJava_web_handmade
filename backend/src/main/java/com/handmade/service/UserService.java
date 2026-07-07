package com.handmade.service;

import com.handmade.dto.UserAdminUpdateRequest;
import com.handmade.dto.UserResponse;
import com.handmade.entity.User;
import com.handmade.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserAdminUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim().isEmpty() ? null : request.getPhone().trim());
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            String role = request.getRole().trim().toUpperCase();

            if (!"USER".equals(role) && !"ADMIN".equals(role)) {
                throw new RuntimeException("Vai trò không hợp lệ");
            }

            user.setRole(role);
        }

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        userRepository.delete(user);
    }
}