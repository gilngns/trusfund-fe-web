import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CircleDashed, Users, Target, Activity, Check, Banknote, HelpCircle, Camera, Loader2 } from "lucide-react";
import { campaignApi } from "../../api/client";
import { rp } from "../../api/format";

export default function YCampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap pilih file gambar");
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
        alert("Foto kampanye berhasil diperbarui!");
      } catch (err) {
        alert(err.message || "Gagal mengunggah gambar");
      } finally {
        setIsUploadingImage(false);
      }
    };
  };

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await campaignApi.getById(id);
      setCampaign(res.campaign || res); // Depending on response structure
    } catch (e) {
      alert("Gagal memuat detail kampanye: " + e.message);
      navigate("/y/campaigns");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 bg-slate-200 rounded-md w-1/3 animate-pulse"></div>
              <div className="h-5 bg-slate-200 rounded-full w-20 animate-pulse"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded-md w-1/4 animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-64 w-full bg-slate-100 animate-pulse"></div>
              <div className="p-6 md:p-8 space-y-3">
                <div className="h-6 bg-slate-100 rounded-md w-1/4 animate-pulse mb-4"></div>
                <div className="h-4 bg-slate-100 rounded-md w-full animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded-md w-full animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded-md w-2/3 animate-pulse"></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
               <div className="h-6 bg-slate-100 rounded-md w-1/3 animate-pulse mb-6"></div>
               <div className="space-y-6">
                 {[1, 2].map(i => (
                   <div key={i} className="flex gap-4">
                     <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse shrink-0"></div>
                     <div className="flex-1 h-24 bg-slate-100 rounded-xl animate-pulse"></div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="h-6 bg-slate-100 rounded-md w-1/2 animate-pulse mb-4"></div>
              <div className="h-10 bg-slate-100 rounded-md w-3/4 animate-pulse"></div>
              <div className="h-3 bg-slate-100 rounded-full w-full animate-pulse my-4"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-slate-100 rounded-md w-1/4 animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded-md w-1/4 animate-pulse"></div>
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-100 rounded-md w-1/3 animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded-md w-1/4 animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-100 rounded-md w-1/3 animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded-md w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full animate-pulse mb-3"></div>
              <div className="h-5 bg-slate-100 rounded-md w-1/2 animate-pulse mb-2"></div>
              <div className="h-4 bg-slate-100 rounded-md w-full animate-pulse mb-1"></div>
              <div className="h-4 bg-slate-100 rounded-md w-3/4 animate-pulse mb-4"></div>
              <div className="w-full h-10 bg-slate-100 rounded-lg animate-pulse"></div>
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
  
  // Calculate collected logic (fallback to 0 if not provided)
  const collectedAmount = campaign.collectedAmount ? Number(campaign.collectedAmount) : 0;
  const percentage = targetAmount > 0 ? Math.min(Math.round((collectedAmount / targetAmount) * 100), 100) : 0;
  
  const statusColor = {
    ACTIVE: "bg-blue-100 text-blue-700 border-blue-200",
    FROZEN: "bg-red-100 text-red-700 border-red-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200"
  }[campaign.status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-800 line-clamp-1">{campaign.title}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}>
              {campaign.status}
            </span>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
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
                  className="px-4 py-2 bg-white/90 text-slate-800 font-bold rounded-lg hover:bg-white flex items-center gap-2 text-sm shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
                >
                  {isUploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  {isUploadingImage ? "Mengunggah..." : "Ubah Foto Sampul"}
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                className="hidden" 
              />
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Deskripsi Kampanye</h3>
                <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                  {campaign.description || "Tidak ada deskripsi."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Skema Pencairan Dana (Milestones)</h3>
            </div>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              
              {/* Advance Amount Milestone (DP) */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Check size={16} strokeWidth={3} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-slate-800 text-sm">Dana Awal (DP)</div>
                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Otomatis</div>
                  </div>
                  <div className="text-slate-500 text-xs mb-2">Cair setelah target tercapai.</div>
                  <div className="font-black text-slate-800">{rp(advanceAmount)}</div>
                </div>
              </div>

              {/* Dynamic Milestones from DB */}
              {campaign.milestones && campaign.milestones.map((ms, index) => {
                const isReleased = ms.isReleased;
                return (
                  <div key={ms.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${isReleased ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {isReleased ? <Check size={16} strokeWidth={3} /> : <CircleDashed size={16} />}
                    </div>
                    <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-sm ${isReleased ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className={`font-bold text-sm ${isReleased ? 'text-slate-800' : 'text-slate-600'}`}>Milestone {index + 1}</div>
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isReleased ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-200'}`}>
                          {isReleased ? 'Selesai' : 'Terkunci'}
                        </div>
                      </div>
                      <div className="text-slate-500 text-xs mb-2">{ms.title || 'Bukti Progres Dibutuhkan'}</div>
                      <div className={`font-black ${isReleased ? 'text-slate-800' : 'text-slate-400'}`}>{rp(ms.amount)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar (Right Column) */}
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
              <div 
                className="h-3 rounded-full bg-teal-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-6">
              <span>{percentage}%</span>
              <span className="flex items-center gap-1"><Users size={12}/> {campaign.donations?.length || 0} Donatur</span>
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

          {/* Action Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
              <HelpCircle className="text-slate-400" size={24} />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">Cairkan Milestone</h4>
            <p className="text-xs text-slate-500 mb-4">Upload bukti progres pengerjaan Anda agar dana milestone berikutnya dapat dicairkan melalui Smart Contract.</p>
            <button className="w-full py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors shadow-sm text-sm">
              Ajukan Pencairan (WIP)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
