import { useEffect, useState } from "react";
import { AdminTable } from "../components/AdminTable.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { UserTable } from "../components/UserTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useUsers } from "../context/UserContext.jsx";

const EMPTY_FORM = {
  username: "",
  role: "user",
  email: "",
  password: "",
};

export default function Home() {
  const { currentUser, checkLogin, loginUser, logoutUser } = useAuth();
  const {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();
  const [form, setForm] = useState(EMPTY_FORM);
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function filterUsers() {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      const username = user.username.toLowerCase();
      const email = user.email.toLowerCase();
      const role = user.role.toLowerCase();

      return (
        username.includes(keyword) ||
        email.includes(keyword) ||
        role.includes(keyword)
      );
    });
  }

  const filteredUsers = filterUsers();

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    try {
      await fetchUsers();
    } catch (requestError) {
      showMessage(requestError.message, true);
    }

    await checkLogin();
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
        const user = await loginUser(form.email, form.password);
        showMessage(`Welcome back, ${user.username}.`);
      } else if (editingId) {
        await updateUser(editingId, form);
        resetForm();
        showMessage("User updated successfully.");
      } else {
        await createUser(form);
        setForm(EMPTY_FORM);
        showMessage("User added successfully.");
      }
    } catch (requestError) {
      showMessage(requestError.message, true);
    } finally {
      setSubmitting(false);
    }
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

  async function handleDelete(id, askForConfirmation = false) {
    if (askForConfirmation) {
      setDeleteId(id);
      return;
    }

    try {
      await deleteUser(id);
      setDeleteId(null);
      showMessage("User deleted successfully.");
    } catch (requestError) {
      showMessage(requestError.message, true);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
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
          onLogout={handleLogout}
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
            onDelete={handleDelete}
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
