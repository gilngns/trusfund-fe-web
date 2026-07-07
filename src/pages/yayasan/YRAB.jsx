import { Calculator, Sparkles, FileText, Download, Plus, AlertCircle } from "lucide-react";

export default function YRAB() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rencana Anggaran Biaya (RAB)</h1>
          <p className="text-slate-500 mt-1">Buat, kelola, dan tracking pengeluaran kampanye Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-100 transition-colors shadow-sm text-sm border border-indigo-100">
            <Sparkles size={16} />
            Generate via AI
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm text-sm">
            <Plus size={16} />
            Buat RAB Manual
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-blue-900">Integrasi AI Aktif</h4>
          <p className="text-sm text-blue-700 mt-1">Sistem AI Microservice siap digunakan. Anda dapat melakukan generate draf RAB secara otomatis dengan memberikan detail program kampanye.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Daftar Dokumen RAB</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          <RABItem title="RAB Pembangunan Sumur NTT" status="approved" total="Rp 80.000.000" date="Dibuat: 10 Sep 2026" />
          <RABItem title="RAB Bantuan Bencana Gempa" status="draft" total="Rp 100.000.000" date="Dibuat: 12 Okt 2026" />
        </div>
      </div>
    </div>
  );
}

function RABItem({ title, status, total, date }) {
  return (
    <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base">{title}</h3>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs font-semibold text-slate-500">{date}</span>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <span className="text-xs font-bold text-teal-600">{total}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
        {status === 'approved' && (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Disetujui</span>
        )}
        {status === 'draft' && (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Draf / Revisi</span>
        )}
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Download PDF">
            <Download size={18} />
          </button>
          <button className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  );
}
