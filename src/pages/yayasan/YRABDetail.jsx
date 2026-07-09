import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle2, ShieldCheck, Cpu } from "lucide-react";
import { campaignApi } from "../../api/client";
import { rp } from "../../api/format";
import Swal from "sweetalert2";

export default function YRABDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await campaignApi.getById(id);
      setCampaign(res.campaign || res);
    } catch (e) {
      Swal.fire("Error", "Gagal memuat detail RAB: " + e.message, "error");
      navigate("/y/rab");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse pb-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
          <div>
            <div className="h-6 w-64 bg-slate-200 rounded-md mb-2"></div>
            <div className="h-4 w-40 bg-slate-200 rounded-md"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0"></div>
              <div className="flex-1">
                <div className="h-3 w-20 bg-slate-200 rounded mb-2"></div>
                <div className="h-6 w-32 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <div className="h-5 w-48 bg-slate-200 rounded"></div>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex gap-4 items-center">
                  <div className="h-4 w-6 bg-slate-200 rounded"></div>
                  <div className="h-4 w-48 bg-slate-200 rounded"></div>
                </div>
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return <div className="p-8 text-center text-rose-500">Data tidak ditemukan</div>;
  }

  // Parse rabData safely
  let rabItems = [];
  try {
    if (typeof campaign.rabData === 'string') {
      rabItems = JSON.parse(campaign.rabData);
    } else if (Array.isArray(campaign.rabData)) {
      rabItems = campaign.rabData;
    } else if (campaign.rabData && typeof campaign.rabData === 'object') {
      // Sometimes it's wrapped in an object like { items: [] }
      rabItems = campaign.rabData.items || campaign.rabData.rab || [];
    }
  } catch(e) {
    console.error("Failed to parse rabData", e);
  }

  // Handle nested object structure from some AI outputs (e.g. { Item1: price, Item2: price }) if it's not an array
  if (!Array.isArray(rabItems) && typeof rabItems === 'object') {
    rabItems = Object.entries(rabItems).map(([name, cost]) => ({
      item: name,
      total: cost,
    }));
  }

  const handleViewIzin = () => {
    if (!campaign.izinPub) return;
    
    if (!campaign.izinPub.startsWith('data:')) {
      window.open(campaign.izinPub, '_blank');
      return;
    }
    
    try {
      const arr = campaign.izinPub.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type:mime});
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      console.error("Failed to parse data URL", e);
      // Fallback to direct navigation
      const w = window.open('about:blank');
      if (w) {
        w.document.write(`<iframe src="${campaign.izinPub}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/y/rab')}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 line-clamp-1 max-w-[500px]">Detail RAB: {campaign.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Budget Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total RAB</p>
            <p className="text-lg font-bold text-slate-800">{rp(campaign.targetAmount)}</p>
          </div>
        </div>

        {/* AI Score Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Cpu size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">AI Trust Score</p>
            <p className="text-lg font-bold text-slate-800">{campaign.aiScore || 0}%</p>
          </div>
        </div>

        {/* Izin PUB Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Izin PUB</p>
            {campaign.izinPub ? (
              <button 
                onClick={handleViewIzin}
                className="text-sm font-bold text-teal-600 hover:text-teal-700 underline truncate block text-left"
              >
                Lihat Dokumen
              </button>
            ) : (
              <p className="text-sm font-bold text-slate-800"><span className="text-slate-400 italic">Belum tersedia</span></p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Rincian Barang & Biaya</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          {rabItems && rabItems.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">No</th>
                  <th className="p-4">Deskripsi / Item</th>
                  <th className="p-4 text-right">Biaya (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {rabItems.map((item, idx) => {
                  // handle flexible item structures
                  const itemName = item.item || item.name || item.description || item.deskripsi || item.barang || 'Item Tidak Diketahui';
                  // try to get numeric total if possible
                  let itemTotal = item.total || item.price || item.harga || item.cost || item.biaya || item.amount || 0;
                  
                  // if it's already a formatted string, keep it, else format it
                  const formattedTotal = typeof itemTotal === 'number' || !isNaN(Number(itemTotal)) 
                    ? rp(Number(itemTotal)) 
                    : itemTotal;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="p-4 font-medium text-slate-700">{itemName}</td>
                      <td className="p-4 text-right font-bold text-slate-800">{formattedTotal}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="p-4 text-right font-bold text-slate-700">Total Keseluruhan:</td>
                  <td className="p-4 text-right font-bold text-teal-600 text-base">{rp(campaign.targetAmount)}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-slate-800 font-bold mb-1">Rincian Tidak Ditemukan</h3>
              <p className="text-sm text-slate-500">Tidak ada rincian RAB yang dapat ditampilkan (data kosong atau format tidak sesuai).</p>
            </div>
          )}
        </div>
      </div>
      
      {campaign.aiNotes && (
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-5 mt-6">
          <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Cpu size={16} />
            Catatan Evaluasi AI
          </h3>
          <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
            {campaign.aiNotes}
          </p>
        </div>
      )}
    </div>
  );
}
