import { createContext, useContext, useState } from "react";

const API = "/api/v2/users";
const UserContext = createContext(null);

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

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    setLoading(true);

    try {
      const data = await sendRequest(API);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  async function createUser(form) {
    await sendRequest(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    await fetchUsers();
  }

  async function updateUser(id, form) {
    const body = {
      username: form.username,
      role: form.role,
      email: form.email,
    };

    if (form.password) {
      body.password = form.password;
    }

    await sendRequest(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    await fetchUsers();
  }

  async function deleteUser(id) {
    await sendRequest(`${API}/${id}`, { method: "DELETE" });
    await fetchUsers();
  }

  const value = {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUsers() {
  return useContext(UserContext);
}
