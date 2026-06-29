const API_URL = "http://localhost:8080/api";

async function handleResponse(response) {
  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
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
    throw new Error(data?.message || "Có lỗi xảy ra khi xử lý đơn hàng");
  }

  return data?.result || data || null;
}

function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export async function fetchAdminOrders(token) {
  const response = await fetch(`${API_URL}/admin/orders`, {
    headers: getAuthHeaders(token),
  });

  return handleResponse(response);
}

export async function fetchAdminOrder(token, id) {
  const response = await fetch(`${API_URL}/admin/orders/${id}`, {
    headers: getAuthHeaders(token),
  });

  return handleResponse(response);
}

export async function updateOrderStatusApi(token, id, status) {
  const response = await fetch(`${API_URL}/admin/orders/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ status }),
  });

  return handleResponse(response);
}

export async function updateAdminOrderApi(token, id, payload) {
  const response = await fetch(`${API_URL}/admin/orders/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function updateOrderPaymentApi(
  token,
  id,
  { paymentStatus, transactionCode, note }
) {
  const response = await fetch(`${API_URL}/admin/orders/${id}/payment`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      paymentStatus,
      transactionCode,
      note,
    }),
  });

  return handleResponse(response);
}

export async function deleteOrderApi(token, id) {
  const response = await fetch(`${API_URL}/admin/orders/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  return handleResponse(response);
}