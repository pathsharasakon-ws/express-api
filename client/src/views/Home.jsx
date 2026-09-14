import { useEffect, useMemo, useState } from "react";
import { AdminTable } from "../components/AdminTable.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { UserTable } from "../components/UserTable.jsx";

const API = "/api/v2/users";

const EMPTY_FORM = {
  username: "",
  role: "user",
  email: "",
  password: "",
};

export default function Home() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      const username = user.username?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const role = user.role?.toLowerCase() || "";

      return (
        username.includes(keyword) ||
        email.includes(keyword) ||
        role.includes(keyword)
      );
    });
  }, [search, users]);

  useEffect(() => {
    fetchUsers();
    checkLogin();
  }, []);

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

  async function fetchUsers() {
    setLoading(true);

    try {
      const data = await sendRequest(API);
      setUsers(data);
    } catch (requestError) {
      showMessage(requestError.message, true);
    } finally {
      setLoading(false);
    }
  }

  async function checkLogin() {
    try {
      const data = await sendRequest(`${API}/auth`);
      setCurrentUser(data.data);
    } catch {
      setCurrentUser(null);
    }
  }

  function showMessage(text, isError = false) {
    setMessage(text);
    setError(isError);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  function resetForm(nextMode = "create") {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setMode(nextMode);
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (mode === "login") {
        await loginUser();
      } else if (editingId) {
        await updateUser();
      } else {
        await createUser();
      }
    } catch (requestError) {
      showMessage(requestError.message, true);
    } finally {
      setSubmitting(false);
    }
  }

  async function loginUser() {
    const body = {
      email: form.email,
      password: form.password,
    };

    const data = await sendRequest(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setCurrentUser(data.user);
    showMessage(`Welcome back, ${data.user.username}.`);
  }

  async function createUser() {
    await sendRequest(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm(EMPTY_FORM);
    showMessage("User added successfully.");
    await fetchUsers();
  }

  async function updateUser() {
    const body = {
      username: form.username,
      role: form.role,
      email: form.email,
    };

    if (form.password) {
      body.password = form.password;
    }

    await sendRequest(`${API}/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    resetForm();
    showMessage("User updated successfully.");
    await fetchUsers();
  }

  function editUser(user) {
    setEditingId(user._id);
    setMode("create");
    setDeleteId(null);
    setMessage("");
    setForm({
      username: user.username,
      role: user.role === "admin" ? "admin" : "user",
      email: user.email,
      password: "",
    });
  }

  async function deleteUser(id, askForConfirmation = false) {
    if (askForConfirmation) {
      setDeleteId(id);
      return;
    }

    try {
      await sendRequest(`${API}/${id}`, { method: "DELETE" });
      setDeleteId(null);
      showMessage("User deleted successfully.");
      await fetchUsers();
    } catch (requestError) {
      showMessage(requestError.message, true);
    }
  }

  async function logoutUser() {
    try {
      await sendRequest(`${API}/logout`, { method: "POST" });
      setCurrentUser(null);
      showMessage("Signed out successfully.");
    } catch (requestError) {
      showMessage(requestError.message, true);
    }
  }

  return (
    <main className="app-shell">
      <div className="page-wrap">
        <Navbar
          currentUser={currentUser}
          onLogin={() => resetForm("login")}
          onLogout={logoutUser}
        />

        <header className="hero" id="top">
          <h1>User management</h1>
        </header>

        {message && (
          <div className={error ? "notice error" : "notice"} role="status">
            <p>{message}</p>
            <button type="button" onClick={() => setMessage("")}>
              Close
            </button>
          </div>
        )}

        <div className="workspace-grid">
          <AdminTable
            form={form}
            mode={mode}
            editingId={editingId}
            submitting={submitting}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onModeChange={resetForm}
            onCancel={resetForm}
          />

          <UserTable
            users={filteredUsers}
            totalUsers={users.length}
            search={search}
            loading={loading}
            deleteId={deleteId}
            onSearch={(event) => setSearch(event.target.value)}
            onEdit={editUser}
            onDelete={deleteUser}
            onCancelDelete={() => setDeleteId(null)}
          />
        </div>

        <footer>
          <span>USERS / MONGODB</span>
          <span>{new Date().getFullYear()}</span>
        </footer>
      </div>
    </main>
  );
}
