package com.handmade.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.handmade.dto.GhnLocationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class GhnLocationService {

    private final RestTemplate restTemplate;
    private final String apiBaseUrl;
    private final String token;

    public GhnLocationService(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${ghn.api.base-url}") String apiBaseUrl,
            @Value("${ghn.api.token:}") String token
    ) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
        this.apiBaseUrl = apiBaseUrl;
        this.token = token;
    }

    public List<GhnLocationResponse> getProvinces() {
        JsonNode data = callGhn("/master-data/province", HttpMethod.GET, null);
        return normalizeLocations(data, "ProvinceID", "ProvinceName");
    }

    public List<GhnLocationResponse> getDistricts(Integer provinceId) {
        if (provinceId == null || provinceId <= 0) {
            throw new RuntimeException("Mã tỉnh/thành không hợp lệ");
        }

        JsonNode data = callGhn(
                "/master-data/district",
                HttpMethod.POST,
                Map.of("province_id", provinceId)
        );
        return normalizeLocations(data, "DistrictID", "DistrictName");
    }

    public List<GhnLocationResponse> getWards(Integer districtId) {
        if (districtId == null || districtId <= 0) {
            throw new RuntimeException("Mã quận/huyện không hợp lệ");
        }

        JsonNode data = callGhn(
                "/master-data/ward",
                HttpMethod.POST,
                Map.of("district_id", districtId)
        );
        return normalizeLocations(data, "WardCode", "WardName");
    }

    private JsonNode callGhn(String path, HttpMethod method, Object body) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException(
                    "Chưa cấu hình GHN_API_TOKEN cho backend"
            );
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", token);

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    apiBaseUrl + path,
                    method,
                    new HttpEntity<>(body, headers),
                    JsonNode.class
            );

            JsonNode root = response.getBody();
            if (root == null || root.path("code").asInt() != 200) {
                String message = root == null
                        ? "GHN không trả về dữ liệu"
                        : root.path("message").asText("Không thể lấy dữ liệu từ GHN");
                throw new RuntimeException(message);
            }

            return root.path("data");
        } catch (RestClientResponseException exception) {
            throw new RuntimeException("GHN từ chối yêu cầu: " + exception.getStatusText());
        }
    }

    private List<GhnLocationResponse> normalizeLocations(
            JsonNode data,
            String idField,
            String nameField
    ) {
        if (data == null || data.isMissingNode() || data.isNull()) {
            return Collections.emptyList();
        }

        List<GhnLocationResponse> result = new ArrayList<>();
        if (data.isArray()) {
            data.forEach(item -> addLocation(result, item, idField, nameField));
        } else if (data.isObject()) {
            addLocation(result, data, idField, nameField);
        }
        return result;
    }

    private void addLocation(
            List<GhnLocationResponse> result,
            JsonNode item,
            String idField,
            String nameField
    ) {
        String id = item.path(idField).asText();
        String name = item.path(nameField).asText();
        int status = item.path("Status").asInt(1);

        if (!id.isBlank() && !name.isBlank() && status == 1) {
            result.add(new GhnLocationResponse(id, name));
        }
    }
}
