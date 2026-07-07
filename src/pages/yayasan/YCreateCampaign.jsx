import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BrainCircuit, Save, Loader2, Info, PlusCircle, Trash2, Calendar, UploadCloud, X } from "lucide-react";
import { campaignApi } from "../../api/client";
import { rp } from "../../api/format";

export default function YCreateCampaign() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState("basic"); // "basic" | "rab"
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    category: "PEMBANGUNAN",
    imageUrl: "",
    durationDays: 30, // Default 30 days
  });

  // Dynamic RAB State
  const [rabItems, setRabItems] = useState([
    { item: "Semen", harga: 50000, qty: 100 },
    { item: "Batu Bata", harga: 1000, qty: 5000 }
  ]);

  // Plan result from AI
  const [planResult, setPlanResult] = useState(null);

  const handleAnalyze = async () => {
    try {
      if (!formData.targetAmount || rabItems.length === 0) {
        return alert("Lengkapi target dana dan minimal 1 item RAB");
      }
      
      // Validasi item kosong
      if (rabItems.some(r => !r.item || r.harga <= 0 || r.qty <= 0)) {
        return alert("Pastikan semua baris RAB diisi dengan benar");
      }

      setIsAnalyzing(true);
      
      const res = await campaignApi.planDraft({
        targetAmount: Number(formData.targetAmount),
        rabData: rabItems,
      });

      setPlanResult(res.plan);
      setStep(2);
    } catch (e) {
      alert(e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const onChainId = `CMP-${Date.now()}`;
      
      let finalImageUrl = formData.imageUrl;
      if (formData.imageFile) {
        finalImageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(formData.imageFile);
        });
      }
      
      await campaignApi.create({
        onChainId,
        title: formData.title,
        description: formData.description,
        targetAmount: Number(formData.targetAmount),
        durationDays: Number(formData.durationDays),
        category: formData.category,
        imageUrl: finalImageUrl,
        advanceAmount: planResult.advanceAmount,
        milestoneAmount: planResult.milestoneAmount,
        totalMilestones: planResult.totalMilestones,
        rabCID: "QmTestRabData123", // Mock CID
      });

      setStep(3);
    } catch (e) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-120px)] flex flex-col gap-4">
      <div className="flex items-center gap-4 shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Buat Kampanye Baru</h1>
          <p className="text-slate-500 mt-1">Isi detail kampanye dan biarkan AI merumuskan pencairan dananya.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row flex-1 min-h-0">
        {/* Sidebar Steps */}
        <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-6 shrink-0">
          <div className="flex flex-col gap-6 relative">
            <div className="absolute left-[11px] top-6 bottom-6 w-[2px] bg-slate-200 -z-0"></div>
            
            <div className="flex items-start gap-3 relative z-10">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= 1 ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>1</div>
              <div>
                <div className={`font-bold ${step >= 1 ? 'text-slate-800' : 'text-slate-500'}`}>Detail & RAB</div>
                <div className="text-xs text-slate-500 mt-0.5">Input data dasar</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 relative z-10">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= 2 ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>2</div>
              <div>
                <div className={`font-bold ${step >= 2 ? 'text-slate-800' : 'text-slate-500'}`}>Analisis AI</div>
                <div className="text-xs text-slate-500 mt-0.5">Review struktur dana</div>
              </div>
            </div>
            <div className="flex items-start gap-3 relative z-10">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= 3 ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>3</div>
              <div>
                <div className={`font-bold ${step >= 3 ? 'text-slate-800' : 'text-slate-500'}`}>Selesai</div>
                <div className="text-xs text-slate-500 mt-0.5">Siap publikasi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {step === 1 && (
            <>
              {/* Tabs Navigation (Sticky Top) */}
              <div className="p-4 md:px-6 md:pt-6 md:pb-3 border-b border-slate-100 shrink-0">
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                  <button 
                    onClick={() => setActiveTab("basic")}
                    className={`px-5 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === "basic" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Informasi Dasar
                  </button>
                  <button 
                    onClick={() => setActiveTab("rab")}
                    className={`px-5 py-1.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === "rab" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Data RAB
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${rabItems.length > 0 ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500"}`}>{rabItems.length}</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {activeTab === "basic" ? (
                  <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Kampanye</label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder="Contoh: Pembangunan Masjid Al-Ikhlas"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-slate-800 font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-slate-800 font-medium"
                      >
                        <option value="PEMBANGUNAN">Pembangunan</option>
                        <option value="PENGADAAN_BARANG">Pengadaan Barang</option>
                        <option value="ALAT_KESEHATAN">Alat Kesehatan</option>
                        <option value="REKONSTRUKSI">Rekonstruksi Bencana</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Target Dana (Rp)</label>
                      <input 
                        type="number" 
                        value={formData.targetAmount}
                        onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                        placeholder="100000000"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Durasi (Hari)</label>
                      <input 
                        type="number" 
                        value={formData.durationDays}
                        onChange={e => setFormData({...formData, durationDays: e.target.value})}
                        min="1"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Gambar Sampul (Opsional)</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (!file.type.startsWith("image/")) {
                                alert("Format file tidak didukung. Harap unggah foto/gambar.");
                                e.target.value = "";
                                return;
                              }
                              setFormData({...formData, imageFile: file});
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          className="flex-1 w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-600 hover:file:bg-teal-100 cursor-pointer bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all"
                        />
                        {imagePreview && (
                          <div className="relative shrink-0 w-8 h-8 rounded-md overflow-hidden border border-slate-200 group shadow-sm">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => {
                                setImagePreview(null);
                                setFormData({...formData, imageFile: null});
                              }}
                              className="absolute inset-0 bg-slate-900/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Hapus"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Lengkap</label>
                      <textarea 
                        rows={2}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-slate-800 font-medium resize-none"
                        placeholder="Ceritakan mengapa kampanye ini penting..."
                      ></textarea>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block">Rencana Anggaran Biaya</label>
                        <p className="text-xs text-slate-500 mt-0.5">Masukkan detail pengeluaran yang dibutuhkan untuk kampanye ini.</p>
                      </div>
                      <button 
                        onClick={() => setRabItems([...rabItems, { item: "", harga: 0, qty: 1 }])}
                        className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-xs font-bold text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                      >
                        <PlusCircle size={14} /> Tambah
                      </button>
                    </div>
                  
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <tr>
                            <th className="px-4 py-3 font-semibold w-5/12">Nama Item/Kebutuhan</th>
                            <th className="px-4 py-3 font-semibold w-3/12">Harga Satuan (Rp)</th>
                            <th className="px-4 py-3 font-semibold w-2/12">Kuantitas</th>
                            <th className="px-4 py-3 font-semibold w-2/12 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rabItems.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="p-2">
                                <input 
                                  type="text"
                                  value={row.item}
                                  onChange={(e) => {
                                    const newItems = [...rabItems];
                                    newItems[idx].item = e.target.value;
                                    setRabItems(newItems);
                                  }}
                                  placeholder="Cth: Semen"
                                  className="w-full px-3 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-lg outline-none transition-all text-slate-800 text-sm placeholder:text-slate-400"
                                />
                              </td>
                              <td className="p-2">
                                <input 
                                  type="number"
                                  value={row.harga || ''}
                                  onChange={(e) => {
                                    const newItems = [...rabItems];
                                    newItems[idx].harga = Number(e.target.value);
                                    setRabItems(newItems);
                                  }}
                                  placeholder="0"
                                  className="w-full px-3 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-lg outline-none transition-all text-slate-800 text-sm placeholder:text-slate-400"
                                />
                              </td>
                              <td className="p-2">
                                <input 
                                  type="number"
                                  value={row.qty || ''}
                                  onChange={(e) => {
                                    const newItems = [...rabItems];
                                    newItems[idx].qty = Number(e.target.value);
                                    setRabItems(newItems);
                                  }}
                                  min="1"
                                  className="w-full px-3 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-lg outline-none transition-all text-slate-800 text-sm placeholder:text-slate-400"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button 
                                  onClick={() => setRabItems(rabItems.filter((_, i) => i !== idx))}
                                  className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 inline-flex items-center justify-center"
                                  title="Hapus baris"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="p-4 md:px-6 md:py-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center rounded-br-2xl">
                {activeTab === "basic" ? (
                  <>
                    <div /> {/* Spacer */}
                    <button 
                      onClick={() => setActiveTab("rab")} 
                      className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
                    >
                      Selanjutnya: Isi RAB <ArrowLeft size={16} className="rotate-180" />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setActiveTab("basic")} 
                      className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <ArrowLeft size={16} /> Kembali
                    </button>
                    <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
                      {isAnalyzing ? "Memproses..." : "Analisis AI"}
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {step === 2 && planResult && (
            <>
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 animate-in fade-in duration-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex gap-4 items-start">
                  <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                    <BrainCircuit className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-900 text-lg">Hasil Analisis AI</h3>
                    <p className="text-sm text-indigo-700 mt-1 leading-relaxed">{planResult.notes || "AI telah mengkalkulasi skema pencairan dana terbaik berdasarkan RAB Anda untuk meminimalkan risiko."}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <span className="font-bold text-slate-800">Skema Pencairan (Milestone)</span>
                    <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-bold">Total: {planResult.totalMilestones} Tahap</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-bold text-slate-800">Uang Muka (DP)</div>
                        <div className="text-xs text-slate-500 mt-0.5">Pencairan pertama saat kampanye sukses</div>
                      </div>
                      <div className="font-black text-slate-800 text-lg">{rp(planResult.advanceAmount)}</div>
                    </div>
                    <div className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-bold text-slate-800">Sisa Dana (Milestones)</div>
                        <div className="text-xs text-slate-500 mt-0.5">Dicairkan bertahap setelah bukti disetujui</div>
                      </div>
                      <div className="font-black text-slate-800 text-lg">{rp(planResult.milestoneAmount)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sticky Footer Step 2 */}
              <div className="p-4 md:px-8 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center rounded-br-2xl">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Kembali Edit
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSubmitting ? "Menyimpan..." : "Publikasikan Kampanye"}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500 bg-slate-50/50">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20 relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-4">Hore! Kampanye Berhasil Dibuat</h2>
              <p className="text-slate-500 mb-10 max-w-md mx-auto leading-relaxed text-sm">
                Kampanye penggalangan dana Anda kini telah dicatat di Smart Contract dan siap menerima donasi transparan dari para dermawan.
              </p>
              <button 
                onClick={() => navigate("/y/campaigns")}
                className="px-8 py-3.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/30 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
              >
                Lihat Daftar Kampanye
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
