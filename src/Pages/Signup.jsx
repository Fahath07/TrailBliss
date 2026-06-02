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
const saveUser = (userData) => {
  try {
    const users = getStoredUsers();
    users.push(userData);
    localStorage.setItem('trailbliss_users', JSON.stringify(users));
  } catch (error) {
    // Silent fail
  }
};
const isEmailRegistered = (email) => {
  return getStoredUsers().some(user => user.email === email);
};

// quick helper — tells us how strong the password is
// returns 0-3 so we can show a coloured bar
function getPasswordStrength(pass) {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];

function Signup() {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });
  const [errors, setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);

  const strength = getPasswordStrength(form.password);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim())  errs.lastName  = "Required";
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Enter a valid email";
    } else if (isEmailRegistered(form.email)) {
      errs.email = "Email already registered. Please login instead";
    }
    if (!form.password)         errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Min. 8 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords don't match";
    if (!form.agreed) errs.agreed = "Please accept the terms to continue";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setLoading(true);
    
    // Create user account
    const userData = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      registeredAt: new Date().toISOString()
    };
    
    setTimeout(() => {
      saveUser(userData);
      setLoading(false);
      setSuccessMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }, 800);
  }

  return (
    <div className="auth-page">
      <div className="auth-card card fade-up">
        <div className="auth-header">
          <div className="auth-icon">🌍</div>
          <h2>Create Account</h2>
          <p>Join TrailBliss and start exploring</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className={`form-control ${errors.firstName ? "input-error" : ""}`}
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className={`form-control ${errors.lastName ? "input-error" : ""}`}
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              className={`form-control ${errors.email ? "input-error" : ""}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="form-control"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <div className="input-with-icon">
              <input
                id="signup-password"
                name="password"
                type={showPass ? "text" : "password"}
                className={`form-control ${errors.password ? "input-error" : ""}`}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {/* password strength bar — only shows once the user starts typing */}
            {form.password.length > 0 && (
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{
                    width: `${(strength / 4) * 100}%`,
                    background: strengthColors[strength],
                  }}
                />
                <span style={{ color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`form-control ${errors.confirmPassword ? "input-error" : ""}`}
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
          </div>

          <label className={`checkbox-label ${errors.agreed ? "input-error" : ""}`} style={{ marginTop: 4 }}>
            <input
              type="checkbox"
              name="agreed"
              checked={form.agreed}
              onChange={handleChange}
            />
            I agree to the{" "}
            <Link to="/terms" className="auth-link">Terms</Link> and{" "}
            <Link to="/privacy" className="auth-link">Privacy Policy</Link>
          </label>
          {errors.agreed && <span className="error-msg">{errors.agreed}</span>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 12 }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
          
          {successMessage && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: 16, 
              padding: 12, 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              color: '#10B981', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {successMessage}
            </div>
          )}
        </form>

        <p className="auth-switch" style={{ marginTop: 20 }}>
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
