import { useState } from "react";
import { Search, Filter, ArrowRight, MapPin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import { Reveal } from "../../components/Reveal";
import ProgressBar from "../../components/ProgressBar";
import { rp } from "../../api/format";

const CATEGORIES = ["Semua", "Pendidikan", "Kesehatan", "Bencana Alam", "Lingkungan", "Sosial"];

const CAMPAIGNS = [
  {
    id: 1,
    category: "Pendidikan",
    color: "indigo",
    title: "Beasiswa Anak Pesisir 2026",
    foundation: "Yayasan Cahaya Bangsa",
    location: "Makassar, Sulawesi Selatan",
    target: 450000000,
    current: 312750000,
    deadline: "31 Agustus 2026",
    image: "https://images.pexels.com/photos/35565132/pexels-photo-35565132.jpeg?auto=compress&cs=tinysrgb&w=800",
    status: "Aktif",
  },
  {
    id: 2,
    category: "Kesehatan",
    color: "green",
    title: "Layanan Kesehatan Keliling Desa Terpencil",
    foundation: "Yayasan Sehat Nusantara",
    location: "Nusa Tenggara Timur",
    target: 300000000,
    current: 178500000,
    deadline: "15 September 2026",
    image: "https://images.pexels.com/photos/7345461/pexels-photo-7345461.jpeg?auto=compress&cs=tinysrgb&w=800",
    status: "Aktif",
  },
  {
    id: 3,
    category: "Bencana Alam",
    color: "amber",
    title: "Tanggap Darurat Banjir Kalimantan",
    foundation: "Yayasan Peduli Bencana",
    location: "Kalimantan Selatan",
    target: 600000000,
    current: 512400000,
    deadline: "30 Juli 2026",
    image: "https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=800",
    status: "Aktif",
  },
  {
    id: 4,
    category: "Lingkungan",
    color: "teal",
    title: "Rehabilitasi Hutan Mangrove Pesisir",
    foundation: "Yayasan Bumi Lestari",
    location: "Balikpapan, Kalimantan Timur",
    target: 250000000,
    current: 96750000,
    deadline: "1 Oktober 2026",
    image: "https://images.pexels.com/photos/5029853/pexels-photo-5029853.jpeg?auto=compress&cs=tinysrgb&w=800",
    status: "Aktif",
  },
  {
    id: 5,
    category: "Sosial",
    color: "rose",
    title: "Rumah Singgah Anak Jalanan Surabaya",
    foundation: "Yayasan Kasih Anak Bangsa",
    location: "Surabaya, Jawa Timur",
    target: 180000000,
    current: 143000000,
    deadline: "20 Agustus 2026",
    image: "https://images.pexels.com/photos/3755761/pexels-photo-3755761.jpeg?auto=compress&cs=tinysrgb&w=800",
    status: "Aktif",
  },
  {
    id: 6,
    category: "Pendidikan",
    color: "indigo",
    title: "Perpustakaan Digital untuk Sekolah Pelosok",
    foundation: "Yayasan Literasi Indonesia",
    location: "Papua Barat",
    target: 120000000,
    current: 34800000,
    deadline: "10 November 2026",
    image: "https://images.pexels.com/photos/256431/pexels-photo-256431.jpeg?auto=compress&cs=tinysrgb&w=800",
    status: "Aktif",
  },
];

const colorMap = {
  indigo: { pill: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-400" },
  green: { pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-400" },
  amber: { pill: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
  teal: { pill: "bg-teal-50 text-teal-700", dot: "bg-teal-400" },
  rose: { pill: "bg-rose-50 text-rose-700", dot: "bg-rose-400" },
};

export default function PublicCampaigns() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filtered = CAMPAIGNS.filter((c) => {
    const matchCategory = activeCategory === "Semua" || c.category === activeCategory;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.foundation.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <Reveal className="max-w-3xl">
          <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700 mb-3">Kampanye Publik</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
            Dana yang mengalir,{" "}
            <span className="gradient-text">tercatat dan terbuka</span> untuk semua.
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
            Semua kampanye di TrustFund sudah diverifikasi oleh Dinas Sosial dan divalidasi RAB-nya sebelum tayang. Progres pencairan dananya bisa Anda pantau secara real-time di sini.
          </p>
        </Reveal>
      </section>

      {/* Filter & Search */}
      <section className="border-y border-slate-200/70 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kampanye atau yayasan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
            />
          </div>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Filter size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">Tidak ada kampanye yang cocok</p>
            <p className="text-sm mt-1">Coba ubah kata kunci atau kategori</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c, i) => {
              const progress = Math.round((c.current / c.target) * 100);
              const col = colorMap[c.color] || colorMap.indigo;
              return (
                <Reveal key={c.id} delay={i * 60} className="tf-card overflow-hidden group">
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={c.image}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${col.pill}`}>
                        {c.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 text-sm mb-1 leading-snug group-hover:text-blue-600 transition-colors">{c.title}</h3>
                    <p className="text-xs text-slate-400 mb-1">{c.foundation}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
                      <MapPin size={11} />
                      <span>{c.location}</span>
                      <span className="mx-1">·</span>
                      <Calendar size={11} />
                      <span>{c.deadline}</span>
                    </div>
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
        )}
      </section>

      {/* CTA bottom */}
      <section className="border-t border-slate-200/70 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">Yayasan Anda ingin ikut terdaftar di sini?</p>
            <p className="text-sm text-slate-500 mt-0.5">Daftarkan yayasan dan mulai buat kampanye yang bisa dipercaya publik.</p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg transition-colors shrink-0"
          >
            Daftarkan Yayasan <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
