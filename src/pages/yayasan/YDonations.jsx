import { Search, Filter, Download, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function YDonations() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Donasi & Transaksi</h1>
          <p className="text-slate-500 mt-1">Kelola dan verifikasi semua donasi yang masuk.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm">
            <Download size={16} />
            Export Laporan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari donatur atau ID transaksi..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm w-full sm:w-auto">
            <Filter size={16} />
            Filter Status
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Donatur</th>
                <th className="px-6 py-4 font-semibold">Kampanye</th>
                <th className="px-6 py-4 font-semibold">Nominal</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <TransactionRow 
                name="Budi Santoso" email="budi@example.com" 
                campaign="Bantuan Bencana Gempa" amount="Rp 500.000" 
                date="12 Okt 2026" status="success" 
              />
              <TransactionRow 
                name="Hamba Allah" email="-" 
                campaign="Pembangunan Masjid" amount="Rp 1.000.000" 
                date="11 Okt 2026" status="pending" 
              />
              <TransactionRow 
                name="Siti Aminah" email="siti@example.com" 
                campaign="Beasiswa Anak Yatim" amount="Rp 250.000" 
                date="10 Okt 2026" status="failed" 
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ name, email, campaign, amount, date, status }) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="font-semibold text-slate-800">{name}</div>
        <div className="text-xs text-slate-400 mt-0.5">{email}</div>
      </td>
      <td className="px-6 py-4 font-medium">{campaign}</td>
      <td className="px-6 py-4 font-bold text-slate-800">{amount}</td>
      <td className="px-6 py-4 text-slate-500">{date}</td>
      <td className="px-6 py-4">
        {status === 'success' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 size={12} /> Berhasil
          </span>
        )}
        {status === 'pending' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-600 border border-yellow-100">
            <Clock size={12} /> Menunggu Verifikasi
          </span>
        )}
        {status === 'failed' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
            <XCircle size={12} /> Gagal
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        {status === 'pending' ? (
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Setujui">
              <CheckCircle2 size={18} />
            </button>
            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Tolak">
              <XCircle size={18} />
            </button>
          </div>
        ) : (
          <button className="text-teal-600 text-sm font-semibold hover:underline">Detail</button>
        )}
      </td>
    </tr>
  );
}
