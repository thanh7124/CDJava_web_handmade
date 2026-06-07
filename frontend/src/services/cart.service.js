const API_URL = "http://localhost:8080/api";

function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok || data.code !== 200) {
    throw new Error(data.message || "Có lỗi xảy ra khi xử lý giỏ hàng");
  }

  return data.result;
}

export async function fetchCartApi(token) {
  const response = await fetch(`${API_URL}/cart`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return handleResponse(response);
}

export async function addCartItemApi({ token, productId, quantity }) {
  const response = await fetch(`${API_URL}/cart/items`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });

  return handleResponse(response);
}

export async function updateCartItemApi({ token, productId, quantity }) {
  const response = await fetch(`${API_URL}/cart/items/${productId}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });

  return handleResponse(response);
}

export async function removeCartItemApi({ token, productId }) {
  const response = await fetch(`${API_URL}/cart/items/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  return handleResponse(response);
}

export async function clearCartApi(token) {
  const response = await fetch(`${API_URL}/cart/clear`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  const data = await response.json();

  if (!response.ok || data.code !== 200) {
    throw new Error(data.message || "Không thể xóa giỏ hàng");
  }

  return true;
}