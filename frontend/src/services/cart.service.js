const API_URL = "http://localhost:8080/api";

function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

async function handleResponse(response) {
  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Máy chủ trả về phản hồi không hợp lệ (${response.status})`
      );
    }
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Bạn cần đăng nhập để sử dụng giỏ hàng");
    }

    throw new Error(
      data?.message || text || `Yêu cầu thất bại (${response.status})`
    );
  }

  if (data?.code && data.code !== 200) {
    throw new Error(data.message || "Có lỗi xảy ra khi xử lý giỏ hàng");
  }

  return data?.result || data || { items: [] };
}

export async function fetchCartApi(token) {
  if (!token) {
    return { items: [] };
  }

  const response = await fetch(`${API_URL}/cart`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return handleResponse(response);
}

export async function addCartItemApi({ token, productId, quantity }) {
  if (!token) {
    throw new Error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
  }

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
  if (!token) {
    throw new Error("Bạn cần đăng nhập để cập nhật giỏ hàng");
  }

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
  if (!token) {
    throw new Error("Bạn cần đăng nhập để xóa sản phẩm khỏi giỏ hàng");
  }

  const response = await fetch(`${API_URL}/cart/items/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  return handleResponse(response);
}

export async function clearCartApi(token) {
  if (!token) {
    throw new Error("Bạn cần đăng nhập để xóa giỏ hàng");
  }

  const response = await fetch(`${API_URL}/cart/clear`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  await handleResponse(response);

  return true;
}