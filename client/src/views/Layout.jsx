import { Navbar } from "../components/Navbar.jsx";

export function Layout({ children, navbarProps }) {
  return (
    <div className="page-wrap">
      <Navbar {...navbarProps} />
      {children}
    </div>
  );
}
