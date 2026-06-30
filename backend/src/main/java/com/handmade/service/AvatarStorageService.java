package com.handmade.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class AvatarStorageService {

    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024;
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );
    private static final Set<String> ALLOWED_TYPES = EXTENSIONS.keySet();

    private final Path avatarDirectory;

    public AvatarStorageService(
            @Value("${app.upload.avatar-dir:uploads/avatars}") String avatarDirectory
    ) {
        this.avatarDirectory = Path.of(avatarDirectory).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) {
        validate(file);

        String contentType = file.getContentType().toLowerCase();
        String fileName = UUID.randomUUID() + EXTENSIONS.get(contentType);
        Path destination = avatarDirectory.resolve(fileName).normalize();

        if (!destination.startsWith(avatarDirectory)) {
            throw new RuntimeException("Tên tệp ảnh đại diện không hợp lệ");
        }

        try {
            Files.createDirectories(avatarDirectory);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new RuntimeException("Không thể lưu ảnh đại diện");
        }

        return "/uploads/avatars/" + fileName;
    }

    public void delete(String avatarUrl) {
        if (avatarUrl == null || !avatarUrl.startsWith("/uploads/avatars/")) {
            return;
        }

        String fileName = avatarUrl.substring("/uploads/avatars/".length());
        Path file = avatarDirectory.resolve(fileName).normalize();
        if (!file.startsWith(avatarDirectory)) {
            return;
        }

        try {
            Files.deleteIfExists(file);
        } catch (IOException ignored) {
            // A stale file must not make the profile update fail.
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ảnh đại diện");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Ảnh đại diện không được vượt quá 2 MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new RuntimeException("Chỉ chấp nhận ảnh JPG, PNG hoặc WebP");
        }
    }
}
