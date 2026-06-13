const API_URL = "http://localhost:8080/api/addresses";

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok || data.code !== 200) {
    throw new Error(data.message || "Có lỗi xảy ra");
  }
  return data.result;
}

export async function getAddresses(token) {
  const response = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
}

export async function addAddress(token, payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function deleteAddress(token, id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
}

export async function setDefaultAddress(token, id) {
  const response = await fetch(`${API_URL}/${id}/default`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
}
