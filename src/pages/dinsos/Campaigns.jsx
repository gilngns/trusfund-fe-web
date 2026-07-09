import { useEffect, useState, useCallback } from "react";
import { ClipboardCheck, Zap, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, X, FileSearch } from "lucide-react";
import Swal from "sweetalert2";
import { campaignApi } from "../../api/client";
import { rp } from "../../api/format";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllApprovals, setShowAllApprovals] = useState(false);
  const [showAllMilestones, setShowAllMilestones] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const d = await campaignApi.list();
      setCampaigns(d.campaigns || []);
    } catch (e) {
      Swal.fire("Error", "Gagal memuat kampanye: " + e.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin menyetujui kampanye ini agar aktif dan tayang?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d9488",
      cancelButtonColor: "#f43f5e",
      confirmButtonText: "Ya, Setujui"
    });
    if (!result.isConfirmed) return;
    try {
      await campaignApi.approveCampaign(id);
      Swal.fire("Berhasil!", "Kampanye telah disetujui.", "success");
      load();
    } catch (e) {
      Swal.fire("Gagal!", "Gagal menyetujui: " + e.message, "error");
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: "Tolak Kampanye?",
      text: "Kampanye ini memiliki skor AI rendah dan Anda akan menolaknya. Lanjutkan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Tolak"
    });
    if (!result.isConfirmed) return;
    try {
      await campaignApi.rejectCampaign(id);
      Swal.fire("Berhasil!", "Kampanye telah ditolak.", "success");
      load();
    } catch (e) {
      Swal.fire("Gagal!", "Gagal menolak: " + e.message, "error");
    }
  };

  const handleViewDocument = (dataUrl) => {
    if (dataUrl.startsWith('data:')) {
      try {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], {type:mime});
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (e) {
        Swal.fire("Error", "Gagal membuka dokumen: " + e.message, "error");
      }
    } else {
      window.open(dataUrl, '_blank');
    }
  };

  // Derived state for summary cards
  const pendingApprovals = campaigns.filter(c => c.status === "PENDING" || c.status === "DRAFT" || c.status === "EVALUATING");
  const activeCampaigns = campaigns.filter(c => c.status === "ACTIVE");
  const frozenCampaigns = campaigns.filter(c => c.status === "FROZEN" || c.status === "REJECTED"); // Mock assumption for frozen

  // Real logic: get all milestones with aiScore < 85 from all campaigns
  const flaggedMilestones = campaigns.reduce((acc, c) => {
    if (!c.milestones) return acc;
    const flagged = c.milestones.filter(m => m.aiScore !== null && m.aiScore < 85);
    const withCampaign = flagged.map(m => ({ ...m, campaign: c }));
    return [...acc, ...withCampaign];
  }, []);

  const displayedApprovals = showAllApprovals ? pendingApprovals : pendingApprovals.slice(0, 3);
  const displayedMilestones = showAllMilestones ? flaggedMilestones : flaggedMilestones.slice(0, 3);

  const formatDate = (dateString) => {
    if (!dateString) return "Baru-baru ini";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Baru-baru ini";
    return d.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full max-w-[1200px] flex flex-col gap-10 pb-12">
      
      {/* Page Title */}
      <div>
        <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Campaign Approvals & Overview</h1>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-medium text-slate-500">Pending Approvals</span>
            <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-500 flex items-center justify-center">
              <ClipboardCheck size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 leading-none mb-1.5">
              {isLoading ? "..." : pendingApprovals.length}
            </div>
            <div className="text-[11px] font-medium text-slate-400">New campaigns awaiting review</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-medium text-slate-500">Active Campaigns</span>
            <div className="w-7 h-7 rounded-md bg-green-100 text-green-500 flex items-center justify-center">
              <Zap size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 leading-none mb-1.5">
              {isLoading ? "..." : activeCampaigns.length}
            </div>
            <div className="text-[11px] font-medium text-slate-400">Currently running campaigns</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-medium text-slate-500">Funds Frozen / Needs Review</span>
            <div className="w-7 h-7 rounded-md bg-yellow-100 text-yellow-500 flex items-center justify-center">
              <AlertTriangle size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 leading-none mb-1.5">
              {isLoading ? "..." : (frozenCampaigns.length || 0)}
            </div>
            <div className="text-[11px] font-medium text-slate-400">AI score 50–84%, manual check needed</div>
          </div>
        </div>
      </div>

      {/* Section 1: Needs Your Approval */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Needs Your Approval (RAB & Legal)</h2>
            <p className="text-[13px] text-slate-500 font-medium mt-1">Review budget plans and legal documents before approving campaigns</p>
          </div>
          {pendingApprovals.length > 3 && (
            <button 
              onClick={() => setShowAllApprovals(!showAllApprovals)}
              className="text-[13px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              {showAllApprovals ? "Show Less" : "View All"} <ArrowRight size={14} className={showAllApprovals ? "rotate-180" : ""} />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="w-full p-10 flex flex-col items-center justify-center text-slate-500">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            Memuat data persetujuan...
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="w-full bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
            <ShieldCheck size={32} className="mx-auto text-emerald-400 mb-3" />
            <h3 className="font-bold text-slate-900">Semua Beres!</h3>
            <p className="text-sm text-slate-500 mt-1">Tidak ada kampanye yang menunggu persetujuan saat ini.</p>
          </div>
        ) : (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {displayedApprovals.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-indigo-200 transition-all duration-300">
                {/* Image Section */}
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  <img src={item.imageUrl || "https://images.unsplash.com/photo-1541888086925-920eb1de49c1?q=80&w=600&auto=format&fit=crop"} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/50 text-blue-600 text-[10px] font-bold shadow-sm">
                    <ShieldCheck size={12} /> Kemenkumham Validated
                  </div>
                  {item.aiScore !== undefined && item.aiScore < 85 && (
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-sm">
                      <AlertTriangle size={12} /> Evaluasi AI
                    </div>
                  )}
                </div>
                
                {/* Content Section */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-bold text-slate-900 leading-snug mb-1.5 line-clamp-2 group-hover:text-indigo-700 transition-colors">{item.title}</h3>
                  <p className="text-xs font-medium text-slate-500 mb-4 flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> {item.foundation?.name || "Yayasan Tidak Diketahui"}</p>
                  
                  <div className="flex justify-between items-center mb-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Target Dana (RAB)</div>
                      <div className="text-sm font-black text-slate-900 tracking-tight">{rp(item.targetAmount)}</div>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold ${item.aiScore !== undefined && item.aiScore < 85 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {item.aiScore !== undefined && item.aiScore < 85 ? "Butuh Review" : "AI Check: Normal"}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-auto pt-1">
                    <button 
                      onClick={() => setSelectedApproval(item)}
                      className="flex-1 bg-white border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 text-indigo-700 text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <FileSearch size={14} /> Detail
                    </button>
                    {item.aiScore !== undefined && item.aiScore < 85 && (
                      <button 
                        onClick={() => handleReject(item.id)}
                        className="flex-1 bg-white border-2 border-rose-100 hover:border-rose-600 hover:bg-rose-50 text-rose-600 text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <X size={14} /> Tolak
                      </button>
                    )}
                    <button 
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-indigo-600/20"
                    >
                      <CheckCircle2 size={14} /> Setujui
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Milestone Evidence Review */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-start gap-3">
            <AlertTriangle size={36} className="text-yellow-400 mt-1" fill="#fef08a" strokeWidth={1.5} />
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Milestone Evidence Review (AI Score {"<"} 85%)</h2>
              <p className="text-[13px] text-slate-500 font-medium mt-1">Flagged milestones requiring manual verification</p>
            </div>
          </div>
          {flaggedMilestones.length > 3 && (
            <button 
              onClick={() => setShowAllMilestones(!showAllMilestones)}
              className="text-[13px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              {showAllMilestones ? "Show Less" : "View All"} <ArrowRight size={14} className={showAllMilestones ? "rotate-180" : ""} />
            </button>
          )}
        </div>

        {!isLoading && flaggedMilestones.length === 0 && activeCampaigns.length > 0 && (
           <div className="w-full bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
             <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-3" />
             <h3 className="font-bold text-slate-900">Semua Transaksi Aman!</h3>
             <p className="text-sm text-slate-500 mt-1">AI kami tidak menemukan anomali pada pencairan milestone saat ini.</p>
           </div>
        )}

        <div className="flex flex-col gap-3">
          {!isLoading && displayedMilestones.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-bold text-slate-900 truncate max-w-[400px]">{item.campaign?.title}</h3>
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-orange-100/70 text-orange-700 text-[10px] font-bold">Flagged</span>
                </div>
                <div className="text-xs font-medium text-slate-500 mb-1">Milestone {item.index + 1} — {item.description || "Review Needed"}</div>
                <div className="text-[11px] italic font-medium text-slate-400">Peringatan AI: Skor di bawah ambang batas (85%)</div>
              </div>

              <div className="flex flex-col items-end min-w-[220px]">
                <div className="w-full mb-3">
                  <div className="flex justify-between items-center text-[10px] font-bold mb-1.5 uppercase tracking-wide">
                    <span className="text-slate-400">Confidence</span>
                    <span className="text-red-600">{item.aiScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: `${item.aiScore}%` }}></div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium text-right mt-1.5">Manual check required</div>
                </div>
                
                <button className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm">
                  <FileSearch size={14} className="text-slate-900" /> View Financial Details & Receipts
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
      
      {/* Campaign Approval Modal */}
      {selectedApproval && (() => {
        let parsedRab = selectedApproval.rabData;
        if (typeof parsedRab === 'string') {
          try { parsedRab = JSON.parse(parsedRab); } catch (e) {}
        }
        
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedApproval(null)}></div>
          <div className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 sticky top-0">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileSearch className="text-indigo-600" /> Detail Evaluasi Kampanye
              </h3>
              <button onClick={() => setSelectedApproval(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full p-2">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Image, Info, Deskripsi */}
              <div className="flex flex-col gap-5">
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-100 shrink-0">
                  <img src={selectedApproval.imageUrl || "https://images.unsplash.com/photo-1541888086925-920eb1de49c1?q=80&w=600&auto=format&fit=crop"} alt={selectedApproval.title} className="w-full h-full object-cover" />
                </div>
                
                <div>
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                    {selectedApproval.category || "Pembangunan"}
                  </div>
                  <h2 className="text-xl font-black text-slate-900 leading-snug">{selectedApproval.title}</h2>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-emerald-500" /> {selectedApproval.foundation?.name || "Yayasan"}
                    </p>
                    {selectedApproval.izinPub && (
                      <button onClick={() => handleViewDocument(selectedApproval.izinPub)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 hover:border-indigo-200 transition-all shadow-sm">
                        <ClipboardCheck size={14} /> Izin PUB
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi Kampanye</div>
                  <div className="text-sm text-slate-600 leading-relaxed line-clamp-3" title={selectedApproval.description}>
                    {selectedApproval.description || "Tidak ada deskripsi yang diberikan."}
                  </div>
                </div>
              </div>

              {/* Right Column: Financials, RAB Items, AI */}
              <div className="flex flex-col gap-5">
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Dana</div>
                    <div className="font-black text-slate-800 text-sm md:text-base">{rp(selectedApproval.targetAmount)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Durasi</div>
                    <div className="font-black text-slate-800">{selectedApproval.durationDays || 30} Hari</div>
                  </div>
                </div>

                {/* AI Analysis Result (Dynamic) */}
                <div className={`rounded-2xl p-4 border ${selectedApproval.aiScore !== undefined && selectedApproval.aiScore < 85 ? "bg-amber-50/50 border-amber-200" : "bg-emerald-50/50 border-emerald-200"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${selectedApproval.aiScore !== undefined && selectedApproval.aiScore < 85 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className={`font-bold ${selectedApproval.aiScore !== undefined && selectedApproval.aiScore < 85 ? "text-amber-900" : "text-emerald-900"}`}>
                        Hasil Analisis AI (Skor: {selectedApproval.aiScore || "N/A"})
                      </h4>
                      <p className={`text-sm mt-1.5 leading-relaxed font-medium ${selectedApproval.aiScore !== undefined && selectedApproval.aiScore < 85 ? "text-amber-800" : "text-emerald-800"}`}>
                        {selectedApproval.aiNotes || (selectedApproval.aiScore !== undefined && selectedApproval.aiScore < 85 ? "Menunggu hasil review dari AI (Data Lama)." : "RAB terlihat wajar dan sesuai (Data Lama).")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* RAB Details Table */}
                <div className="flex-1 flex flex-col min-h-0">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <span>Rincian Anggaran (RAB)</span>
                  </h4>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 max-h-[220px]">
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 font-semibold text-slate-500">Item</th>
                            <th className="px-3 py-2 font-semibold text-slate-500 text-right">Harga</th>
                            <th className="px-3 py-2 font-semibold text-slate-500 text-center">Qty</th>
                            <th className="px-3 py-2 font-semibold text-slate-500 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedRab && Array.isArray(parsedRab) ? (
                            parsedRab.map((rabItem, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-3 py-2.5 whitespace-normal line-clamp-2 w-[140px] text-slate-700 font-medium" title={rabItem.item}>{rabItem.item}</td>
                                <td className="px-3 py-2.5 text-right font-medium text-slate-600">{rp(rabItem.harga || rabItem.unitPrice || 0)}</td>
                                <td className="px-3 py-2.5 text-center text-slate-600">{rabItem.qty} <span className="text-[10px] text-slate-400">{rabItem.unit || rabItem.satuan}</span></td>
                                <td className="px-3 py-2.5 text-right font-bold text-slate-800">{rp((rabItem.harga || rabItem.unitPrice || 0) * (rabItem.qty || 1))}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="px-3 py-8 text-center text-slate-400">
                                Detail RAB tidak tersedia (Kampanye versi lama)
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-3 z-10">
              <button 
                onClick={() => setSelectedApproval(null)}
                className="flex-[0.5] py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
              {selectedApproval.aiScore !== undefined && selectedApproval.aiScore < 85 && (
                <button 
                  onClick={() => {
                    handleReject(selectedApproval.id);
                    setSelectedApproval(null);
                  }}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} /> Tolak
                </button>
              )}
              <button 
                onClick={() => {
                  handleApprove(selectedApproval.id);
                  setSelectedApproval(null);
                }}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} /> Setujui & Tayangkan
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
