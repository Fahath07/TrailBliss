import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Auth.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleSendOTP(e) {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address"); return; }
    setLoading(true);
    try {
      await api.post("/user/send-otp", { email });
      setStep(2);
      setCountdown(30);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    if (!otp.trim()) { setError("Enter the OTP"); return; }
    setLoading(true);
    try {
      await api.post("/user/verify-otp", { email, otp });
      setStep(3);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!password) { setError("Password is required"); return; }
    if (password.length < 8) { setError("Min. 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      await api.post("/user/reset-password", { email, otp, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    try {
      await api.post("/user/send-otp", { email });
      setCountdown(30);
      setOtp("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card fade-up">

        {step === 1 && (
          <>
            <div className="auth-header">
              <div className="auth-icon">🔑</div>
              <h2>Reset Password</h2>
              <p>Enter your email and we'll send you an OTP</p>
            </div>
            <form className="auth-form" onSubmit={handleSendOTP} noValidate>
              <div className="form-group">
                <label htmlFor="reset-email">Email Address</label>
                <input id="reset-email" type="email"
                  className={`form-control ${error ? "input-error" : ""}`}
                  placeholder="you@example.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }} />
                {error && <span className="error-msg">{error}</span>}
              </div>
              <button type="submit" className="btn btn-primary"
                style={{ width: "100%", marginTop: 8 }} disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
            <p className="auth-switch" style={{ marginTop: 24 }}>
              Remembered it? <Link to="/login" className="auth-link">Back to Login</Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="auth-header">
              <div className="auth-icon">📬</div>
              <h2>Enter OTP</h2>
              <p>We sent a 6-digit OTP to <strong>{email}</strong></p>
            </div>
            <form className="auth-form" onSubmit={handleVerifyOTP} noValidate>
              <div className="form-group">
                <label htmlFor="otp">OTP</label>
                <input id="otp" type="text" maxLength={6}
                  className={`form-control ${error ? "input-error" : ""}`}
                  placeholder="Enter 6-digit OTP" value={otp}
                  onChange={(e) => { setOtp(e.target.value); setError(""); }} />
                {error && <span className="error-msg">{error}</span>}
              </div>
              <button type="submit" className="btn btn-primary"
                style={{ width: "100%", marginTop: 8 }} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button type="button" className="btn btn-secondary"
                style={{ width: "100%", marginTop: 8 }}
                disabled={countdown > 0 || loading} onClick={handleResend}>
                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
              </button>
            </form>
            <p className="auth-switch" style={{ marginTop: 20 }}>
              <Link to="/login" className="auth-link">← Back to Login</Link>
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <div className="auth-header">
              <div className="auth-icon">🔒</div>
              <h2>New Password</h2>
              <p>Set a new password for your account</p>
            </div>
            <form className="auth-form" onSubmit={handleResetPassword} noValidate>
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input id="new-password" type="password"
                  className={`form-control ${error ? "input-error" : ""}`}
                  placeholder="Min. 8 characters" value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }} />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input id="confirm-password" type="password"
                  className={`form-control ${error ? "input-error" : ""}`}
                  placeholder="Repeat password" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }} />
                {error && <span className="error-msg">{error}</span>}
              </div>
              <button type="submit" className="btn btn-primary"
                style={{ width: "100%", marginTop: 8 }} disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}

export default ForgotPassword;
