const API_URL = "http://localhost:8080/api";

async function handleResponse(response) {
  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Máy chủ trả về phản hồi không hợp lệ (${response.status} ${response.statusText})`
      );
    }
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Bạn không có quyền thực hiện thao tác này");
    }

    throw new Error(
      data?.message ||
        `Yêu cầu thất bại (${response.status} ${response.statusText})`
    );
  }

  if (data?.code && data.code !== 200) {
    throw new Error(data?.message || "Có lỗi xảy ra khi xử lý sản phẩm");
  }

  return data?.result || data || null;
}

function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

function getUploadHeaders(token) {
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export async function fetchAdminProducts(token, params = {}) {
  const searchParams = new URLSearchParams();

  searchParams.append("search", params.search || "");

  if (params.categoryId) {
    searchParams.append("categoryId", params.categoryId);
  }

  searchParams.append("sort", params.sort || "newest");
  searchParams.append("page", params.page || 1);
  searchParams.append("limit", params.limit || 100);

  const response = await fetch(
    `${API_URL}/products?${searchParams.toString()}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return handleResponse(response);
}

export async function uploadProductImage(token, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/products/upload-image`, {
    method: "POST",
    headers: getUploadHeaders(token),
    body: formData,
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

export async function fetchAdminProduct(token, id) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    headers: getAuthHeaders(token),
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