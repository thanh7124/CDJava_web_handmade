package com.handmade.service;

import com.handmade.dto.UserAddressResponse;
import com.handmade.entity.UserAddress;
import com.handmade.repository.UserAddressRepository;
import com.handmade.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserAddressService {

    private final UserAddressRepository userAddressRepository;
    private final UserRepository userRepository;

    public UserAddressService(UserAddressRepository userAddressRepository, UserRepository userRepository) {
        this.userAddressRepository = userAddressRepository;
        this.userRepository = userRepository;
    }

    public List<UserAddressResponse> getAddresses(String email) {
        Long userId = getUserId(email);
        return userAddressRepository
                .findByUserIdOrderByIsDefaultDescCreatedDateAsc(userId)
                .stream()
                .map(UserAddressResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserAddressResponse addAddress(String email, String recipientName, String phone,
                                          String address, Boolean setDefault) {
        Long userId = getUserId(email);

        boolean forceDefault = Boolean.TRUE.equals(setDefault)
                || userAddressRepository.findByUserIdOrderByIsDefaultDescCreatedDateAsc(userId).isEmpty();

        if (forceDefault) {
            userAddressRepository.clearDefaultByUserId(userId);
        }

        UserAddress a = new UserAddress();
        a.setUserId(userId);
        a.setRecipientName(recipientName.trim());
        a.setPhone(phone.trim());
        a.setAddress(address.trim());
        a.setIsDefault(forceDefault);

        return UserAddressResponse.from(userAddressRepository.save(a));
    }

    @Transactional
    public void deleteAddress(String email, Long addressId) {
        Long userId = getUserId(email);
        UserAddress a = userAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        boolean wasDefault = Boolean.TRUE.equals(a.getIsDefault());
        userAddressRepository.delete(a);

        if (wasDefault) {
            List<UserAddress> remaining = userAddressRepository
                    .findByUserIdOrderByIsDefaultDescCreatedDateAsc(userId);
            if (!remaining.isEmpty()) {
                remaining.get(0).setIsDefault(true);
                userAddressRepository.save(remaining.get(0));
            }
        }
    }

    @Transactional
    public UserAddressResponse setDefault(String email, Long addressId) {
        Long userId = getUserId(email);
        userAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        userAddressRepository.clearDefaultByUserId(userId);

        UserAddress a = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));
        a.setIsDefault(true);

        return UserAddressResponse.from(userAddressRepository.save(a));
    }

    private Long getUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"))
                .getId();
    }
}
