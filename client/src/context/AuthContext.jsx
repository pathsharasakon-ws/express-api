import { createContext, useContext, useState } from "react";

const API = "/api/v2/users";
const AuthContext = createContext(null);

async function sendRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  async function checkLogin() {
    try {
      const data = await sendRequest(`${API}/auth`);
      setCurrentUser(data.data);
    } catch {
      setCurrentUser(null);
    }
  }

  async function loginUser(email, password) {
    const data = await sendRequest(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setCurrentUser(data.user);
    return data.user;
  }

  async function logoutUser() {
    await sendRequest(`${API}/logout`, { method: "POST" });
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    checkLogin,
    loginUser,
    logoutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
