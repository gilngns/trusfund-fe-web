import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CircleDashed, Users, Activity, Check, Banknote, HelpCircle, Camera, Loader2, Heart, User, Upload, Lock } from "lucide-react";
import Swal from "sweetalert2";
import { campaignApi, api } from "../../api/client";
import { rp } from "../../api/format";

export default function YCampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isReleasingDP, setIsReleasingDP] = useState(false);
  const [releasingMilestoneIndex, setReleasingMilestoneIndex] = useState(null);
  const [milestonePhotos, setMilestonePhotos] = useState({});
  const fileInputRef = useRef(null);
  const milestoneFileRefs1 = useRef({});
  const milestoneFileRefs2 = useRef({});

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire("Peringatan", "Harap pilih file gambar", "warning");
      return;
    }
    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Image = reader.result;
        await campaignApi.updateImage(id, base64Image);
        setCampaign(prev => ({ ...prev, imageUrl: base64Image }));
        Swal.fire("Berhasil!", "Foto kampanye berhasil diperbarui!", "success");
      } catch (err) {
        Swal.fire("Error", err.message || "Gagal mengunggah gambar", "error");
      } finally {
        setIsUploadingImage(false);
      }
    };
  };

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await campaignApi.getById(id);
      setCampaign(res.campaign || res);
    } catch (e) {
      Swal.fire("Error", "Gagal memuat detail kampanye: " + e.message, "error");
      navigate("/y/campaigns");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  // ── Cairkan Dana Awal (DP) ──
  const handleReleaseDP = async () => {
    const confirm = await Swal.fire({
      title: "Cairkan Dana Awal?",
      text: `Dana awal sebesar ${rp(Number(campaign.advanceAmount) || 0)} akan dicairkan ke rekening yayasan.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Cairkan!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#059669",
    });
    if (!confirm.isConfirmed) return;

    setIsReleasingDP(true);
    try {
      Swal.fire({ title: "Memproses...", text: "Mencairkan dana awal...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const res = await api.post(`/campaigns/${id}/advances/simulate`);
      if (res?.ok) {
        Swal.fire("Berhasil!", res.message || "Dana awal berhasil dicairkan!", "success");
        load();
      }
    } catch (err) {
      Swal.fire("Gagal", err.message || "Gagal mencairkan dana awal.", "error");
    } finally {
      setIsReleasingDP(false);
    }
  };

  // ── Upload foto bukti milestone ──
  const handleMilestonePhotoSelect = (index, photoNum, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire("Peringatan", "Harap pilih file gambar", "warning");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setMilestonePhotos(prev => ({
        ...prev,
        [index]: { ...(prev[index] || {}), [photoNum]: reader.result }
      }));
    };
  };

  // ── Cairkan Milestone ──
  const handleReleaseMilestone = async (index) => {
    const photos = milestonePhotos[index] || {};
    const photo1 = photos[1];
    const photo2 = photos[2];
    
    if (!photo1 || !photo2) {
      Swal.fire("Peringatan", "Upload 2 foto bukti progres terlebih dahulu.", "warning");
      return;
    }
    const confirm = await Swal.fire({
      title: `Cairkan Milestone ${index + 1}?`,
      text: "Dua foto bukti akan dikirim untuk divalidasi AI.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Cairkan!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#059669",
    });
    if (!confirm.isConfirmed) return;

    setReleasingMilestoneIndex(index);
    try {
      Swal.fire({ title: "Memproses...", text: "Validasi AI & pencairan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const res = await api.post(`/campaigns/${id}/milestones/${index}/simulate`, { evidenceImage: photo1, evidenceImage2: photo2 });
      if (res?.ok) {
        Swal.fire("Berhasil!", res.message || `Milestone ${index + 1} berhasil dicairkan!`, "success");
        setMilestonePhotos(prev => { const n = { ...prev }; delete n[index]; return n; });
        load();
      }
    } catch (err) {
      Swal.fire({
        title: "Gagal",
        html: (err.message || "Gagal mencairkan milestone.").replace(/\n/g, "<br>"),
        icon: "error"
      });
    } finally {
      setReleasingMilestoneIndex(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-8 bg-slate-200 rounded-md w-1/3 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded-md w-1/4 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-64 w-full bg-slate-100 animate-pulse"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-slate-100 rounded-md w-1/4 animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded-md w-full animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="h-6 bg-slate-100 rounded-md w-1/2 animate-pulse"></div>
              <div className="h-3 bg-slate-100 rounded-full w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  const targetAmount = Number(campaign.targetAmount) || 0;
  const advanceAmount = Number(campaign.advanceAmount) || 0;
  const milestoneAmount = Number(campaign.milestoneAmount) || 0;
  const collectedAmount = campaign.collectedAmount ? Number(campaign.collectedAmount) : 0;
  const percentage = targetAmount > 0 ? Math.min(Math.round((collectedAmount / targetAmount) * 100), 100) : 0;
  const successfulDonations = (campaign.donations || []).filter(d => ["PAID", "DEPOSITED"].includes(d.status));
  const uniqueDonorsCount = new Set(successfulDonations.map(d => d.donorId || d.donorName || d.donorAddress || d.id)).size;

  const isTargetReached = percentage >= 100;
  const isDPReleased = ["ADVANCE_PAID", "COMPLETED"].includes(campaign.status);

  const statusColor = {
    ACTIVE: "bg-blue-100 text-blue-700 border-blue-200",
    ADVANCE_PAID: "bg-amber-100 text-amber-700 border-amber-200",
    FROZEN: "bg-red-100 text-red-700 border-red-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  }[campaign.status] || "bg-slate-100 text-slate-700 border-slate-200";

  const statusLabel = {
    ACTIVE: "AKTIF",
    ADVANCE_PAID: "BERJALAN",
    FROZEN: "DIBEKUKAN",
    COMPLETED: "SELESAI",
  }[campaign.status] || campaign.status;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-800 line-clamp-1">{campaign.title}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}>{statusLabel}</span>
          </div>
          <div className="text-sm text-slate-500 font-mono mt-1">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: {campaign.id || id}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-64 w-full bg-slate-100 relative group">
              {campaign.imageUrl ? (
                <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Belum ada foto</div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="px-4 py-2 bg-white/90 text-slate-800 font-bold rounded-lg hover:bg-white flex items-center gap-2 text-sm shadow-lg backdrop-blur-sm"
                >
                  {isUploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  {isUploadingImage ? "Mengunggah..." : "Ubah Foto Sampul"}
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/jpg, image/webp" className="hidden" />
            </div>
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Deskripsi Kampanye</h3>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{campaign.description || "Tidak ada deskripsi."}</p>
            </div>
          </div>

          {/* Skema Pencairan Dana */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Skema Pencairan Dana (Milestones)</h3>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">

              {/* Dana Awal (DP) */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${isDPReleased ? "bg-emerald-500 text-white" : isTargetReached ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-400"}`}>
                  {isDPReleased ? <Check size={16} strokeWidth={3} /> : isTargetReached ? <Banknote size={16} /> : <Lock size={14} />}
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-sm ${isDPReleased ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-slate-800 text-sm">Dana Awal (DP)</div>
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDPReleased ? "text-emerald-600 bg-emerald-100" : isTargetReached ? "text-amber-600 bg-amber-100" : "text-slate-500 bg-slate-100"}`}>
                      {isDPReleased ? "✅ Dicairkan" : isTargetReached ? "Siap Dicairkan" : "Menunggu Target"}
                    </div>
                  </div>
                  <div className="text-slate-500 text-xs mb-2">
                    {isDPReleased ? "Dana awal sudah masuk ke rekening yayasan." : "Cair setelah target donasi tercapai 100%."}
                  </div>
                  <div className="font-black text-slate-800">{rp(advanceAmount)}</div>

                  {!isDPReleased && isTargetReached && (
                    <button
                      onClick={handleReleaseDP}
                      disabled={isReleasingDP}
                      className="mt-3 w-full py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isReleasingDP ? <Loader2 size={14} className="animate-spin" /> : <Banknote size={14} />}
                      {isReleasingDP ? "Memproses..." : "Cairkan Dana Awal"}
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Milestones */}
              {campaign.milestones && campaign.milestones.map((ms, idx) => {
                const isReleased = ms.status === "RELEASED";
                const prevReleased = idx === 0 ? isDPReleased : campaign.milestones[idx - 1]?.status === "RELEASED";
                const isUnlocked = isDPReleased && prevReleased && !isReleased;
                const photos = milestonePhotos[ms.index] || {};
                const hasPhoto1 = !!photos[1];
                const hasPhoto2 = !!photos[2];
                const isReadyToRelease = hasPhoto1 && hasPhoto2;
                const isReleasing = releasingMilestoneIndex === ms.index;

                return (
                  <div key={ms.id || idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${isReleased ? "bg-emerald-500 text-white" : isUnlocked ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                      {isReleased ? <Check size={16} strokeWidth={3} /> : isUnlocked ? <Upload size={14} /> : <Lock size={14} />}
                    </div>
                    <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-sm ${isReleased ? "border-emerald-200 bg-emerald-50" : isUnlocked ? "border-blue-200 bg-blue-50/30" : "border-slate-100 bg-slate-50"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className={`font-bold text-sm ${isReleased ? "text-emerald-800" : isUnlocked ? "text-blue-800" : "text-slate-600"}`}>
                          Milestone {idx + 1}
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isReleased ? "text-emerald-600 bg-emerald-100" : isUnlocked ? "text-blue-600 bg-blue-100" : "text-slate-500 bg-slate-200"}`}>
                          {isReleased ? "✅ Dicairkan" : isUnlocked ? "Upload Bukti" : "🔒 Terkunci"}
                        </div>
                      </div>
                      <div className="text-slate-500 text-xs mb-2">{ms.title || `Tahap ${idx + 1}`}</div>
                      <div className={`font-black ${isReleased ? "text-emerald-800" : isUnlocked ? "text-blue-800" : "text-slate-400"}`}>{rp(ms.amount)}</div>

                      {/* Foto bukti yang sudah released */}
                      {isReleased && (ms.evidenceUrl || ms.evidenceUrl2) && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {ms.evidenceUrl && (
                            <div className="rounded-lg overflow-hidden border border-emerald-200 relative group">
                              <img src={ms.evidenceUrl} alt={`Bukti 1 Milestone ${idx + 1}`} className="w-full h-32 object-cover cursor-zoom-in hover:scale-110 transition-transform duration-300" onClick={() => setZoomedImage(ms.evidenceUrl)} />
                              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm border border-emerald-100 flex items-center gap-1">
                                <span className="text-[9px] font-bold text-slate-500">AI Score:</span>
                                <span className={`text-[10px] font-black ${ms.aiScore < 85 ? 'text-amber-600' : 'text-emerald-600'}`}>{ms.aiScore || 95}%</span>
                              </div>
                              <div className="text-[10px] text-emerald-600 font-medium p-1 bg-emerald-50 text-center">Foto 1 ✅</div>
                            </div>
                          )}
                          {ms.evidenceUrl2 && (
                            <div className="rounded-lg overflow-hidden border border-emerald-200 relative group">
                              <img src={ms.evidenceUrl2} alt={`Bukti 2 Milestone ${idx + 1}`} className="w-full h-32 object-cover cursor-zoom-in hover:scale-110 transition-transform duration-300" onClick={() => setZoomedImage(ms.evidenceUrl2)} />
                              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm border border-emerald-100 flex items-center gap-1">
                                <span className="text-[9px] font-bold text-slate-500">AI Score:</span>
                                <span className={`text-[10px] font-black ${ms.aiScore < 85 ? 'text-amber-600' : 'text-emerald-600'}`}>{ms.aiScore || 95}%</span>
                              </div>
                              <div className="text-[10px] text-emerald-600 font-medium p-1 bg-emerald-50 text-center">Foto 2 ✅</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Upload & Cairkan untuk milestone yang unlocked */}
                      {isUnlocked && (
                        <div className="mt-3 space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            {/* Upload Foto 1 */}
                            <div className="space-y-1">
                              {hasPhoto1 && (
                                <div className="rounded-lg overflow-hidden border border-blue-200 mb-1">
                                  <img src={photos[1]} alt="Preview 1" className="w-full h-24 object-cover cursor-zoom-in hover:scale-110 transition-transform duration-300" onClick={() => setZoomedImage(photos[1])} />
                                </div>
                              )}
                              <button
                                onClick={() => milestoneFileRefs1.current[ms.index]?.click()}
                                className="w-full py-1.5 bg-white border-2 border-dashed border-blue-300 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all text-[10px] flex items-center justify-center gap-1"
                              >
                                <Camera size={12} /> {hasPhoto1 ? "Ganti Foto 1" : "Upload Foto 1"}
                              </button>
                              <input
                                type="file"
                                ref={(el) => (milestoneFileRefs1.current[ms.index] = el)}
                                onChange={(e) => handleMilestonePhotoSelect(ms.index, 1, e)}
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                className="hidden"
                              />
                            </div>

                            {/* Upload Foto 2 */}
                            <div className="space-y-1">
                              {hasPhoto2 && (
                                <div className="rounded-lg overflow-hidden border border-blue-200 mb-1">
                                  <img src={photos[2]} alt="Preview 2" className="w-full h-24 object-cover cursor-zoom-in hover:scale-110 transition-transform duration-300" onClick={() => setZoomedImage(photos[2])} />
                                </div>
                              )}
                              <button
                                onClick={() => milestoneFileRefs2.current[ms.index]?.click()}
                                className="w-full py-1.5 bg-white border-2 border-dashed border-blue-300 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all text-[10px] flex items-center justify-center gap-1"
                              >
                                <Camera size={12} /> {hasPhoto2 ? "Ganti Foto 2" : "Upload Foto 2"}
                              </button>
                              <input
                                type="file"
                                ref={(el) => (milestoneFileRefs2.current[ms.index] = el)}
                                onChange={(e) => handleMilestonePhotoSelect(ms.index, 2, e)}
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                className="hidden"
                              />
                            </div>
                          </div>

                          {isReadyToRelease && (
                            <button
                              onClick={() => handleReleaseMilestone(ms.index)}
                              disabled={isReleasing}
                              className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                            >
                              {isReleasing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                              {isReleasing ? "Memproses AI..." : `Cairkan Milestone ${idx + 1}`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-teal-500" />
              Progres Pendanaan
            </h3>
            <div className="mb-4">
              <div className="text-3xl font-black text-slate-900 mb-1">{rp(collectedAmount)}</div>
              <div className="text-sm font-medium text-slate-500">terkumpul dari target <span className="text-slate-800">{rp(targetAmount)}</span></div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
              <div className="h-3 rounded-full bg-teal-500" style={{ width: `${percentage}%` }}></div>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-6">
              <span>{percentage}%</span>
              <span className="flex items-center gap-1"><Users size={12} /> {uniqueDonorsCount} Donatur</span>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Uang Muka (DP)</span>
                <span className="font-bold text-slate-800">{rp(advanceAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Dana Milestone</span>
                <span className="font-bold text-slate-800">{rp(milestoneAmount)}</span>
              </div>
            </div>
          </div>

          {/* Riwayat Donasi */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/40 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
                  <Heart size={20} className="fill-white/20" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 leading-tight">Riwayat Donasi</h3>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Donatur di kampanye ini</p>
                </div>
              </div>

              {campaign.donations && campaign.donations.length > 0 ? (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {campaign.donations.map((donation, index) => (
                    <div key={donation.id || index} className="group flex flex-col p-3.5 rounded-xl border border-slate-100/80 bg-white hover:bg-slate-50 hover:border-teal-100 hover:shadow-sm transition-all duration-300">
                      <div className="flex items-start gap-3 mb-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500 transition-colors shrink-0">
                          <User size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[13px] text-slate-800 group-hover:text-teal-700 transition-colors truncate">{donation.donorName || "Hamba Allah"}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{new Date(donation.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100/80 pt-2.5">
                        <div className="font-black text-slate-800 text-sm">{rp(donation.amount)}</div>
                        <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center ${
                          donation.status === "PAID" || donation.status === "DEPOSITED"
                            ? "text-emerald-700 bg-emerald-100/80 border border-emerald-200"
                            : donation.status === "PENDING"
                            ? "text-amber-700 bg-amber-100/80 border border-amber-200"
                            : donation.status === "FAILED"
                            ? "text-red-700 bg-red-100/80 border border-red-200"
                            : "text-slate-600 bg-slate-100 border border-slate-200"
                        }`}>
                          {donation.status === "DEPOSITED" ? "TERALOKASI" : donation.status === "PAID" ? "BERHASIL" : donation.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 px-4 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                    <Heart size={20} className="text-slate-300" />
                  </div>
                  <div className="font-bold text-sm text-slate-700 mb-1">Belum Ada Donatur</div>
                  <p className="text-[10px] text-slate-500 max-w-xs">Jadilah yang pertama untuk berkontribusi.</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 mx-auto">
              <HelpCircle className="text-slate-400" size={24} />
            </div>
            <h4 className="font-bold text-slate-800 mb-2">Cara Pencairan Dana</h4>
            <div className="text-xs text-slate-500 space-y-1.5 text-left">
              <p>1️⃣ Target donasi harus tercapai <b>100%</b></p>
              <p>2️⃣ Klik <b>"Cairkan Dana Awal"</b> (tanpa foto)</p>
              <p>3️⃣ Upload <b>foto bukti progres</b> tiap milestone</p>
              <p>4️⃣ AI memvalidasi bukti & dana dicairkan</p>
              <p>5️⃣ Platform Fee <b>3%</b> otomatis dipotong</p>
            </div>
          </div>
        </div>

      </div>

      {/* Image Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setZoomedImage(null)}
        >
          <img 
            src={zoomedImage} 
            alt="Zoomed" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
