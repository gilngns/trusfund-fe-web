import { useEffect, useState, useCallback } from "react";
import { FileText, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { campaignApi } from "../../api/client";
import { rp } from "../../api/format";

export default function YRAB() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 10;

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await campaignApi.list(null, page, limit);
      setCampaigns(res.campaigns || []);
      setPagination(res.pagination || null);
    } catch (e) {
      console.error("Failed to load campaigns:", e);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Rencana Anggaran Biaya (RAB)</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar dan detail Rencana Anggaran Biaya kampanye Anda.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Daftar Dokumen RAB</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="animate-pulse divide-y divide-slate-100">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0"></div>
                    <div>
                      <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-24 bg-slate-200 rounded"></div>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <div className="h-3 w-16 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <div className="h-5 w-16 bg-slate-200 rounded"></div>
                    <div className="h-7 w-24 bg-slate-200 rounded-md"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">Tidak ada dokumen RAB.</div>
          ) : (
            <>
              {campaigns.map((c) => (
                <RABItem 
                  key={c.id}
                  id={c.id}
                  title={`RAB ${c.title}`} 
                  status={c.status} 
                  total={rp(c.targetAmount)} 
                  date={`Dibuat: ${new Date(c.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}`} 
                />
              ))}
              {pagination && pagination.totalPages > 1 && (
                <div className="p-4 flex justify-center items-center gap-2 border-t border-slate-100">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm font-medium text-slate-500 px-2">
                    Halaman {page} dari {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RABItem({ id, title, status, total, date }) {
  let statusBadge = null;
  const badgeClasses = "px-2 py-0.5 rounded text-[10px] font-bold border";
  
  if (status === 'ACTIVE') statusBadge = <span className={`${badgeClasses} bg-teal-50 text-teal-600 border-teal-100`}>Aktif</span>;
  else if (status === 'EVALUATING') statusBadge = <span className={`${badgeClasses} bg-amber-50 text-amber-600 border-amber-100`}>Evaluasi</span>;
  else if (status === 'FROZEN') statusBadge = <span className={`${badgeClasses} bg-rose-50 text-rose-600 border-rose-100`}>Ditolak</span>;
  else if (status === 'COMPLETED') statusBadge = <span className={`${badgeClasses} bg-emerald-50 text-emerald-600 border-emerald-100`}>Selesai</span>;
  else statusBadge = <span className={`${badgeClasses} bg-slate-100 text-slate-600 border-slate-200`}>{status}</span>;

  return (
    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
          <FileText size={18} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm line-clamp-1 max-w-[400px]" title={title}>{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-medium text-slate-500">{date}</span>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <span className="text-[11px] font-bold text-teal-600">{total}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
        {statusBadge}
        
        <div className="flex items-center gap-2">
          <Link to={`/y/rab/${id}`} className="px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
}
