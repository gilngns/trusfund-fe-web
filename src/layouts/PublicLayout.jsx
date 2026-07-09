import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Menu, X } from "lucide-react";
import "./PublicLayout.css";

const NAV_LINKS = [
  { href: "#cara-kerja", label: "Cara Kerja", type: "anchor" },
  { href: "#kampanye", label: "Kampanye", type: "anchor" },
  { href: "#transparansi", label: "Transparansi", type: "anchor" },
  { href: "/tentang-kami", label: "Tentang Kami", type: "route" },
];

export default function PublicLayout({ children, scrollLocked = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lenisRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenisRef.current = lenis;
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    let hashTimeout;
    if (location.hash) {
      hashTimeout = setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) lenis.scrollTo(el, { offset: -64, immediate: false });
      }, 300);
    }

    return () => {
      if (hashTimeout) clearTimeout(hashTimeout);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Hands scroll control over to a scroll-driven intro (e.g. ScrollIntro) while it runs.
  // Lenis keeps accumulating a virtual scroll target from wheel input even while
  // stopped, so on release we force that target back to 0 before resuming —
  // otherwise it snaps straight to wherever all that intro scrolling added up to.
  useEffect(() => {
    if (!lenisRef.current) return;
    if (scrollLocked) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.scrollTo(0, { immediate: true });
      lenisRef.current.start();
    }
  }, [scrollLocked]);

  function handleNavClick(e, href) {
    e.preventDefault();
    if (location.pathname === "/") {
      const target = document.querySelector(href);
      if (target && lenisRef.current) {
        lenisRef.current.scrollTo(target, { offset: -64 });
      } else if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/" + href);
    }
    setMobileOpen(false);
  }

  return (
    <div className="landing page-mesh relative min-h-screen text-slate-900 selection:bg-blue-500/20">
      <div className="grain fixed inset-0 pointer-events-none z-[1]" />
      {/* Navbar */}
      <header className={`sticky top-0 z-40 transition-colors ${scrolled ? "bg-white/85 backdrop-blur-md border-b border-slate-200" : "bg-transparent border-b border-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-lg tracking-tight text-slate-900">
            Trust<span className="text-blue-600">Fund</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_LINKS.map((l) => (
              l.type === "route" ? (
                <Link key={l.href} to={l.href} className="text-slate-600 hover:text-slate-900 transition-colors">{l.label}</Link>
              ) : (
                <a key={l.href} href={l.href} onClick={(e) => handleNavClick(e, l.href)} className="text-slate-600 hover:text-slate-900 transition-colors">{l.label}</a>
              )
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 transition-colors">Masuk</Link>
            <Link to="/register" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm shadow-blue-600/20">
              Daftarkan Yayasan
            </Link>
          </div>
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              l.type === "route" ? (
                <Link key={l.href} to={l.href} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-slate-600">{l.label}</Link>
              ) : (
                <a key={l.href} href={l.href} onClick={(e) => handleNavClick(e, l.href)} className="text-sm font-medium text-slate-600">{l.label}</a>
              )
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Link to="/login" className="text-sm font-semibold text-slate-700 py-2">Masuk</Link>
              <Link to="/register" className="text-sm font-semibold text-white bg-blue-600 px-4 py-2.5 rounded-lg text-center">Daftarkan Yayasan</Link>
            </div>
          </div>
        )}
      </header>

      {children}

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="font-display font-bold text-lg tracking-tight mb-3">
              Trust<span className="text-blue-600">Fund</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Sistem verifikasi dan pengawasan dana bantuan sosial untuk Dinas Sosial dan yayasan.
            </p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Navigasi</div>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  {l.type === "route" ? (
                    <Link to={l.href} className="text-slate-600 hover:text-slate-900 transition-colors">{l.label}</Link>
                  ) : (
                    <a href={l.href} onClick={(e) => handleNavClick(e, l.href)} className="text-slate-600 hover:text-slate-900 transition-colors">{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Portal</div>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="text-slate-600 hover:text-slate-900 transition-colors">Masuk Dashboard</Link></li>
              <li><Link to="/register" className="text-slate-600 hover:text-slate-900 transition-colors">Daftarkan Yayasan</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Kontak</div>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>halo@trustfund.id</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 py-5 text-xs text-slate-400">
            &copy; {new Date().getFullYear()} TrustFund. Seluruh hak cipta dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
