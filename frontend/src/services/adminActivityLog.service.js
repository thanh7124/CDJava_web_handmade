const API_URL = "http://localhost:8080/api/admin/activity-logs";

async function parseResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Có lỗi xảy ra khi tải nhật ký hoạt động");
  }

  return data?.result || [];
}

export async function fetchAdminActivityLogs(token, limit = 100) {
  const response = await fetch(`${API_URL}?limit=${limit}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}