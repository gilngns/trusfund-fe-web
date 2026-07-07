import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(email, password);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          {/* 
          <svg width="48" height="56" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 6V13C2 19 6.5 24.5 12 26C17.5 24.5 22 19 22 13V6L12 2Z" stroke="#4a8b92" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M12 2L12 26" stroke="#4a8b92" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 10L12 6L18 10L18 16L12 20L6 16Z" stroke="#4a8b92" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 13L12 16L15 10" stroke="#4a8b92" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          */}
          <h2>TrustFund</h2>
        </div>

        <form className="login-form" onSubmit={submit}>
          <div className="form-group">
            <label>Email address <span className="req">*</span></label>
            <input
              type="email"
              value={email}
              placeholder="yanto@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password <span className="req">*</span></label>
            <div className="input-with-icon">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="••••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-[#A3A3A3]" />
                ) : (
                  <Eye size={18} className="text-[#A3A3A3]" />
                )}
              </button>
            </div>
          </div>

          <div className="form-group remember-group">
            <label className="checkbox-label">
              <input 
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="checkmark"></span>
              Remember me
            </label>
          </div>

          {err && <div className="err-msg">{err}</div>}

          <button type="submit" className="login-btn" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
          
          <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "14px", color: "#666" }}>
            Yayasan belum terdaftar? <a href="/register" style={{ color: "#4a8b92", textDecoration: "none", fontWeight: "600" }}>Daftar di sini</a>
          </div>
        </form>
      </div>
    </div>
  );
}
