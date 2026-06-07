const API_URL = "http://localhost:8080/api";

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok || data.code !== 200) {
    throw new Error(data.message || "Có lỗi xảy ra");
  }

  return data.result;
}

export async function loginApi(payload) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function registerApi(payload) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}