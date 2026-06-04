const USER_STORAGE_KEY = "handmade_users";
const CURRENT_USER_KEY = "handmade_current_user";

function getStoredUsers() {
  const users = localStorage.getItem(USER_STORAGE_KEY);
  return users ? JSON.parse(users) : [];
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
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  return currentUser;
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}