import { Link } from "react-router-dom";
import { ShieldCheck, UserCheck, Calculator, Users, ArrowRight } from "lucide-react";
import PublicLayout from "../layouts/PublicLayout";
import { Reveal } from "../components/Reveal";

const VALUES = [
  { icon: ShieldCheck, title: "Transparan", desc: "Setiap transaksi tercatat dan bisa ditelusuri, tanpa ruang untuk manipulasi laporan." },
  { icon: UserCheck, title: "Akuntabel", desc: "Yayasan diverifikasi berlapis oleh Dinas Sosial sebelum kampanye bisa tayang ke publik." },
  { icon: Calculator, title: "Berbasis Data", desc: "Rencana anggaran biaya divalidasi otomatis dengan AI sebelum dana disetujui untuk dicairkan." },
  { icon: Users, title: "Kolaboratif", desc: "Menghubungkan pemerintah, yayasan, dan masyarakat dalam satu sistem yang sama." },
];

const TEAM = [
  {
    name: "Bima Aditya Pratama",
    role: "Co-Founder & CEO",
    bio: "Berpengalaman di bidang kebijakan publik dan teknologi sipil. Mendirikan TrustFund setelah melihat langsung celah transparansi dalam penyaluran dana sosial di lapangan.",
    photo: "https://images.pexels.com/photos/12311572/pexels-photo-12311572.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Nadia Kirana",
    role: "Co-Founder & Head of Product",
    bio: "Berlatar belakang desain sistem dan riset pengguna. Memimpin pengembangan produk TrustFund agar bisa digunakan oleh semua pihak, dari yayasan kecil hingga Dinas Sosial.",
    photo: "https://images.pexels.com/photos/30004323/pexels-photo-30004323.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

export default function About() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <Reveal className="max-w-3xl">
          <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700 mb-3">Tentang Kami</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
            Kami percaya bantuan sosial harus bisa <span className="gradient-text">dipertanggungjawabkan</span> sampai rupiah terakhir.
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
            TrustFund dibangun untuk menutup celah antara niat baik dan kepercayaan publik. Kami menghubungkan Dinas Sosial, yayasan, dan penerima manfaat dalam satu sistem pencatatan yang sama.
          </p>
        </Reveal>
      </section>

      {/* Mission */}
      <section className="border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700 mb-2">Misi Kami</div>
            <h2 className="font-display text-3xl font-bold tracking-tight mb-5">Dari laporan yang sulit diverifikasi, menuju data yang bisa ditelusuri siapa saja.</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Selama ini, banyak program bantuan sosial berhenti di laporan tahunan yang sulit diaudit publik. Ketika ada ketidaksesuaian, prosesnya panjang dan datanya tersebar di banyak pihak.
            </p>
            <p className="text-slate-600 leading-relaxed">
              TrustFund mengganti proses itu dengan satu sistem pencatatan digital. Setiap kampanye, transaksi, dan pencairan dana punya jejak yang bisa ditelusuri. Mulai dari pengajuan yayasan sampai dana diterima penerima manfaat.
            </p>
          </Reveal>
          <Reveal delay={120} className="relative">
            <span className="corner corner-tl" />
            <span className="corner corner-br" />
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-900/5 aspect-[4/3]">
              <img
                src="https://images.pexels.com/photos/6994870/pexels-photo-6994870.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Relawan menyortir bantuan untuk didistribusikan"
                className="w-full h-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <Reveal className="max-w-2xl mb-8">
            <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700 mb-2">Nilai Kami</div>
            <h2 className="font-display text-3xl font-bold tracking-tight mb-3">Prinsip yang jadi pegangan di setiap fitur yang kami bangun.</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80} className="tf-card p-6">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-[0.65rem] bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-inner mb-4">
                  <v.icon size={18} />
                </span>
                <h3 className="font-semibold text-slate-900 mb-1.5">{v.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{v.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <Reveal className="max-w-2xl mb-10">
            <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700 mb-2">Orang di Balik TrustFund</div>
            <h2 className="font-display text-3xl font-bold tracking-tight mb-3">Tim kecil yang fokus pada satu masalah.</h2>
            <p className="text-slate-600 leading-relaxed">Berlatar belakang teknologi, kebijakan sosial, dan audit keuangan. Bersatu untuk membangun sistem yang bisa dipercaya semua pihak.</p>
          </Reveal>

          {/* Editorial 2-column layout */}
          <div className="flex justify-center">
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl w-full">
            {TEAM.map((member, i) => (
              <Reveal key={member.name} delay={i * 100}>
                <div className="relative rounded-2xl overflow-hidden group aspect-[3/4] max-h-[520px]">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-1">{member.role}</p>
                    <h3 className="font-display text-xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-h-0 group-hover:max-h-24 overflow-hidden">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/6146693/pexels-photo-6146693.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-950/85" />
        </div>
        <Reveal className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Ingin melihat bagaimana semuanya bekerja?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-7 leading-relaxed">
            Pelajari alur verifikasi dan pencairan dana kami, atau langsung daftarkan yayasan Anda untuk mulai menggunakan TrustFund.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/#cara-kerja" className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-950 bg-white hover:bg-slate-100 px-5 py-3 rounded-lg transition-colors">
              Lihat Cara Kerja <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-white border border-white/30 hover:border-white/60 px-5 py-3 rounded-lg transition-colors">
              Daftarkan Yayasan
            </Link>
          </div>
        </Reveal>
      </section>
    </PublicLayout>
  );
}
