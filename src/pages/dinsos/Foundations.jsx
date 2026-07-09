import { useEffect, useState, useCallback } from "react";
import { authApi } from "../../api/client";
import Swal from "sweetalert2";
import { CheckCircle2, Clock, ShieldCheck, FileText, X, ExternalLink, Mail, ShieldAlert, Building2, Search } from "lucide-react";

export default function Foundations() {
  const [list, setList] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [selectedFoundation, setSelectedFoundation] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await authApi.listFoundations();
      setList(d.foundations || []);
    } catch (e) {
      Swal.fire("Error", "Gagal memuat yayasan: " + e.message, "error");
      setList([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const verify = async (id, name) => {
    const confirm = await Swal.fire({
      title: 'Verifikasi Yayasan?',
      text: `Apakah Anda yakin ingin memverifikasi yayasan ${name}? Mereka akan mendapatkan akses untuk membuat kampanye.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Verifikasi!',
      cancelButtonText: 'Batal'
    });

    if (!confirm.isConfirmed) return;

    setBusyId(id);
    try {
      await authApi.verifyFoundation(id);
      Swal.fire("Berhasil!", "Yayasan berhasil diverifikasi!", "success");
      load();
    } catch (e) {
      Swal.fire("Gagal", "Gagal verifikasi: " + e.message, "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="w-full max-w-[1400px] flex flex-col gap-6 pb-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verifikasi Yayasan</h1>
          <p className="text-sm text-slate-500 font-medium">Setujui pendaftaran yayasan sebelum mereka bisa membuat kampanye.</p>
        </div>

        <div className="relative group">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
          <input
            type="text"
            placeholder="Cari yayasan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ color: "#000000ff" }}
            className="w-full sm:w-[260px] rounded-full border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="web25-card rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Yayasan</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Dokumen</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list === null ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-slate-500">Memuat data yayasan...</span>
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-500 font-medium text-sm">
                    {searchQuery ? "Tidak ada yayasan yang cocok dengan pencarian." : "Belum ada yayasan terdaftar."}
                  </td>
                </tr>
              ) : (
                (() => {
                  const filteredList = (list || []).filter(f => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      f.name.toLowerCase().includes(q) ||
                      f.email.toLowerCase().includes(q)
                    );
                  });

                  if (filteredList.length === 0) {
                    return (
                      <tr>
                        <td colSpan="5" className="px-5 py-12 text-center text-slate-500 font-medium text-sm">
                          Tidak ada yayasan yang cocok dengan pencarian.
                        </td>
                      </tr>
                    );
                  }

                  return filteredList.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                          {f.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{f.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-600 font-medium text-xs">{f.email}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        {f.skKemenkumham ? (
                          <><FileText size={14} className="text-blue-500" /> Tersedia</>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {f.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wide border border-emerald-100">
                          <CheckCircle2 size={12} /> Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 uppercase tracking-wide border border-amber-100">
                          <Clock size={12} /> Menunggu
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedFoundation(f)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm focus:ring-2 focus:ring-slate-500/20"
                        >
                          <Building2 size={14} /> Detail
                        </button>
                        {f.isVerified ? (
                          <button disabled className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-bold rounded-lg text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed">
                            Selesai
                          </button>
                        ) : (
                          <button
                            onClick={() => verify(f.id, f.name)}
                            disabled={busyId === f.id}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg text-white bg-teal-600 hover:bg-teal-700 border border-teal-600 hover:border-teal-700 transition-all shadow-sm focus:ring-2 focus:ring-teal-500/20 disabled:opacity-70 disabled:cursor-wait"
                          >
                            <ShieldCheck size={14} />
                            {busyId === f.id ? "Memproses..." : "Verifikasi"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Foundation Details Modal */}
      {selectedFoundation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedFoundation(null)}></div>
          <div className="web25-card relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up [animation-duration:200ms]">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Building2 size={18} className="text-teal-600" /> Profil Yayasan
              </h3>
              <button onClick={() => setSelectedFoundation(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-1 shadow-sm border border-slate-200">
                <X size={16} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl ring-4 ring-white shadow-sm border border-teal-100">
                  {selectedFoundation.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 tracking-tight">{selectedFoundation.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedFoundation.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                        <CheckCircle2 size={12} /> Akun Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 uppercase tracking-wide">
                        <Clock size={12} /> Menunggu Verifikasi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Mail size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Alamat Email</div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">{selectedFoundation.email}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Dokumen Legalitas</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <FileText size={14} className="text-blue-500" /> SK Kemenkumham
                      </div>
                      {selectedFoundation.skKemenkumham ? (
                        <button 
                          onClick={() => window.open(selectedFoundation.skKemenkumham, '_blank')}
                          className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded flex items-center gap-1 hover:bg-teal-100 transition-colors"
                        >
                          Lihat <ExternalLink size={10} />
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">Tidak Ada</span>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedFoundation(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
              {!selectedFoundation.isVerified && (
                <button 
                  onClick={() => {
                    verify(selectedFoundation.id, selectedFoundation.name);
                    setSelectedFoundation(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/20 transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck size={16} /> Verifikasi Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
