import { useState, useEffect } from "react";
import { Search, Filter, Download, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { transactionApi } from "../../api/client";
import { rp } from "../../api/format";

export default function YDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await transactionApi.list();
        if (res.success) {
          setDonations(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredDonations = donations.filter(d => {
    const matchQuery = d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       d.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchQuery && matchStatus;
  });

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
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari donatur atau ID transaksi..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm w-full sm:w-auto appearance-none outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="all">Semua Status</option>
            <option value="success">Berhasil (PAID)</option>
            <option value="deposited">Dana Disalurkan (DEPOSITED)</option>
            <option value="pending">Menunggu (PENDING)</option>
            <option value="failed">Gagal (FAILED)</option>
          </select>
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Memuat data transaksi...</p>
                  </td>
                </tr>
              ) : filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Tidak ada transaksi yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((tx) => (
                  <TransactionRow 
                    key={tx.id}
                    id={tx.id}
                    name={tx.donorName}
                    email={tx.donorAddress === "-" ? "" : tx.donorAddress} 
                    campaign={tx.campaign} 
                    amount={rp(tx.amount)} 
                    date={new Date(tx.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} 
                    status={tx.status} 
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ id, name, email, campaign, amount, date, status }) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="font-semibold text-slate-800">{name}</div>
        <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[120px]">{email || "-"}</div>
      </td>
      <td className="px-6 py-4">
        <div className="font-medium text-slate-800">{campaign}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">ID: {id.substring(0, 8)}...</div>
      </td>
      <td className="px-6 py-4 font-bold text-slate-800">{amount}</td>
      <td className="px-6 py-4 text-slate-500 text-xs">{date}</td>
      <td className="px-6 py-4">
        {status === 'success' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">
            <CheckCircle2 size={12} /> Paid
          </span>
        )}
        {status === 'deposited' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase">
            <CheckCircle2 size={12} /> Deposited
          </span>
        )}
        {status === 'pending' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-yellow-50 text-yellow-600 border border-yellow-100 uppercase">
            <Clock size={12} /> Pending
          </span>
        )}
        {status === 'failed' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-red-50 text-red-600 border border-red-100 uppercase">
            <XCircle size={12} /> Failed
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-teal-600 text-sm font-semibold hover:underline">Detail</button>
      </td>
    </tr>
  );
}
