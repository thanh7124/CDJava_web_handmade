const API_URL = "http://localhost:8080/api";

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok || data.code !== 200) {
    throw new Error(data.message || "Có lỗi xảy ra");
  }

  return data.result;
}

function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export async function fetchAdminCategories(token) {
  const response = await fetch(`${API_URL}/categories`, {
    headers: getAuthHeaders(token),
  });

  return handleResponse(response);
}

export async function createCategoryApi(token, payload) {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function deleteCategoryApi(token, id) {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  return handleResponse(response);
}

export async function updateCategoryApi(token, id, payload) {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}
