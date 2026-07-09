import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";
import { Reveal } from "../../components/Reveal";

const FAQ_GROUPS = [
  {
    group: "Tentang TrustFund",
    items: [
      {
        q: "Apa itu TrustFund?",
        a: "TrustFund adalah platform pencatatan dan pengawasan dana bantuan sosial yang menghubungkan Dinas Sosial, yayasan terverifikasi, dan penerima manfaat dalam satu sistem yang sama. Setiap kampanye, transaksi, dan pencairan dana punya jejak yang bisa ditelusuri siapa saja.",
      },
      {
        q: "Siapa yang bisa menggunakan TrustFund?",
        a: "TrustFund dirancang untuk dua pihak utama: Dinas Sosial sebagai pengawas dan validator, serta yayasan atau lembaga sosial sebagai pengelola kampanye. Masyarakat umum bisa memantau progres kampanye secara publik tanpa perlu membuat akun.",
      },
      {
        q: "Apakah TrustFund bisa diakses lewat HP?",
        a: "Ya! TrustFund tersedia sebagai aplikasi mobile di Google Play Store. Yayasan dan penerima manfaat bisa mengakses semua fitur langsung dari smartphone mereka.",
      },
    ],
  },
  {
    group: "Untuk Yayasan",
    items: [
      {
        q: "Bagaimana cara mendaftarkan yayasan ke TrustFund?",
        a: "Klik tombol 'Daftarkan Yayasan' di halaman utama, isi data profil yayasan, dan unggah dokumen legal yang dibutuhkan (akta pendirian, NPWP, dll). Tim Dinas Sosial setempat akan memverifikasi dokumen Anda sebelum akun aktif.",
      },
      {
        q: "Berapa lama proses verifikasi yayasan?",
        a: "Proses verifikasi biasanya memakan waktu 3-7 hari kerja, tergantung kelengkapan dokumen dan jadwal Dinas Sosial setempat. Anda akan mendapat notifikasi lewat email dan aplikasi saat proses selesai.",
      },
      {
        q: "Apa itu RAB dan kenapa perlu divalidasi?",
        a: "RAB (Rencana Anggaran Biaya) adalah rincian penggunaan dana untuk setiap kampanye. Di TrustFund, RAB wajib diisi sebelum kampanye bisa tayang. Sistem AI kami akan memberi skor kewajaran anggaran, dan Dinas Sosial melakukan validasi akhir sebelum kampanye publik.",
      },
      {
        q: "Kapan dana kampanye bisa dicairkan?",
        a: "Dana dicairkan secara bertahap sesuai milestone yang sudah disepakati di RAB. Setiap pencairan memerlukan persetujuan Dinas Sosial dan akan tercatat otomatis di sistem dengan jejak audit yang tidak bisa diubah.",
      },
    ],
  },
  {
    group: "Transparansi & Keamanan",
    items: [
      {
        q: "Bagaimana TrustFund memastikan dana tidak disalahgunakan?",
        a: "Ada tiga lapis perlindungan: pertama, RAB divalidasi AI sebelum kampanye tayang. Kedua, pencairan dana butuh persetujuan eksplisit Dinas Sosial. Ketiga, setiap transaksi punya jejak audit yang tersimpan permanen dan tidak bisa dimodifikasi oleh siapapun.",
      },
      {
        q: "Apa yang terjadi jika ada kampanye yang mencurigakan?",
        a: "Kampanye yang terindikasi bermasalah akan otomatis dibekukan (status FROZEN) oleh sistem. Dinas Sosial kemudian melakukan investigasi. Selama proses berlangsung, tidak ada dana yang bisa dicairkan dari kampanye tersebut.",
      },
      {
        q: "Apakah data yayasan dan penerima manfaat aman?",
        a: "Data sensitif dienkripsi dan hanya bisa diakses oleh pihak yang berwenang. Informasi yang ditampilkan ke publik hanya data kampanye dan progres pencairan dana, bukan data pribadi penerima manfaat.",
      },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden transition-all ${open ? "shadow-sm" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-800">{q}</span>
        {open ? (
          <ChevronUp size={16} className="text-blue-500 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-slate-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <Reveal className="max-w-3xl">
          <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700 mb-3">FAQ</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
            Pertanyaan yang{" "}
            <span className="gradient-text">sering ditanyakan.</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
            Tidak nemu jawabannya di sini? Hubungi kami langsung di{" "}
            <a href="mailto:halo@trustfund.id" className="text-blue-600 hover:underline font-medium">
              halo@trustfund.id
            </a>
          </p>
        </Reveal>
      </section>

      {/* FAQ Groups */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="space-y-10">
          {FAQ_GROUPS.map((group) => (
            <Reveal key={group.group}>
              <h2 className="font-display text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HelpCircle size={16} className="text-blue-500" />
                {group.group}
              </h2>
              <div className="space-y-2.5">
                {group.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200/70 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">Masih ada pertanyaan?</p>
            <p className="text-sm text-slate-500 mt-0.5">Atau langsung coba daftarkan yayasan Anda sekarang.</p>
          </div>
          <div className="flex gap-3">
            <a
              href="mailto:halo@trustfund.id"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 border border-slate-300 hover:border-blue-400 hover:text-blue-600 px-5 py-3 rounded-lg transition-all"
            >
              Hubungi Kami
            </a>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg transition-colors"
            >
              Daftarkan Yayasan <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
