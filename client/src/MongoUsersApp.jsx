import { useEffect, useMemo, useState } from "react";

const API_URL = "/api/v2/users";
const EMPTY_FORM = { username: "", role: "user", email: "", password: "" };

const initials = (name = "") =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const joined = (date) =>
  date
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date))
    : "Recently";

export default function MongoUsersApp() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? users.filter((user) =>
          [user.username, user.email, user.role].some((value) =>
            value?.toLowerCase().includes(query),
          ),
        )
      : users;
  }, [search, users]);

  useEffect(() => {
    loadUsers();
    checkSession();
  }, []);

  async function request(url, options = {}) {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers: options.body
        ? { "Content-Type": "application/json", ...options.headers }
        : options.headers,
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || result.message || "Request failed");
    return result;
  }

  async function loadUsers() {
    setLoading(true);
    try {
      setUsers(await request(API_URL));
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function checkSession() {
    try {
      setCurrentUser((await request(`${API_URL}/auth`)).data);
    } catch {
      setCurrentUser(null);
    }
  }

  function resetForm(nextMode = "create") {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setMode(nextMode);
    setNotice(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setNotice(null);
    try {
      if (mode === "login") {
        const result = await request(`${API_URL}/login`, {
          method: "POST",
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        setCurrentUser(result.user);
        setNotice({
          type: "success",
          text: `Welcome back, ${result.user.username}.`,
        });
      } else if (editingId) {
        const payload = {
          username: form.username,
          role: form.role,
          email: form.email,
        };
        if (form.password) payload.password = form.password;
        await request(`${API_URL}/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setForm(EMPTY_FORM);
        setEditingId(null);
        setNotice({ type: "success", text: "Member profile updated." });
        await loadUsers();
      } else {
        await request(API_URL, { method: "POST", body: JSON.stringify(form) });
        setForm(EMPTY_FORM);
        setNotice({ type: "success", text: "New member added to MongoDB." });
        await loadUsers();
      }
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  function editUser(user) {
    setMode("create");
    setEditingId(user._id);
    setDeleteId(null);
    setNotice(null);
    setForm({
      username: user.username,
      role: user.role === "admin" ? "admin" : "user",
      email: user.email,
      password: "",
    });
    document
      .querySelector(".account-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function deleteUser(id) {
    try {
      await request(`${API_URL}/${id}`, { method: "DELETE" });
      setDeleteId(null);
      setNotice({
        type: "success",
        text: "Member removed from the directory.",
      });
      await loadUsers();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  async function logout() {
    try {
      await request(`${API_URL}/logout`, { method: "POST" });
      setCurrentUser(null);
      setNotice({ type: "success", text: "You are now signed out." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  let formTitle = "Add user";
  let submitButtonText = "Add user";

  if (mode === "login") {
    formTitle = "Login";
    submitButtonText = "Login";
  }

  if (editingId) {
    formTitle = "Edit user";
    submitButtonText = "Save";
  }

  if (submitting) {
    submitButtonText = "Saving…";
  }

  return (
    <main className="app-shell">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="page-wrap">
        <nav className="topbar">
          <a className="brand" href="#top">
            <span className="brand-mark">U</span>
            <span>USERS</span>
          </a>
          <div className="database-status">
            <span className="status-pulse" />
            MongoDB connected
          </div>
          {currentUser ? (
            <div className="session-user">
              <span className="session-avatar">
                {initials(currentUser.username)}
              </span>
              <span className="session-name">{currentUser.username}</span>
              <button type="button" className="text-button" onClick={logout}>
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="text-button"
              onClick={() => resetForm("login")}
            >
              Member login
            </button>
          )}
        </nav>

        <header className="hero" id="top">
          <div>
            <h1>User management</h1>
          </div>
        </header>

        {notice && (
          <div className={`notice ${notice.type}`} role="status">
            <span>{notice.type === "error" ? "!" : "✓"}</span>
            <p>{notice.text}</p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        <div className="workspace-grid">
          <aside className="account-panel">
            {!editingId && (
              <div className="mode-switch">
                <button
                  type="button"
                  className={mode === "create" ? "active" : ""}
                  onClick={() => resetForm("create")}
                >
                  Create
                </button>
                <button
                  type="button"
                  className={mode === "login" ? "active" : ""}
                  onClick={() => resetForm("login")}
                >
                  Login
                </button>
              </div>
            )}
            <div className="panel-heading">
              <div>
                <h2>{formTitle}</h2>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              {mode !== "login" && (
                <div className="field-row">
                  <label className="field">
                    <span>Name</span>
                    <input
                      name="username"
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                      required
                      placeholder="Enter name"
                    />
                  </label>
                  <label className="field">
                    <span>Role</span>
                    <select
                      name="role"
                      value={form.role}
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                      }
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                </div>
              )}
              <label className="field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="Enter email"
                  autoComplete="email"
                />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required={!editingId}
                  minLength={editingId ? undefined : 8}
                  placeholder={
                    editingId ? "New password (optional)" : "Enter password"
                  }
                />
              </label>
              <button
                className="primary-button"
                type="submit"
                disabled={submitting}
              >
                <span>{submitButtonText}</span>
              </button>
              {editingId && (
                <button
                  className="cancel-button"
                  type="button"
                  onClick={() => resetForm("create")}
                >
                  Cancel editing
                </button>
              )}
            </form>
          </aside>

          <section className="directory-panel">
            <div className="directory-head">
              <div className="user-title">
                <h2>Users</h2>
                <span className="total-count">{users.length} users</span>
              </div>
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users"
                  aria-label="Search users"
                />
              </label>
            </div>
            {loading ? (
              <div className="state-box">
                <span className="loader" />
                <p>Loading users…</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="state-box">
                <h3>No users found</h3>
              </div>
            ) : (
              <div className="member-grid">
                {filteredUsers.map((user, index) => (
                  <article className="member-card" key={user._id}>
                    <div className="card-topline">
                      <span>#{String(index + 1).padStart(2, "0")}</span>
                      <span
                        className={`role-chip role-${user.role === "admin" ? "admin" : "user"}`}
                      >
                        {user.role === "admin" ? "admin" : "user"}
                      </span>
                    </div>
                    <div className="avatar-wrap">
                      <span className="member-avatar">
                        {initials(user.username)}
                      </span>
                    </div>
                    <h3>{user.username}</h3>
                    <p className="member-email">{user.email}</p>
                    <p className="joined-date">
                      Joined {joined(user.createdAt)}
                    </p>
                    <div className="card-actions">
                      {deleteId === user._id ? (
                        <>
                          <button
                            type="button"
                            className="danger-action"
                            onClick={() => deleteUser(user._id)}
                          >
                            Delete user
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => editUser(user)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="delete-action"
                            onClick={() => setDeleteId(user._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
        <footer>
          <span>USERS / MONGODB</span>
          <span>Built on MongoDB</span>
          <span>{new Date().getFullYear()}</span>
        </footer>
      </div>
    </main>
  );
}
