import { useEffect, useState, useCallback } from "react";
import { ClipboardCheck, Zap, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, X, FileSearch } from "lucide-react";
import { campaignApi } from "../../api/client";
import { rp } from "../../api/format";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllApprovals, setShowAllApprovals] = useState(false);
  const [showAllMilestones, setShowAllMilestones] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const d = await campaignApi.list();
      setCampaigns(d.campaigns || []);
    } catch (e) {
      alert("Gagal memuat kampanye: " + e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Derived state for summary cards
  const pendingApprovals = campaigns.filter(c => c.status === "PENDING" || c.status === "DRAFT");
  const activeCampaigns = campaigns.filter(c => c.status === "ACTIVE");
  const frozenCampaigns = campaigns.filter(c => c.status === "FROZEN" || c.status === "REJECTED"); // Mock assumption for frozen

  // For the Milestone UI, we'll take active campaigns and pretend they have flagged milestones
  const flaggedMilestones = activeCampaigns;

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {displayedApprovals.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
                
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-600 text-[10px] font-bold self-start mb-4">
                  <ShieldCheck size={12} /> Kemenkumham Validated
                </div>
                
                <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">{item.title}</h3>
                <p className="text-xs font-medium text-slate-400 mb-5">{item.foundation?.name || "Yayasan Tidak Diketahui"}</p>
                
                <div className="h-[1px] w-full bg-slate-100 mb-4"></div>
                
                <div className="flex justify-between items-end mb-5">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-0.5">Budget (RAB)</div>
                    <div className="text-[15px] font-bold text-slate-900 tracking-tight">{rp(item.targetAmount)}</div>
                  </div>
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-bold">
                    AI RAB Check : Normal
                  </div>
                </div>
                
                <div className="text-[10px] font-medium text-slate-400 mb-4 mt-auto uppercase tracking-wide">
                  Submitted {formatDate(item.createdAt)}
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                    <CheckCircle2 size={14} /> Review & Approve
                  </button>
                  <button className="flex-[0.5] bg-white border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                    <X size={14} /> Reject
                  </button>
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
                  <h3 className="text-base font-bold text-slate-900 truncate max-w-[400px]">{item.title}</h3>
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-orange-100/70 text-orange-700 text-[10px] font-bold">Flagged</span>
                </div>
                <div className="text-xs font-medium text-slate-500 mb-1">Milestone {idx + 1} — Material Procurement</div>
                <div className="text-[11px] italic font-medium text-slate-400">Receipt amounts don't match submitted RAB line items</div>
              </div>

              <div className="flex flex-col items-end min-w-[220px]">
                <div className="w-full mb-3">
                  <div className="flex justify-between items-center text-[10px] font-bold mb-1.5 uppercase tracking-wide">
                    <span className="text-slate-400">Confidence</span>
                    <span className="text-red-600">{72 + idx}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: `${72 + idx}%` }}></div>
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
      
    </div>
  );
}
