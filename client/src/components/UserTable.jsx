function getInitials(username = "") {
  return username.slice(0, 2).toUpperCase();
}

export function UserTable({
  users,
  totalUsers,
  search,
  loading,
  deleteId,
  onSearch,
  onEdit,
  onDelete,
  onCancelDelete,
}) {
  return (
    <section className="directory-panel">
      <div className="directory-head">
        <div className="user-title">
          <h2>Users</h2>
          <span className="total-count">{totalUsers} users</span>
        </div>

        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={onSearch}
            placeholder="Search users"
            aria-label="Search users"
          />
        </label>
      </div>

      {loading && (
        <div className="state-box">
          <span className="loader" />
          <p>Loading users...</p>
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="state-box">
          <h3>No users found</h3>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="member-grid">
          {users.map((user) => {
            const role = user.role === "admin" ? "admin" : "user";

            return (
              <article className="member-card" key={user._id}>
                <div className="avatar-wrap">
                  <span className="member-avatar">{getInitials(user.username)}</span>
                </div>

                <h3>{user.username}</h3>
                <p className="member-email">{user.email}</p>

                <div className="card-topline">
                  <span className={`role-chip role-${role}`}>{role}</span>
                </div>

                <div className="card-actions">
                  {deleteId === user._id ? (
                    <>
                      <button
                        className="danger-action"
                        type="button"
                        onClick={() => onDelete(user._id)}
                      >
                        Delete user
                      </button>
                      <button type="button" onClick={onCancelDelete}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => onEdit(user)}>
                        Edit
                      </button>
                      <button
                        className="delete-action"
                        type="button"
                        onClick={() => onDelete(user._id, true)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
