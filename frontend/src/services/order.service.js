const API_URL = "http://localhost:8080/api";

function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

async function handleResponse(response) {
  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Máy chủ trả về dữ liệu không hợp lệ (${response.status} ${response.statusText})`
      );
    }
  }

  if (!response.ok || data?.code !== 200) {
    if (data?.message) {
      throw new Error(data.message);
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("Phiên đăng nhập đã hết hạn hoặc bạn không có quyền thực hiện thao tác này");
    }
    throw new Error(
      `Không thể xử lý đơn hàng (${response.status} ${response.statusText || "Không có phản hồi"})`
    );
  }

  return data.result;
}

export async function checkoutApi(token, payload) {
  const response = await fetch(`${API_URL}/orders/checkout`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function fetchMyOrdersApi(token) {
  const response = await fetch(`${API_URL}/orders/my`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return handleResponse(response);
}

export async function fetchOrderByIdApi(token, orderId) {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return handleResponse(response);
}

export async function cancelOrderApi(token, orderId) {
  const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
    method: "PUT",
    headers: getAuthHeaders(token),
  });

  return handleResponse(response);
}

export const OrderService = {
  fetchMyOrders: fetchMyOrdersApi,
  fetchOrderById: fetchOrderByIdApi,
  checkout: checkoutApi,
  cancelOrder: cancelOrderApi,
};

export const orderService = {
  fetchMyOrders: fetchMyOrdersApi,
  fetchOrderById: fetchOrderByIdApi,
  checkout: checkoutApi,
  cancelOrder: cancelOrderApi,
};
