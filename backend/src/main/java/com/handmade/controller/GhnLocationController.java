package com.handmade.controller;

import com.handmade.dto.ApiResponse;
import com.handmade.dto.GhnLocationResponse;
import com.handmade.service.GhnLocationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/shipping/locations")
public class GhnLocationController {

    private final GhnLocationService ghnLocationService;

    public GhnLocationController(GhnLocationService ghnLocationService) {
        this.ghnLocationService = ghnLocationService;
    }

    @GetMapping("/provinces")
    public ApiResponse<List<GhnLocationResponse>> getProvinces() {
        return ApiResponse.ok(
                "Lấy danh sách tỉnh/thành thành công",
                ghnLocationService.getProvinces()
        );
    }

    @GetMapping("/districts")
    public ApiResponse<List<GhnLocationResponse>> getDistricts(
            @RequestParam Integer provinceId
    ) {
        return ApiResponse.ok(
                "Lấy danh sách quận/huyện thành công",
                ghnLocationService.getDistricts(provinceId)
        );
    }

    @GetMapping("/wards")
    public ApiResponse<List<GhnLocationResponse>> getWards(
            @RequestParam Integer districtId
    ) {
        return ApiResponse.ok(
                "Lấy danh sách phường/xã thành công",
                ghnLocationService.getWards(districtId)
        );
    }
}
