export function AdminTable({
  form,
  mode,
  editingId,
  submitting,
  onChange,
  onSubmit,
  onModeChange,
  onCancel,
}) {
  let title = "Add user";
  let buttonText = "Add user";

  if (mode === "login") {
    title = "Login";
    buttonText = "Login";
  }

  if (editingId) {
    title = "Edit user";
    buttonText = "Save";
  }

  if (submitting) {
    buttonText = "Saving...";
  }

  return (
    <aside className="account-panel">
      {!editingId && (
        <div className="mode-switch">
          <button
            className={mode === "create" ? "active" : ""}
            type="button"
            onClick={() => onModeChange("create")}
          >
            Create
          </button>
          <button
            className={mode === "login" ? "active" : ""}
            type="button"
            onClick={() => onModeChange("login")}
          >
            Login
          </button>
        </div>
      )}

      <div className="panel-heading">
        <h2>{title}</h2>
      </div>

      <form onSubmit={onSubmit}>
        {mode !== "login" && (
          <div className="field-row">
            <label className="field">
              <span>Name</span>
              <input
                name="username"
                value={form.username}
                onChange={onChange}
                placeholder="Enter name"
                required
              />
            </label>

            <label className="field">
              <span>Role</span>
              <select name="role" value={form.role} onChange={onChange}>
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
            onChange={onChange}
            placeholder="Enter email"
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder={editingId ? "New password (optional)" : "Enter password"}
            required={!editingId}
            minLength={editingId ? undefined : 8}
          />
        </label>

        <button className="primary-button" type="submit" disabled={submitting}>
          {buttonText}
        </button>

        {editingId && (
          <button className="cancel-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </form>
    </aside>
  );
}
