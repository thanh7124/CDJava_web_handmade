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
    throw new Error(data.message || "Có lỗi xảy ra khi xử lý đơn hàng");
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
export const OrderService = {
  fetchMyOrders: fetchMyOrdersApi,
  fetchOrderById: fetchOrderByIdApi,
  checkout: checkoutApi,
};

export const orderService = {
  fetchMyOrders: fetchMyOrdersApi,
  fetchOrderById: fetchOrderByIdApi,
  checkout: checkoutApi,
};