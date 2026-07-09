import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DinsosLayout from "./layouts/DinsosLayout";
import YayasanLayout from "./layouts/YayasanLayout";
import Landing from "./pages/Landing";
import About from "./pages/About";
import PublicCampaigns from "./pages/landing/PublicCampaigns";
import FAQ from "./pages/landing/FAQ";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dinsos/Dashboard";
import Foundations from "./pages/dinsos/Foundations";
import Campaigns from "./pages/dinsos/Campaigns";
import Frozen from "./pages/dinsos/Frozen";
import YDashboard from "./pages/yayasan/YDashboard";
import YDonations from "./pages/yayasan/YDonations";
import YCampaigns from "./pages/yayasan/YCampaigns";
import YCreateCampaign from "./pages/yayasan/YCreateCampaign";
import YCampaignDetail from "./pages/yayasan/YCampaignDetail";
import YRAB from "./pages/yayasan/YRAB";
import YRABDetail from "./pages/yayasan/YRABDetail";
import YBeneficiaries from "./pages/yayasan/YBeneficiaries";
import YSettings from "./pages/yayasan/YSettings";

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <DinsosLayout>{children}</DinsosLayout>;
}

function ProtectedYayasan({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <YayasanLayout>{children}</YayasanLayout>;
}

function RedirectBasedOnRole({ type }) {
  const { user } = useAuth();
  if (!user) {
    return type === "login" ? <Login /> : <Register />;
  }
  if (user.role === "FOUNDATION") {
    return <Navigate to="/y/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

function HomeRoute() {
  const { user } = useAuth();
  if (!user) return <Landing />;
  if (user.role === "FOUNDATION") return <Navigate to="/y/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/tentang-kami" element={<About />} />
        <Route path="/kampanye-publik" element={<PublicCampaigns />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/login" element={<RedirectBasedOnRole type="login" />} />
        <Route path="/register" element={<RedirectBasedOnRole type="register" />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/yayasan" element={<Protected><Foundations /></Protected>} />
        <Route path="/kampanye" element={<Protected><Campaigns /></Protected>} />
        <Route path="/beku" element={<Protected><Frozen /></Protected>} />
        
        {/* Yayasan Routes */}
        <Route path="/y/dashboard" element={<ProtectedYayasan><YDashboard /></ProtectedYayasan>} />
        <Route path="/y/donations" element={<ProtectedYayasan><YDonations /></ProtectedYayasan>} />
        <Route path="/y/campaigns" element={<ProtectedYayasan><YCampaigns /></ProtectedYayasan>} />
        <Route path="/y/campaigns/create" element={<ProtectedYayasan><YCreateCampaign /></ProtectedYayasan>} />
        <Route path="/y/campaigns/:id" element={<ProtectedYayasan><YCampaignDetail /></ProtectedYayasan>} />
        <Route path="/y/rab" element={<ProtectedYayasan><YRAB /></ProtectedYayasan>} />
        <Route path="/y/rab/:id" element={<ProtectedYayasan><YRABDetail /></ProtectedYayasan>} />
        <Route path="/y/beneficiaries" element={<ProtectedYayasan><YBeneficiaries /></ProtectedYayasan>} />
        <Route path="/y/settings" element={<ProtectedYayasan><YSettings /></ProtectedYayasan>} />

        <Route path="*" element={
          user ? (user.role === "FOUNDATION" ? <Navigate to="/y/dashboard" replace /> : <Navigate to="/dashboard" replace />) : <Navigate to="/login" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}
