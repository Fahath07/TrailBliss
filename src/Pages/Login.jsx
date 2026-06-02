import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

// Auth utilities built into the component with error handling
const getStoredUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('trailbliss_users') || '[]');
  } catch (error) {
    return [];
  }
};
const setUserInStorage = (userData, remember) => {
  try {
    if (remember) {
      localStorage.setItem('trailbliss_user', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('trailbliss_user', JSON.stringify(userData));
    }
  } catch (error) {
    // Silent fail
  }
};
const isEmailRegistered = (email) => {
  return getStoredUsers().some(user => user.email === email);
};
const authenticateUser = (email, password) => {
  return getStoredUsers().find(user => user.email === email && user.password === password);
};

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // single handler for all fields — keeps things clean
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    // clear the error for that field as the user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Enter a valid email";
    } else if (!isEmailRegistered(form.email)) {
      errs.email = "Email not registered. Please sign up first";
    }
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    setLoading(true);
    
    // Authenticate user
    const authenticatedUser = authenticateUser(form.email, form.password);
    
    setTimeout(() => {
      if (authenticatedUser) {
        const userData = {
          email: authenticatedUser.email,
          firstName: authenticatedUser.firstName,
          lastName: authenticatedUser.lastName,
          phone: authenticatedUser.phone
        };
        setUserInStorage(userData, form.remember);
        setLoading(false);
        navigate("/");
        // Dispatch custom event to update navbar
        window.dispatchEvent(new Event('userLogin'));
      } else {
        setLoading(false);
        setErrors({ password: "Invalid email or password" });
      }
    }, 800);
  }

  return (
    <div className="auth-page">
      <div className="auth-card card fade-up">
        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h2>Welcome Back</h2>
          <p>Sign in to your TrailBliss account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              className={`form-control ${errors.email ? "input-error" : ""}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-with-icon">
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                name="password"
                className={`form-control ${errors.password ? "input-error" : ""}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="auth-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup" className="auth-link">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
