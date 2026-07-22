import { Plus, MoreHorizontal, Users, Clock, ArrowRight } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { campaignApi } from "../../api/client";
import { rp } from "../../api/format";

export default function YCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 6;

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await campaignApi.list(filter, page, limit);
      setCampaigns(res.campaigns || []);
      setPagination(res.pagination || null);
    } catch (e) {
      console.error("Failed to load campaigns:", e);
    } finally {
      setIsLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (newFilter) => {
    if (newFilter !== filter) {
      setFilter(newFilter);
      setPage(1);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kampanye Program</h1>
          <p className="text-slate-500 mt-1">Kelola program penggalangan dana Anda.</p>
        </div>
        <Link to="/y/campaigns/create" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm text-sm">
          <Plus size={16} />
          Buat Kampanye Baru
        </Link>
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => handleFilterChange("ALL")}
          className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${filter === "ALL" ? "border-teal-500 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Semua
        </button>
        <button 
          onClick={() => handleFilterChange("ACTIVE")}
          className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${filter === "ACTIVE" ? "border-teal-500 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Aktif
        </button>
        <button 
          onClick={() => handleFilterChange("EVALUATING")}
          className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${filter === "EVALUATING" ? "border-teal-500 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Butuh Persetujuan
        </button>
        <button 
          onClick={() => handleFilterChange("FROZEN")}
          className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${filter === "FROZEN" ? "border-teal-500 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Ditolak
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="h-48 w-full bg-slate-100 animate-pulse"></div>
              <div className="p-5 flex flex-col gap-4">
                <div className="h-5 bg-slate-100 rounded-md w-3/4 animate-pulse"></div>
                <div className="flex justify-between items-end mt-2">
                  <div className="h-4 bg-slate-100 rounded-md w-1/3 animate-pulse"></div>
                  <div className="h-3 bg-slate-100 rounded-md w-1/4 animate-pulse"></div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full animate-pulse mt-1"></div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="h-3 bg-slate-100 rounded-md w-12 animate-pulse"></div>
                  <div className="h-3 bg-slate-100 rounded-md w-16 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <p className="text-slate-500 font-medium">Tidak ada kampanye untuk kategori ini.</p>
          <Link to="/y/campaigns/create" className="inline-block mt-4 px-4 py-2 bg-teal-50 text-teal-600 font-semibold rounded-lg hover:bg-teal-100 transition-colors text-sm">
            Mulai Penggalangan Dana
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => {
            // Mock or calculate missing data for UI
            const target = Number(c.targetAmount) || 0;
            const collected = c.collectedAmount ? Number(c.collectedAmount) : 0; // if backend provides it
            const percentage = target > 0 ? Math.min(Math.round((collected / target) * 100), 100) : 0;
            const donors = c.donorCount || (c.donations ? c.donations.length : 0);
            const isCompleted = percentage >= 100;
            
            return (
              <CampaignCard 
                key={c.id}
                id={c.id}
                title={c.title} 
                image={c.imageUrl}
                target={rp(target)}
                collected={rp(collected)}
                percentage={percentage}
                donors={donors}
                daysLeft={30} // Placeholder for now
                isCompleted={isCompleted}
                status={c.status}
              />
            );
          })}
        </div>
        
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
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
  );
}

function CampaignCard({ id, title, image, target, collected, percentage, donors, daysLeft, isCompleted, status }) {
  return (
    <Link to={`/y/campaigns/${id}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-slate-400 text-sm font-semibold">Belum ada foto</span>
        )}
        {isCompleted ? (
          <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
            Target Tercapai
          </div>
        ) : status === "ACTIVE" ? (
          <div className="absolute top-3 left-3 px-3 py-1 bg-teal-500 text-white text-xs font-bold rounded-full shadow-sm">
            Aktif
          </div>
        ) : status === "EVALUATING" ? (
          <div className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-sm">
            Dievaluasi
          </div>
        ) : status === "FROZEN" ? (
          <div className="absolute top-3 left-3 px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full shadow-sm">
            Ditolak
          </div>
        ) : null}
        <button className="absolute top-3 right-3 p-1.5 bg-white/90 text-slate-600 rounded-md shadow-sm hover:bg-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-4 line-clamp-2">{title}</h3>
        
        <div className="mt-auto">
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span className="text-teal-600">{collected}</span>
            <span className="text-slate-500">Target {target}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
            <div 
              className={`h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-teal-500'}`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5"><Users size={14} /> {donors}</div>
              <div className="flex items-center gap-1.5"><Clock size={14} /> {isCompleted ? 'Selesai' : `${daysLeft} hari`}</div>
            </div>
            <span className="text-teal-600 group-hover:text-teal-700 transition-colors">
              <ArrowRight size={18} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
