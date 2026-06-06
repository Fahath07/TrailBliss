import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

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
  const { login } = useAuth();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", confirmPassword: "", agreed: false,
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await profileRes.json();
        const { data } = await api.post("/user/google", {
          googleId: profile.sub,
          email: profile.email,
          firstname: profile.given_name,
          lastname: profile.family_name || "",
          avatar: profile.picture,
        });
        login(data.data);
        navigate("/");
      } catch (err) {
        setErrors({ general: err.response?.data?.message || "Google sign-up failed." });
      }
    },
    onError: () => setErrors({ general: "Google sign-up failed." }),
  });

  const strength = getPasswordStrength(form.password);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (errors.general) setErrors((prev) => ({ ...prev, general: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Min. 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (!form.agreed) errs.agreed = "Please accept the terms to continue";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      // Backend sets httpOnly cookie, returns user data only
      const { data } = await api.post("/user/signup", {
        firstname: form.firstName,
        lastname: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      login(data.data);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      if (msg.toLowerCase().includes("email")) {
        setErrors({ email: msg });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
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
          {errors.general && (
            <div className="auth-error-banner">{errors.general}</div>
          )}

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input id="firstName" name="firstName" type="text"
                className={`form-control ${errors.firstName ? "input-error" : ""}`}
                placeholder="John" value={form.firstName} onChange={handleChange} />
              {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input id="lastName" name="lastName" type="text"
                className={`form-control ${errors.lastName ? "input-error" : ""}`}
                placeholder="Doe" value={form.lastName} onChange={handleChange} />
              {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input id="signup-email" name="email" type="email"
              className={`form-control ${errors.email ? "input-error" : ""}`}
              placeholder="you@example.com" value={form.email} onChange={handleChange} />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" name="phone" type="tel"
              className={`form-control ${errors.phone ? "input-error" : ""}`}
              placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
            {errors.phone && <span className="error-msg">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <div className="input-with-icon">
              <input id="signup-password" name="password"
                type={showPass ? "text" : "password"}
                className={`form-control ${errors.password ? "input-error" : ""}`}
                placeholder="Min. 8 characters" value={form.password} onChange={handleChange} />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className="strength-bar">
                <div className="strength-fill" style={{ width: `${(strength / 4) * 100}%`, background: strengthColors[strength] }} />
                <span style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
              </div>
            )}
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" name="confirmPassword" type="password"
              className={`form-control ${errors.confirmPassword ? "input-error" : ""}`}
              placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
          </div>

          <label className={`checkbox-label ${errors.agreed ? "input-error" : ""}`} style={{ marginTop: 4 }}>
            <input type="checkbox" name="agreed" checked={form.agreed} onChange={handleChange} />
            I agree to the{" "}
            <Link to="/terms" className="auth-link">Terms</Link> and{" "}
            <Link to="/privacy" className="auth-link">Privacy Policy</Link>
          </label>
          {errors.agreed && <span className="error-msg">{errors.agreed}</span>}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 12 }} disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button type="button" className="btn-google" onClick={() => googleLogin()}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={18} height={18} />
          Continue with Google
        </button>

        <p className="auth-switch" style={{ marginTop: 20 }}>
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
