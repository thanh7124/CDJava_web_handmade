const API_URL = "http://localhost:8080/api";

async function handleResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`Máy chủ trả về phản hồi không hợp lệ (${response.status} ${response.statusText})`);
  }

  if (!response.ok || data.code !== 200) {
    throw new Error(data?.message || `Yêu cầu thất bại (${response.status} ${response.statusText})`);
  }

  return data.result;
}

function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export async function fetchAdminPromotions(token) {
  const response = await fetch(`${API_URL}/promotions`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
}

export async function createPromotionApi(token, payload) {
  const response = await fetch(`${API_URL}/promotions`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function updatePromotionApi(token, id, payload) {
  const response = await fetch(`${API_URL}/promotions/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function deletePromotionApi(token, id) {
  const response = await fetch(`${API_URL}/promotions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
}
