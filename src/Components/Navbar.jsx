import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../Assets/Images/trailbliss.png";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  if (user?.role === "admin") {
    return (
      <header className="navbar navbar-admin" ref={navRef}>
        <div className="navbar-inner">
          <Link to="/admin" className="navbar-brand">
            <img src={logo} alt="TrailBliss" />
            <span>Trail<strong>Bliss</strong> <small className="admin-badge">Admin</small></span>
          </Link>

          <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            <span /><span /><span />
          </button>

          <nav className={`nav-links ${open ? "open" : ""}`}>
            <NavLink to="/admin" end>🏠 Dashboard</NavLink>
            <NavLink to="/admin#bookings" onClick={() => { navigate("/admin"); setTimeout(() => window.dispatchEvent(new CustomEvent("admin-tab", { detail: "bookings" })), 100); }}>📦 Bookings</NavLink>
            <NavLink to="/admin#enquiries" onClick={() => { navigate("/admin"); setTimeout(() => window.dispatchEvent(new CustomEvent("admin-tab", { detail: "enquiries" })), 100); }}>💬 Enquiries</NavLink>
            <NavLink to="/admin#packages" onClick={() => { navigate("/admin"); setTimeout(() => window.dispatchEvent(new CustomEvent("admin-tab", { detail: "packages" })), 100); }}>🗺️ Packages</NavLink>
            <NavLink to="/admin#users" onClick={() => { navigate("/admin"); setTimeout(() => window.dispatchEvent(new CustomEvent("admin-tab", { detail: "users" })), 100); }}>👥 Users</NavLink>
            <div className="nav-actions">
              <span className="user-greeting">Hi, {user.firstname}</span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
            </div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="navbar" ref={navRef}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="TrailBliss" />
          <span>Trail<strong>Bliss</strong></span>
        </Link>

        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          <span /><span /><span />
        </button>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/packages">Packages</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {user && <NavLink to="/my-bookings">My Bookings</NavLink>}
          <div className="nav-actions">
            {user ? (
              <>
                <span className="user-greeting">Hi, {user.firstname}</span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/signup" className="btn btn-gold btn-sm">Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
