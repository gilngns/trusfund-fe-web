import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  ShieldCheck, BadgeCheck, ArrowRight, ArrowUpRight,
  UserCheck, Calculator, Megaphone, Wallet, CheckCircle2, MapPin,
} from "lucide-react";
import PublicLayout from "../layouts/PublicLayout";
import { Reveal, useInView } from "../components/Reveal";
import CountUp from "../components/CountUp";
import ScrollIntro from "../components/ScrollIntro";
import ProgressBar from "../components/ProgressBar";
import { rp } from "../api/format";
import blockchainLottie from "../assets/asset-blockchain.lottie";
import HeroDualPhones from "../components/HeroDualPhones";
import splashImg from "../assets/Splash.png";
import homeImg from "../assets/HomePage.png";


const TRUST_POINTS = [
  "Verifikasi Berlapis DINSOS",
  "RAB Divalidasi AI",
  "Jejak Transaksi Tak Bisa Diubah",
  "Pencairan Bertahap Terjadwal",
];

const STEPS = [
  { n: "01", icon: UserCheck, title: "Registrasi dan Verifikasi", desc: "Yayasan mendaftar dan melengkapi dokumen legal. Dinas Sosial memverifikasi semuanya sebelum akses penuh diberikan." },
  { n: "02", icon: Calculator, title: "Susun dan Validasi RAB", desc: "Rencana Anggaran Biaya disusun lalu diberi skor validasi otomatis oleh AI sebelum kampanye bisa tayang ke publik." },
  { n: "03", icon: Megaphone, title: "Kampanye Berjalan Transparan", desc: "Donasi dan transaksi tercatat secara real-time. Progres bisa dipantau oleh Dinas Sosial maupun publik kapan saja." },
  { n: "04", icon: Wallet, title: "Pencairan Dana Terlacak", desc: "Dana dicairkan bertahap sesuai milestone. Setiap transaksi punya jejak audit yang bisa ditelusuri kembali." },
];

const CAMPAIGNS = [
  {
    category: "Pendidikan",
    color: "indigo",
    title: "Beasiswa Anak Pesisir 2026",
    foundation: "Yayasan Cahaya Bangsa",
    target: 450000000,
    current: 312750000,
    image: "https://images.pexels.com/photos/35565132/pexels-photo-35565132.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    category: "Kesehatan",
    color: "green",
    title: "Layanan Kesehatan Keliling Desa Terpencil",
    foundation: "Yayasan Sehat Nusantara",
    target: 300000000,
    current: 178500000,
    image: "https://images.pexels.com/photos/7345461/pexels-photo-7345461.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    category: "Bencana Alam",
    color: "amber",
    title: "Tanggap Darurat Banjir Kalimantan",
    foundation: "Yayasan Peduli Bencana",
    target: 600000000,
    current: 512400000,
    image: "https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    category: "Lingkungan",
    color: "teal",
    title: "Rehabilitasi Hutan Mangrove Pesisir",
    foundation: "Yayasan Bumi Lestari",
    target: 250000000,
    current: 96750000,
    image: "https://images.pexels.com/photos/5029853/pexels-photo-5029853.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

const STATS = [
  { target: 128.4, decimals: 1, prefix: "Rp ", suffix: " M+", label: "Dana terlacak di sistem", icon: Wallet },
  { target: 340, suffix: "+", label: "Yayasan terverifikasi", icon: ShieldCheck },
  { target: 1200, suffix: "+", label: "Kampanye diawasi", icon: Megaphone },
  { target: 34, suffix: "", label: "Provinsi terjangkau", icon: MapPin },
];

const TRANSPARENCY_POINTS = [
  "Dana tidak bisa dicairkan sepihak tanpa validasi Dinas Sosial.",
  "RAB divalidasi AI sebelum kampanye tayang ke publik.",
  "Setiap transaksi punya jejak audit dan referensi yang bisa ditelusuri kapan saja.",
  "Kampanye bermasalah otomatis dibekukan (FROZEN) untuk investigasi lebih lanjut.",
];

const LEDGER_ROWS = [
  { id: "TRX-9F21A0C4", hash: "0x8f2e…9c21", campaign: "Tanggap Darurat Banjir Kalimantan", amount: 25000000, status: "Funds Disbursed", dot: "bg-blue-400" },
  { id: "TRX-77BE10D2", hash: "0x1a7d…44b0", campaign: "Beasiswa Anak Pesisir 2026", amount: 5000000, status: "Verified", dot: "bg-sky-400" },
  { id: "TRX-3AC459F1", hash: "0x5c90…e137", campaign: "Layanan Kesehatan Keliling", amount: 12500000, status: "Pending Processing", dot: "bg-amber-400" },
];

const TICKER_ITEMS = [
  ...TRUST_POINTS,
  "Ledger tersinkronisasi setiap transaksi",
  "Node verifikasi DINSOS aktif 24/7",
];

function categoryPillClass(color) {
  const map = {
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    teal: "bg-teal-50 text-teal-700",
  };
  return map[color] || "bg-slate-100 text-slate-600";
}

function CornerNodes({ className }) {
  const nodes = [
    { x: 6, y: 92 },
    { x: 28, y: 62 },
    { x: 12, y: 30 },
    { x: 42, y: 46 },
    { x: 50, y: 14 },
    { x: 78, y: 28 },
    { x: 92, y: 50 },
    { x: 74, y: 74 },
    { x: 46, y: 82 },
    { x: 15, y: 75 },
    { x: 65, y: 55 },
    { x: 85, y: 15 },
    { x: 30, y: 15 },
    { x: 60, y: 90 },
  ];
  const links = [
    [0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5], [5, 6],
    [6, 7], [7, 3], [3, 8], [8, 0], [1, 8],
    [9, 0], [9, 1], [9, 8],
    [10, 3], [10, 5], [10, 7],
    [11, 5], [11, 6],
    [12, 2], [12, 4],
    [13, 8], [13, 7]
  ];
  const hubs = new Set([1, 3, 6, 10, 9]);
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="#2563eb" strokeOpacity="0.75" strokeWidth="1.5"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={hubs.has(i) ? 3.4 : 2.2}
          fill={hubs.has(i) ? "#2563eb" : "#60a5fa"}
          className={hubs.has(i) ? "pulse-dot" : ""}
          style={hubs.has(i) ? { animationDelay: `${i * 0.25}s` } : undefined}
        />
      ))}
    </svg>
  );
}

// Only mounts/plays the Lottie animation while it's actually on screen, so it
// isn't burning CPU/GPU in the background for the rest of the scroll.
function LazyLottie({ src, className }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div ref={ref} className={className}>
      {inView && <DotLottieReact src={src} loop autoplay className="w-full h-full" />}
    </div>
  );
}

export default function Landing() {
  const location = useLocation();
  const skipIntro = location.state?.skipIntro === true;
  const [loading, setLoading] = useState(!skipIntro);

  return (
    <>
      {loading && <ScrollIntro onDone={() => setLoading(false)} />}
      <PublicLayout scrollLocked={loading}>
      {/* Hero — -mt-16 menarik section ke atas supaya partikel tembus ke area navbar */}
      <section className="-mt-16 relative overflow-hidden">
        {/* Komposisi 4 sudut: bingkai penuh — kiri atas & kanan bawah besar, kanan atas & kiri bawah sedang */}
        <CornerNodes className="absolute -top-12 -left-12 w-[200px] h-[200px] opacity-55" />
        <CornerNodes className="absolute -top-8 -right-8 w-[220px] h-[220px] opacity-45 -scale-x-100" />
        <CornerNodes className="absolute -bottom-8 -left-8 w-[200px] h-[200px] opacity-40 -scale-y-100" />
        <CornerNodes className="absolute -bottom-12 -right-12 w-[320px] h-[320px] opacity-55 -scale-x-100 -scale-y-100" />
        
        <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="fade-up">
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
              Satu dashboard untuk mengawasi <span className="gradient-text">setiap rupiah</span> bantuan sosial.
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-7 max-w-xl">
              TrustFund menghubungkan Dinas Sosial dan yayasan terverifikasi dalam satu sistem pencatatan. Mulai dari verifikasi lembaga, validasi anggaran, sampai pencairan dana yang bisa dilacak secara real-time.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg transition-colors shadow-sm shadow-blue-600/25">
                Daftarkan Yayasan <ArrowRight size={16} />
              </Link>
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.18 23.5c.32.18.68.22 1.04.1l13.1-7.57-2.9-2.9-11.24 10.37z" fill="#EA4335"/>
                  <path d="M21.54 10.27L18.3 8.4l-3.24 3.24 3.24 3.24 3.27-1.89a1.87 1.87 0 000-2.72z" fill="#FBBC04"/>
                  <path d="M4.22.4A1.87 1.87 0 003 2.18v19.64c0 .72.4 1.35 1.04 1.68L15.06 12.5 4.22.4z" fill="#4285F4"/>
                  <path d="M4.22.4l10.84 11.74 3.24-3.24L5.26.27A1.88 1.88 0 004.22.4z" fill="#34A853"/>
                </svg>
                <div className="leading-tight text-left">
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">Tersedia di</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {STATS.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <CountUp
                    target={s.target}
                    decimals={s.decimals}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    ready={!loading}
                    className="font-display text-xl font-bold text-slate-900"
                  />
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <HeroDualPhones
            splashScreenshot={splashImg}
            homeScreenshot={homeImg}
            height={600}
          />
        </div>
      </section>

      {/* Ticker */}
      <section className="marquee-row border-y border-slate-800 bg-slate-900 overflow-hidden">
        <div className="flex w-max py-2.5 marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center shrink-0">
              {TICKER_ITEMS.map((label, i) => (
                <div key={`${dup}-${i}`} className="flex items-center gap-2.5 px-6 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-[12px] font-medium text-slate-300 uppercase tracking-wide">{label}</span>
                  <span className="text-slate-700 pl-6">/</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Impact stats */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 70} className="tf-card p-5 flex items-start gap-3.5">
              <span className="icon-chip"><s.icon size={18} /></span>
              <div>
                <CountUp
                  target={s.target}
                  decimals={s.decimals}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  ready={!loading}
                  className="font-display text-2xl font-bold text-slate-900 leading-tight block"
                />
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="relative max-w-7xl mx-auto px-6 py-14 scroll-mt-20">
        <LazyLottie src={blockchainLottie} className="hidden md:block absolute top-2 right-6 w-72 h-72 pointer-events-none opacity-95" />
        <Reveal className="relative max-w-2xl mb-8">
          <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700 mb-2">Cara Kerja</div>
          <h2 className="font-display text-3xl font-bold tracking-tight mb-3">Empat langkah menuju bantuan yang bisa dipertanggungjawabkan.</h2>
          <p className="text-slate-600 leading-relaxed">Dari pendaftaran yayasan sampai dana tiba ke penerima manfaat, semua tahapan tercatat dalam satu alur yang sama.</p>
        </Reveal>
        <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80} className="tf-card p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{s.n}</span>
                <span className="icon-chip"><s.icon size={17} /></span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1.5">{s.title}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured campaigns */}
      <section id="kampanye" className="border-y border-slate-200/70 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="max-w-xl">
              <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700 mb-2">Kampanye</div>
              <h2 className="font-display text-3xl font-bold tracking-tight mb-3">Contoh kampanye yang diawasi dalam sistem.</h2>
              <p className="text-slate-600 leading-relaxed">Setiap kampanye melewati validasi RAB dan pemantauan progres sebelum dana bisa dicairkan ke yayasan pelaksana.</p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAMPAIGNS.map((c, i) => {
              const progress = Math.round((c.current / c.target) * 100);
              return (
                <Reveal key={c.title} delay={i * 80} className="tf-card overflow-hidden">
                  <div className="h-36 overflow-hidden">
                    <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full mb-3 ${categoryPillClass(c.color)}`}>
                      {c.category}
                    </span>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1 leading-snug">{c.title}</h3>
                    <p className="text-xs text-slate-400 mb-4">{c.foundation}</p>
                    <div className="flex justify-between text-[11px] font-medium mb-1.5">
                      <span className="text-slate-500">Progres</span>
                      <span className="text-blue-600">{progress}%</span>
                    </div>
                    <ProgressBar progress={progress} />
                    <div className="text-xs text-slate-500 mt-2.5">
                      <span className="font-semibold text-slate-800">{rp(c.current)}</span> dari {rp(c.target)}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Transparency / ledger */}
      <section id="transparansi" className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-2 gap-10 items-center scroll-mt-20">
        <Reveal>
          <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700 mb-2">Transparansi</div>
          <h2 className="font-display text-3xl font-bold tracking-tight mb-5">Dirancang supaya tidak ada yang bisa disembunyikan.</h2>
          <ul className="space-y-3.5">
            {TRANSPARENCY_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-slate-600 text-sm leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120} className="relative">
          <span className="corner corner-tl" />
          <span className="corner corner-br" />
          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-900/10">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Riwayat Transaksi</span>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-dot" /> Live
              </span>
            </div>
            <div className="space-y-2.5">
              {LEDGER_ROWS.map((r) => (
                <div key={r.id} className="ledger-row bg-slate-800/60 border border-slate-700/60 rounded-lg px-4 py-3 flex items-center justify-between gap-3 hover:border-slate-600 transition-colors group">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.dot}`} />
                    <div>
                      <div className="text-[11px] text-blue-400 font-semibold">{r.id}</div>
                      <div className="text-[10px] text-slate-500">{r.hash}</div>
                      <div className="text-xs text-slate-300 truncate max-w-[180px]">{r.campaign}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-start gap-2">
                    <div>
                      <div className="text-xs font-semibold text-white">{rp(r.amount)}</div>
                      <div className="text-[10px] text-slate-400">{r.status}</div>
                    </div>
                    <ArrowUpRight size={13} className="text-slate-600 group-hover:text-blue-400 transition-colors mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Foundation CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/6994870/pexels-photo-6994870.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-950/85" />
        </div>
        <Reveal className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Yayasan Anda siap menjadi lebih transparan?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-7 leading-relaxed">
            Daftarkan yayasan, lengkapi dokumen verifikasi, dan mulai kelola kampanye dengan pencatatan yang bisa dipercaya oleh donatur dan Dinas Sosial.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-950 bg-white hover:bg-slate-100 px-5 py-3 rounded-lg transition-colors">
              Daftarkan Yayasan <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-white border border-white/30 hover:border-white/60 px-5 py-3 rounded-lg transition-colors">
              Sudah punya akun? Masuk
            </Link>
          </div>
        </Reveal>
      </section>
      </PublicLayout>
    </>
  );
}
