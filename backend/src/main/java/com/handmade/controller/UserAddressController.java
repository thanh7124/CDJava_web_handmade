package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.UserAddressResponse;
import com.handmade.service.UserAddressService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
public class UserAddressController {

    private final UserAddressService userAddressService;

    public UserAddressController(UserAddressService userAddressService) {
        this.userAddressService = userAddressService;
    }

    @GetMapping
    public ApiResponse<List<UserAddressResponse>> getAll(Principal principal) {
        requireAuth(principal);
        return ApiResponse.ok("Lấy danh sách địa chỉ thành công",
                userAddressService.getAddresses(principal.getName()));
    }

    @PostMapping
    public ApiResponse<UserAddressResponse> add(
            Principal principal,
            @RequestBody Map<String, Object> body
    ) {
        requireAuth(principal);

        String recipientName = (String) body.get("recipientName");
        String phone         = (String) body.get("phone");
        String address       = (String) body.get("address");
        Boolean setDefault   = body.get("isDefault") instanceof Boolean
                ? (Boolean) body.get("isDefault")
                : Boolean.parseBoolean(String.valueOf(body.get("isDefault")));

        if (recipientName == null || recipientName.isBlank()
                || phone == null || phone.isBlank()
                || address == null || address.isBlank()) {
            throw new RuntimeException("Vui lòng điền đầy đủ thông tin địa chỉ");
        }

        if (!phone.trim().matches("\\d{10}")) {
            throw new RuntimeException("Số điện thoại phải có đúng 10 chữ số");
        }

        return ApiResponse.ok("Thêm địa chỉ thành công",
                userAddressService.addAddress(principal.getName(), recipientName, phone, address, setDefault));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(Principal principal, @PathVariable Long id) {
        requireAuth(principal);
        userAddressService.deleteAddress(principal.getName(), id);
        return ApiResponse.ok("Xóa địa chỉ thành công", null);
    }

    @PutMapping("/{id}/default")
    public ApiResponse<UserAddressResponse> setDefault(Principal principal, @PathVariable Long id) {
        requireAuth(principal);
        return ApiResponse.ok("Đặt địa chỉ mặc định thành công",
                userAddressService.setDefault(principal.getName(), id));
    }

    private void requireAuth(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }
    }
}
