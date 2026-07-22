import { useState, useEffect } from "react";
import { Wallet, Users, LayoutList, TrendingUp, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from "../../api/client";

export default function YDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get('/dashboard/foundation');
        if (res.ok) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Memuat data dashboard...</p>
      </div>
    );
  }

  const dashboardData = data || {
    totalDonasi: "Rp 0",
    penerimaManfaat: "0",
    programAktif: "0",
    tingkatKeberhasilan: "0%",
    grafikDonasi: [],
    trends: { donasi: "0%", penerima: "0%", program: "0%", keberhasilan: "0%" }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <p className="text-slate-500 mt-1">Ringkasan performa yayasan Anda bulan ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Donasi" value={(dashboardData.totalDonasi || "").replace('M', ' Juta').replace('B', ' Miliar')} icon={Wallet} trend={dashboardData.trends?.donasi || "0%"} />
        <StatCard title="Penerima Manfaat" value={dashboardData.penerimaManfaat} icon={Users} trend={dashboardData.trends?.penerima || "0%"} />
        <StatCard title="Program Aktif" value={dashboardData.programAktif} icon={LayoutList} trend={dashboardData.trends?.program || "0%"} />
        <StatCard title="Tingkat Keberhasilan" value={dashboardData.tingkatKeberhasilan} icon={TrendingUp} trend={dashboardData.trends?.keberhasilan || "0%"} />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Grafik Donasi (6 Bulan Terakhir)</h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboardData.grafikDonasi} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} Miliar`;
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} Juta`;
                  if (value >= 1000) return `${(value / 1000).toFixed(1)} Rb`;
                  return value;
                }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Total']}
              />
              <Area type="monotone" dataKey="total" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
        <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-slate-800">{value}</span>
        {trend !== "0%" && (
          <span className={`text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
