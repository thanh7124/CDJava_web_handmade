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

export async function fetchAdminOrders(token) {
  const response = await fetch(`${API_URL}/admin/orders`, {
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

export async function deleteOrderApi(token, id) {
  const response = await fetch(`${API_URL}/admin/orders/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
}
