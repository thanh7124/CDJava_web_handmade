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

export async function fetchAdminProducts(token, params = {}) {
  const searchParams = new URLSearchParams();
  searchParams.append("search", params.search || "");
  if (params.categoryId) searchParams.append("categoryId", params.categoryId);
  searchParams.append("sort", params.sort || "newest");
  searchParams.append("page", params.page || 1);
  searchParams.append("limit", params.limit || 100);

  const response = await fetch(`${API_URL}/products?${searchParams.toString()}`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
}

export async function createAdminProduct(token, payload) {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function updateAdminProduct(token, id, payload) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function deleteAdminProduct(token, id) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
}

export async function fetchCategoriesApi(token) {
  const response = await fetch(`${API_URL}/categories`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
}
