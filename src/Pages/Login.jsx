import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (errors.general) setErrors((prev) => ({ ...prev, general: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      // Backend sets httpOnly cookie, returns user data only
      const { data } = await api.post("/user/login", {
        email: form.email,
        password: form.password,
      });
      login(data.data);
      navigate("/");
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Login failed. Please try again." });
    } finally {
      setLoading(false);
    }
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
          {errors.general && (
            <div className="auth-error-banner">{errors.general}</div>
          )}

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
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="auth-row">
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
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
