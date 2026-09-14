export function Navbar({ currentUser, onLogin, onLogout }) {
  return (
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
          <span className="session-name">{currentUser.username}</span>
          <button className="text-button" type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      ) : (
        <button className="text-button" type="button" onClick={onLogin}>
          Login
        </button>
      )}
    </nav>
  );
}
