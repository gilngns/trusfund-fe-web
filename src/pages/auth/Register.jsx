import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { authApi, api } from "../../api/client";
import "./Login.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    skKemenkumhamFile: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      let skUrl = "";
      if (form.skKemenkumhamFile) {
        setMsg("Mengupload dokumen SK Kemenkumham...");
        const uploadRes = await api.upload("/upload", form.skKemenkumhamFile);
        skUrl = uploadRes.url;
      }

      setMsg("Memproses pendaftaran...");
      await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        skKemenkumham: skUrl || undefined,
        role: "FOUNDATION",
      });
      setMsg("Registrasi berhasil! Silakan tunggu verifikasi Dinsos sebelum membuat kampanye.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (e) {
      setErr(e.message);
      setMsg("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-container" style={{ padding: "2rem 0" }}>
      <div className="login-box" style={{ maxWidth: "500px", padding: "2rem" }}>
        <div className="login-logo">
          <h2>TrustFund</h2>
          <p style={{ marginTop: "0.5rem", color: "#666" }}>Pendaftaran Yayasan</p>
        </div>

        <form className="login-form" onSubmit={submit}>
          <div className="form-group">
            <label>Nama Yayasan <span className="req">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              placeholder="Masukkan nama yayasan"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email <span className="req">*</span></label>
            <input
              type="email"
              name="email"
              value={form.email}
              placeholder="email@yayasan.com"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password <span className="req">*</span></label>
            <div className="input-with-icon">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                placeholder="Minimal 6 karakter"
                onChange={handleChange}
                required
                minLength={6}
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

          <div className="form-group">
            <label>SK Kemenkumham (Upload File)</label>
            <input
              type="file"
              name="skKemenkumham"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setForm({ ...form, skKemenkumhamFile: e.target.files[0] })}
            />
          </div>


          {err && <div className="err-msg">{err}</div>}
          {msg && <div style={{ color: "green", fontSize: "14px", marginBottom: "1rem", textAlign: "center", backgroundColor: "#e6fffa", padding: "10px", borderRadius: "4px" }}>{msg}</div>}

          <button type="submit" className="login-btn" disabled={busy}>
            {busy ? "Mendaftar..." : "Daftar Yayasan"}
          </button>
          
          <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "14px", color: "#666" }}>
            Sudah punya akun? <Link to="/login" style={{ color: "#4a8b92", textDecoration: "none", fontWeight: "600" }}>Login di sini</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
