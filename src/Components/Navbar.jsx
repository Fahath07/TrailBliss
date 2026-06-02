import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../Assets/Images/trailbliss.png";
import "./Navbar.css";

// User utilities built into component with error handling
const getUserFromStorage = () => {
  try {
    const stored = localStorage.getItem('trailbliss_user') || sessionStorage.getItem('trailbliss_user');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    localStorage.removeItem('trailbliss_user');
    sessionStorage.removeItem('trailbliss_user');
    return null;
  }
};
const clearUserStorage = () => {
  try {
    localStorage.removeItem('trailbliss_user');
    sessionStorage.removeItem('trailbliss_user');
  } catch (error) {
    // Silent fail
  }
};

function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navRef = useRef(null);
  const location = useLocation();

  // Check for user on component mount and listen for login events
  useEffect(() => {
    setUser(getUserFromStorage());
    
    const handleUserLogin = () => setUser(getUserFromStorage());
    window.addEventListener('userLogin', handleUserLogin);
    return () => window.removeEventListener('userLogin', handleUserLogin);
  }, []);

  // Logout function
  const logout = () => {
    setUser(null);
    clearUserStorage();
    setOpen(false);
  };

  // close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // close the menu when user clicks outside the navbar
  useEffect(() => {
    function handleOutsideClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <header className="navbar" ref={navRef}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="TrailBliss" />
          <span>Trail<strong>Bliss</strong></span>
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span /><span /><span />
        </button>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/packages">Packages</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <div className="nav-actions">
            {user ? (
              <>
                <span className="user-greeting">Hi, {user.firstName}</span>
                <button onClick={logout} className="btn btn-outline btn-sm">
                  Logout
                </button>
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
