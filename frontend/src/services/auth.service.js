const USER_STORAGE_KEY = "handmade_users";
const CURRENT_USER_KEY = "handmade_current_user";

const DEFAULT_USER = {
  id: 1,
  fullName: "Người dùng mẫu",
  email: "demo@handmade.com",
  password: "Demo@123",
  role: "USER",
  createdAt: new Date().toISOString(),
};

function getStoredUsers() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    saveUsers([DEFAULT_USER]);
    return [DEFAULT_USER];
  }

  try {
    const users = JSON.parse(raw);
    if (!Array.isArray(users) || users.length === 0) {
      saveUsers([DEFAULT_USER]);
      return [DEFAULT_USER];
    }
    return users;
  } catch (e) {
    saveUsers([DEFAULT_USER]);
    return [DEFAULT_USER];
  }
}

function saveUsers(users) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

export function getCurrentUser() {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function registerUser({ fullName, email, password }) {
  const users = getStoredUsers();

  const existedUser = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );

  if (existedUser) {
    throw new Error("Email này đã được đăng ký");
  }

  const newUser = {
    id: Date.now(),
    fullName,
    email,
    password,
    role: "USER",
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);

  const currentUser = {
    id: newUser.id,
    fullName: newUser.fullName,
    email: newUser.email,
    role: newUser.role,
    createdAt: newUser.createdAt,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  return currentUser;
}

export function loginUser({ email, password }) {
  const users = getStoredUsers();

  const user = users.find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase() &&
      item.password === password
  );

  if (!user) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const currentUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  return currentUser;
}

export function updateUser({ id, fullName, email }) {
  const users = getStoredUsers();
  const userIndex = users.findIndex((item) => item.id === Number(id));

  if (userIndex === -1) {
    throw new Error("Người dùng không tồn tại");
  }

  const normalizedEmail = email.toLowerCase();
  const emailTaken = users.some(
    (item) =>
      item.email.toLowerCase() === normalizedEmail && item.id !== Number(id)
  );

  if (emailTaken) {
    throw new Error("Email này đã được sử dụng bởi tài khoản khác");
  }

  users[userIndex] = {
    ...users[userIndex],
    fullName: fullName.trim(),
    email: normalizedEmail,
  };

  saveUsers(users);

  const updatedCurrentUser = {
    id: users[userIndex].id,
    fullName: users[userIndex].fullName,
    email: users[userIndex].email,
    role: users[userIndex].role,
    createdAt: users[userIndex].createdAt,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrentUser));

  return updatedCurrentUser;
}

export function updateUserPassword({ id, currentPassword, newPassword }) {
  const users = getStoredUsers();
  const userIndex = users.findIndex((item) => item.id === Number(id));

  if (userIndex === -1) {
    throw new Error("Người dùng không tồn tại");
  }

  if (users[userIndex].password !== currentPassword) {
    throw new Error("Mật khẩu hiện tại không đúng");
  }

  users[userIndex] = {
    ...users[userIndex],
    password: newPassword,
  };

  saveUsers(users);
  return true;
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}