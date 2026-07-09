import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BrainCircuit, Save, Loader2, Info, PlusCircle, Trash2, Calendar, UploadCloud, X, CheckCircle2, Search, MapPin } from "lucide-react";
import Swal from "sweetalert2";
import { campaignApi } from "../../api/client";
import { rp } from "../../api/format";
import { Map, Marker } from "pigeon-maps";

export default function YCreateCampaign() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState("basic"); // "basic" | "rab"
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [createdCampaignStatus, setCreatedCampaignStatus] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    category: "PEMBANGUNAN",
    imageUrl: "",
    izinPub: "",
    durationDays: 30, // Default 30 days
    latitude: -6.200000,
    longitude: 106.816666,
    izinPubFile: null,
  });

  // Map state
  const [mapCenter, setMapCenter] = useState([-6.200000, 106.816666]);
  const [mapZoom, setMapZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  // Dynamic RAB State
  const [rabItems, setRabItems] = useState([
    { item: "Semen", harga: 50000, qty: 100, unit: "sak" },
    { item: "Batu Bata", harga: 1000, qty: 5000, unit: "biji" }
  ]);

  // Plan result from AI
  const [planResult, setPlanResult] = useState(null);

  const handleAnalyze = async () => {
    try {
      if (!formData.targetAmount || rabItems.length === 0) {
        Swal.fire("Peringatan", "Lengkapi target dana dan minimal 1 item RAB", "warning");
        return;
      }
      
      // Validasi item kosong
if (rabItems.some(r => !r.item || r.harga <= 0 || r.qty <= 0 || !r.unit || !r.unit.trim())) {
        Swal.fire("Peringatan", "Pastikan semua baris RAB diisi dengan benar, termasuk satuan", "warning");
        return;
      }

      setIsAnalyzing(true);
      
      const res = await campaignApi.planDraft({
        targetAmount: Number(formData.targetAmount),
        rabData: rabItems,
      });

      setPlanResult(res.plan);
      setStep(2);
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMapSearch = async () => {
    if (!searchQuery) return;
    setIsSearchingMap(true);
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates;
        // Photon returns [lon, lat]
        const lat = coords[1];
        const lon = coords[0];
        setMapCenter([lat, lon]);
        setMapZoom(16);
        setFormData(prev => ({...prev, latitude: lat, longitude: lon}));
      } else {
        Swal.fire("Info", "Lokasi spesifik tidak ditemukan di database peta. <br><br>Tips: Coba cari nama jalan, kecamatan, atau kota terdekat, lalu geser peta ke titik yang tepat.", "info");
      }
    } catch (e) {
      Swal.fire("Error", "Gagal mencari lokasi.", "error");
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.izinPubFile && (!formData.izinPub || !formData.izinPub.trim())) {
        setActiveTab("basic");
        Swal.fire("Peringatan", "Surat izin PUB wajib diisi", "warning");
        return;
      }
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

      let finalIzinPubUrl = "";
      if (formData.izinPubFile) {
        finalIzinPubUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(formData.izinPubFile);
        });
      }
      
      const response = await campaignApi.create({
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
        rabCID: "QmTestRabData123",
        latitude: formData.latitude,
        longitude: formData.longitude,
        izinPub: finalIzinPubUrl || (formData.izinPub ? formData.izinPub.trim() : undefined),
        aiScore: planResult.aiScore,
        aiNotes: planResult.notes,
        rabData: rabItems,
      });

      if (response && response.campaign) {
        setCreatedCampaignStatus(response.campaign.status);
      }
      setStep(3);
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-120px)] flex flex-col gap-4">
      <div className="flex items-center gap-4 shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Buat Kampanye Baru</h1>
          <p className="text-slate-500 text-sm">Isi detail kampanye dan biarkan AI merumuskan pencairan dananya.</p>
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
                <div className="text-xs text-slate-500 mt-0.5">Informasi dasar & anggaran</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 relative z-10">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= 2 ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>2</div>
              <div>
                <div className={`font-bold ${step >= 2 ? 'text-slate-800' : 'text-slate-500'}`}>Analisis AI</div>
                <div className="text-xs text-slate-500 mt-0.5">Review skema dana</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 relative z-10">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= 3 ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>3</div>
              <div>
                <div className={`font-bold ${step >= 3 ? 'text-slate-800' : 'text-slate-500'}`}>Selesai</div>
                <div className="text-xs text-slate-500 mt-0.5">Kampanye siap dibuat</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white overflow-y-auto custom-scrollbar p-6 relative">
          {step === 1 && (
            <div className="flex-1 flex flex-col gap-6">
              {/* Tabs Navigation */}
              <div className="flex border-b border-slate-200">
                <button 
                  onClick={() => setActiveTab("basic")}
                  className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === "basic" ? "border-teal-500 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  Informasi Dasar
                </button>
                <button 
                  onClick={() => setActiveTab("location")}
                  className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === "location" ? "border-teal-500 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  Lokasi
                </button>
                <button 
                  onClick={() => setActiveTab("rab")}
                  className={`px-5 py-3 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${activeTab === "rab" ? "border-teal-500 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  Data RAB
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${rabItems.length > 0 ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}>{rabItems.length}</span>
                </button>
              </div>

              {activeTab === "basic" && (
                <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-6">
                  {/* Card 1: Informasi Dasar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Judul Kampanye</label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder="Contoh: Pembangunan Masjid Al-Ikhlas"
                        className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800 font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kategori</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800 font-medium appearance-none"
                      >
                        <option value="PEMBANGUNAN">Pembangunan</option>
                        <option value="PENGADAAN_BARANG">Pengadaan Barang</option>
                        <option value="ALAT_KESEHATAN">Alat Kesehatan</option>
                        <option value="REKONSTRUKSI">Rekonstruksi Bencana</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Dana (Rp)</label>
                        <input 
                          type="number" 
                          value={formData.targetAmount}
                          onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                          placeholder="100.000.000"
                          className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Durasi (Hari)</label>
                        <input 
                          type="number" 
                          value={formData.durationDays}
                          onChange={e => setFormData({...formData, durationDays: e.target.value})}
                          min="1"
                          className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deskripsi Lengkap</label>
                      <textarea 
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800 font-medium resize-none leading-relaxed"
                        placeholder="Ceritakan mengapa kampanye ini penting, siapa penerima manfaatnya, dan dampak yang akan dihasilkan..."
                      ></textarea>
                    </div>
                  </div>

                  {/* Card 3: Media & Dokumen */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-6 mt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Gambar Sampul (Opsional)</label>
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">Pilih foto format JPG/PNG/WEBP.</p>
                      <div className="flex items-center gap-3">
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (!file.type.startsWith("image/")) {
                                Swal.fire("Peringatan", "Format file tidak didukung.", "warning");
                                e.target.value = "";
                                return;
                              }
                              setFormData({...formData, imageFile: file});
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          className="flex-1 w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-600 hover:file:bg-teal-100 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all"
                        />
                        {imagePreview && (
                          <div className="relative shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => {
                                setImagePreview(null);
                                setFormData({...formData, imageFile: null});
                              }}
                              className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]"
                              title="Hapus"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Izin PUB</label>
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">Dokumen Izin PUB (PDF/Img).</p>
                      <div className="flex items-center gap-3">
                        <input 
                          type="file" 
                          accept="application/pdf, image/png, image/jpeg, image/jpg"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setFormData({...formData, izinPubFile: file});
                            }
                          }}
                          className="flex-1 w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all"
                        />
                        {formData.izinPubFile && (
                          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 shrink-0 shadow-sm">
                            <CheckCircle2 size={14} className="text-emerald-500" /> Ok
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Button */}
                  <div className="flex justify-end pt-6 mt-auto">
                    <button 
                      onClick={() => setActiveTab("location")} 
                      className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-all shadow-md shadow-slate-800/20"
                    >
                      Selanjutnya: Atur Lokasi <ArrowLeft size={16} className="rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-6">
                  {/* Card 2: Lokasi Kampanye */}
                  <div className="flex flex-col gap-5 flex-1">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleMapSearch()}
                          placeholder="Cari nama kota, kecamatan, atau daerah..."
                          className="w-full pl-12 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800 font-medium"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={handleMapSearch}
                        disabled={isSearchingMap}
                        className="px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 disabled:opacity-50 text-sm font-bold shadow-md shadow-slate-800/20"
                      >
                        {isSearchingMap ? <Loader2 size={16} className="animate-spin" /> : "Cari"}
                      </button>
                    </div>
                    <div className="flex-1 w-full rounded-2xl overflow-hidden border-2 border-slate-200 relative shadow-inner group min-h-[300px]">
                      <Map 
                        center={mapCenter} 
                        zoom={mapZoom} 
                        onBoundsChanged={({ center, zoom }) => {
                          setMapCenter(center);
                          setMapZoom(zoom);
                        }}
                        onClick={({ latLng }) => {
                          setFormData(prev => ({...prev, latitude: latLng[0], longitude: latLng[1]}));
                        }}
                      >
                        <Marker 
                          width={44}
                          anchor={[formData.latitude, formData.longitude]} 
                          color="#14b8a6"
                        />
                      </Map>
                      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-700 shadow-lg z-10 pointer-events-none border border-slate-200">
                        Lat: {formData.latitude.toFixed(5)}, Lng: {formData.longitude.toFixed(5)}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Button */}
                  <div className="flex justify-between items-center pt-4">
                    <button 
                      onClick={() => setActiveTab("basic")} 
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <ArrowLeft size={16} /> Kembali
                    </button>
                    <button 
                      onClick={() => setActiveTab("rab")} 
                      className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-teal-500/30"
                    >
                      Selanjutnya: Isi RAB <ArrowLeft size={16} className="rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "rab" && (
                <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-slate-500">Masukkan detail pengeluaran yang dibutuhkan.</p>
                    <button 
                      onClick={() => setRabItems([...rabItems, { item: "", harga: 0, qty: 1, unit: "" }])}
                      className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-xs font-bold text-teal-600 hover:bg-teal-100 rounded-lg transition-colors shadow-sm border border-teal-100"
                    >
                      <PlusCircle size={14} /> Tambah Item
                    </button>
                  </div>
                
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50 flex-1 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white border-b border-slate-200 text-slate-600 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 font-bold w-5/12">Nama Item/Kebutuhan</th>
                          <th className="px-4 py-3 font-bold w-3/12">Harga Satuan (Rp)</th>
                          <th className="px-4 py-3 font-bold w-2/12">Kuantitas</th>
                          <th className="px-4 py-3 font-semibold w-2/12">Satuan</th>
                          <th className="px-4 py-3 font-bold w-2/12 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {rabItems.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
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
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-lg outline-none transition-all text-slate-800 text-xs placeholder:text-slate-400 font-medium"
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
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-lg outline-none transition-all text-slate-800 text-xs placeholder:text-slate-400 font-medium"
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
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-lg outline-none transition-all text-slate-800 text-xs placeholder:text-slate-400 font-medium"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.unit || ''}
                                onChange={(e) => {
                                  const newItems = [...rabItems];
                                  newItems[idx].unit = e.target.value;
                                  setRabItems(newItems);
                                }}
                                placeholder="Cth: sak, m³, unit"
                                className="w-full px-3 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-lg outline-none transition-all text-slate-800 text-sm placeholder:text-slate-400"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button 
                                onClick={() => setRabItems(rabItems.filter((_, i) => i !== idx))}
                                className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all inline-flex items-center justify-center"
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

                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => setActiveTab("location")} 
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <ArrowLeft size={16} /> Kembali ke Lokasi
                    </button>
                    <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
                      {isAnalyzing ? "Memproses..." : "Jalankan Analisis AI"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && planResult && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col h-full">
              <div className="flex-1">
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex gap-4 items-start mb-6">
                  <div className="p-2.5 bg-indigo-100 rounded-xl shrink-0 shadow-inner">
                    <BrainCircuit className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-900 text-lg">Hasil Analisis Pencairan Dana</h3>
                    <p className="text-indigo-700/80 mt-1 text-sm leading-relaxed">{planResult.notes || "AI telah mengkalkulasi skema pencairan dana terbaik berdasarkan RAB Anda untuk meminimalkan risiko."}</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <span className="font-bold text-slate-800">Skema Tahapan (Milestone)</span>
                    <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-bold">Total: {planResult.totalMilestones} Tahap</span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    <div className="p-5 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                      <div>
                        <div className="font-bold text-slate-800">Uang Muka (DP)</div>
                        <div className="text-xs text-slate-500 mt-0.5">Pencairan pertama saat kampanye sukses mencapai target</div>
                      </div>
                      <div className="font-black text-indigo-600 text-xl">{rp(planResult.advanceAmount)}</div>
                    </div>
                    <div className="p-5 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                      <div>
                        <div className="font-bold text-slate-800">Sisa Dana (Milestones)</div>
                        <div className="text-xs text-slate-500 mt-0.5">Dicairkan secara bertahap setelah bukti pengerjaan disetujui</div>
                      </div>
                      <div className="font-black text-slate-800 text-xl">{rp(planResult.milestoneAmount)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100 shrink-0">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Kembali Edit Form
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-teal-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSubmitting ? "Menyimpan..." : "Publikasikan Kampanye"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500 bg-slate-50/50 rounded-2xl border border-slate-200">
              {createdCampaignStatus === "EVALUATING" ? (
                <>
                  <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-amber-500/20 relative">
                    <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-20"></div>
                    <Info size={48} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 mb-3">Kampanye Sedang Dievaluasi</h2>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                    Karena skor analisis AI berada di bawah standar (85), kampanye Anda saat ini berstatus <b>EVALUATING</b>. Menunggu peninjauan manual dan persetujuan dari pihak Dinas Sosial sebelum dapat menerima donasi.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 relative">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 mb-3">Hore! Kampanye Berhasil Dibuat</h2>
                  <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                    Kampanye penggalangan dana Anda kini telah dicatat di Smart Contract secara transparan dan aman. Anda siap menerima donasi!
                  </p>
                </>
              )}
              <button 
                onClick={() => navigate("/y/campaigns")}
                className="px-6 py-3 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-teal-500/30 flex items-center gap-2"
              >
                Kembali ke Daftar Kampanye
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}