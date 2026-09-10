import { useEffect, useState } from "react";

const API_URL = "/api/v2/users/pg";

export default function App() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formMode, setFormMode] = useState("signup");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getUsers();
  }, []);

  async function getUsers() {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || result.error);
      setUsers(result.data);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    let url = API_URL;
    let method = "POST";
    let body = { username, email, password };

    if (formMode === "login") {
      url = `${API_URL}/login`;
      body = { email, password };
    }

    if (editingId) {
      url = `${API_URL}/${editingId}`;
      method = "PUT";
      body = { username, email };
      if (password) body.password = password;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || result.error);

      if (editingId) setMessage("Account updated successfully");
      else if (formMode === "login") setMessage(`Welcome back, ${result.data.username}`);
      else setMessage("Account created successfully");

      clearForm();
      getUsers();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  }

  function editUser(user) {
    setEditingId(user.id);
    setFormMode("signup");
    setUsername(user.username);
    setEmail(user.email);
    setPassword("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteUser(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || result.error);

      setMessage("Account deleted successfully");
      setDeleteId(null);
      getUsers();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  }

  function clearForm() {
    setUsername("");
    setEmail("");
    setPassword("");
    setEditingId(null);
  }

  function changeForm(mode) {
    clearForm();
    setFormMode(mode);
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-zinc-950 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex items-end justify-between border-b border-zinc-200 pb-7">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">Account directory</p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Members</h1>
            <p className="mt-2 text-sm text-zinc-500">Create and manage member accounts.</p>
          </div>
          <div className="hidden h-2.5 w-2.5 rounded-full bg-emerald-500 sm:block" title="Connected" />
        </header>

        {message && (
          <div className={`mb-8 border-l-2 px-4 py-2 text-sm ${message.startsWith("Error") ? "border-red-500 text-red-700" : "border-emerald-500 text-emerald-700"}`}>
            {message}
          </div>
        )}

        <div className="grid items-start gap-12 lg:grid-cols-[340px_1fr] lg:gap-20">
          <form onSubmit={handleSubmit}>
            {!editingId && (
              <div className="mb-8 flex border-b border-zinc-200">
                <button type="button" onClick={() => changeForm("signup")} className={`flex-1 border-b-2 pb-3 text-sm font-medium ${formMode === "signup" ? "border-zinc-950 text-zinc-950" : "border-transparent text-zinc-400"}`}>
                  Sign up
                </button>
                <button type="button" onClick={() => changeForm("login")} className={`flex-1 border-b-2 pb-3 text-sm font-medium ${formMode === "login" ? "border-zinc-950 text-zinc-950" : "border-transparent text-zinc-400"}`}>
                  Login
                </button>
              </div>
            )}

            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-600">
              {editingId ? "EDIT ACCOUNT" : formMode === "login" ? "WELCOME BACK" : "NEW MEMBER"}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              {editingId ? "Edit account" : formMode === "login" ? "Login to your account" : "Create account"}
            </h2>
            <p className="mb-8 mt-2 text-sm leading-6 text-zinc-500">
              {editingId ? "Update the member information below." : formMode === "login" ? "Enter your email and password to continue." : "Sign up a new member using the form below."}
            </p>

            {formMode === "signup" && (
              <label className="mb-4 block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Username</span>
                <input value={username} onChange={(event) => setUsername(event.target.value)} required placeholder="Enter username" className="w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-3 outline-none transition placeholder:text-zinc-300 focus:border-zinc-950" />
              </label>
            )}

            <label className="mb-4 block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="name@example.com" className="w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-3 outline-none transition placeholder:text-zinc-300 focus:border-zinc-950" />
            </label>

            <label className="mb-6 block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Password</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required={!editingId} minLength={editingId ? undefined : 8} placeholder={editingId ? "Leave blank to keep current" : "Enter password"} className="w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-3 outline-none transition placeholder:text-zinc-300 focus:border-zinc-950" />
            </label>

            <button type="submit" className="w-full rounded-lg bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-600">
              {editingId ? "Save changes" : formMode === "login" ? "Login" : "Create account"}
            </button>

            {editingId && (
              <button type="button" onClick={clearForm} className="mt-3 w-full px-5 py-2 text-sm text-zinc-500 hover:text-zinc-950">
                Cancel
              </button>
            )}
          </form>

          <section>
            <div className="flex items-end justify-between border-b border-zinc-950 pb-4">
              <h2 className="text-xl font-semibold tracking-tight">All accounts</h2>
              <p className="text-xs text-zinc-400">{users.length} members</p>
            </div>

            {users.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-semibold">No accounts yet</p>
                <p className="mt-1 text-sm text-zinc-400">Create the first account using the sign-up form.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {users.map((user) => (
                  <div key={user.id} className="group flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-600">{user.username?.charAt(0).toUpperCase()}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{user.username}</p>
                        <p className="truncate text-sm text-zinc-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {deleteId === user.id ? (
                        <>
                          <button type="button" onClick={() => deleteUser(user.id)} className="px-2 py-2 text-sm font-medium text-red-600 hover:text-red-800">
                            Confirm
                          </button>
                          <button type="button" onClick={() => setDeleteId(null)} className="px-2 py-2 text-sm text-zinc-400 hover:text-zinc-950">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => editUser(user)} className="px-2 py-2 text-sm text-zinc-500 transition hover:text-zinc-950">
                            Edit
                          </button>
                          <button type="button" onClick={() => setDeleteId(user.id)} className="px-2 py-2 text-sm text-zinc-400 transition hover:text-red-600">
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
