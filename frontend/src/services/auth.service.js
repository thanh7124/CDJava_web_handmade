const API_URL = "http://localhost:8080/api";
const CURRENT_USER_KEY = "user";

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

/*
  Các hàm dưới đây giữ lại để tránh lỗi nếu Profile/Header/file cũ còn import.
  Login/Register hiện tại nên dùng AuthContext → loginApi/registerApi.
*/

export async function loginUser(payload) {
  const result = await loginApi(payload);

  const currentUser = {
    ...result.user,
    token: result.token,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  return currentUser;
}

export async function registerUser(payload) {
  const result = await registerApi(payload);

  const currentUser = {
    ...result.user,
    token: result.token,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  return currentUser;
}

export function getCurrentUser() {
  try {
    const rawUser = localStorage.getItem(CURRENT_USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.error("Không thể đọc thông tin người dùng:", error);
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function updateUser({ id, fullName, email, phone }) {
  const currentUser = getCurrentUser();

  if (!currentUser || Number(currentUser.id) !== Number(id)) {
    throw new Error("Người dùng không tồn tại");
  }

  const updatedUser = {
    ...currentUser,
    fullName: fullName?.trim() || currentUser.fullName,
    email: email?.trim().toLowerCase() || currentUser.email,
    phone: phone?.trim() || currentUser.phone,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

  return updatedUser;
}

export async function changePasswordApi(token, payload) {
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function updateProfileApi(token, payload) {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function uploadAvatarApi(token, file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_URL}/auth/avatar`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleResponse(response);
}

export function resolveAvatarUrl(avatar) {
  if (!avatar) return "";
  if (/^https?:\/\//i.test(avatar) || avatar.startsWith("data:") || avatar.startsWith("blob:")) {
    return avatar;
  }
  return `${API_URL.replace(/\/api$/, "")}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
}
