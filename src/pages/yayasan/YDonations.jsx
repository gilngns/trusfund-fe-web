import { useState, useEffect } from "react";
import { Search, Filter, Download, CheckCircle2, XCircle, Clock, Loader2, X } from "lucide-react";
import { transactionApi } from "../../api/client";
import { rp } from "../../api/format";

export default function YDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTx, setSelectedTx] = useState(null);

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
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-slate-100 last:border-0">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-slate-100 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-40 mb-2"></div>
                      <div className="h-3 bg-slate-100 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
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
                    onDetail={() => setSelectedTx(tx)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTx && (
        <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
}

function TransactionRow({ id, name, email, campaign, amount, date, status, onDetail }) {
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
        <button onClick={onDetail} className="text-teal-600 text-sm font-semibold hover:underline">Detail</button>
      </td>
    </tr>
  );
}

function TransactionModal({ tx, onClose }) {
  if (!tx) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Detail Transaksi</h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <div className="text-sm text-slate-500 mb-1">ID Transaksi</div>
            <div className="font-mono text-sm text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100 break-all">{tx.id}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-500 mb-1">Donatur</div>
              <div className="font-medium text-slate-800">{tx.donorName}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">Nominal</div>
              <div className="font-bold text-slate-800">{rp(tx.amount)}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Dompet/Alamat (Opsional)</div>
            <div className="font-mono text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 break-all">
              {tx.donorAddress && tx.donorAddress !== "-" ? tx.donorAddress : "Tidak ada"}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Kampanye</div>
            <div className="font-medium text-slate-800">{tx.campaign}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-500 mb-1">Tanggal</div>
              <div className="font-medium text-slate-800">
                {new Date(tx.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">Status</div>
              <div>
                {tx.status === 'success' && <span className="text-emerald-600 font-bold text-sm">PAID</span>}
                {tx.status === 'deposited' && <span className="text-indigo-600 font-bold text-sm">DEPOSITED</span>}
                {tx.status === 'pending' && <span className="text-yellow-600 font-bold text-sm">PENDING</span>}
                {tx.status === 'failed' && <span className="text-red-600 font-bold text-sm">FAILED</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-sm">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
