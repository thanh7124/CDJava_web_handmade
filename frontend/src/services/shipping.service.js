const API_URL = "http://localhost:8080/api/shipping/locations";

async function handleResponse(response) {
  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Backend trả về dữ liệu không hợp lệ (HTTP ${response.status})`
      );
    }
  }

  if (!response.ok || data?.code !== 200) {
    throw new Error(
      data?.message ||
        `Không thể tải dữ liệu địa chỉ GHN (HTTP ${response.status})`
    );
  }

  return data.result || [];
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getGhnProvinces(token) {
  const response = await fetch(`${API_URL}/provinces`, {
    headers: authHeaders(token),
  });
  return handleResponse(response);
}

export async function getGhnDistricts(token, provinceId) {
  const response = await fetch(
    `${API_URL}/districts?provinceId=${encodeURIComponent(provinceId)}`,
    { headers: authHeaders(token) }
  );
  return handleResponse(response);
}

export async function getGhnWards(token, districtId) {
  const response = await fetch(
    `${API_URL}/wards?districtId=${encodeURIComponent(districtId)}`,
    { headers: authHeaders(token) }
  );
  return handleResponse(response);
}
