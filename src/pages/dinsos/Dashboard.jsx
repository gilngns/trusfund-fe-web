import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Calendar, LogOut, Search, Sparkles, MoveRight, Wallet, Target, Activity, ArrowUpRight, Download, Plus, X } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import ProgressBar from "../../components/ProgressBar";
import { campaignApi, transactionApi } from "../../api/client";
import { rp } from "../../api/format";

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState("All Campaigns");
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 Days");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [rawTransactions, setRawTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const campaignOptions = ["All Campaigns", ...new Set(featuredCampaigns.map(c => c.title))];

  const filteredCampaigns = featuredCampaigns.filter(c => {
    if (selectedCampaign !== "All Campaigns" && c.title !== selectedCampaign) return false;

    if (selectedDateRange !== "All Time") {
      const created = new Date(c.createdAt || c.updatedAt || Date.now());
      const now = new Date();

      const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const diffDays = Math.round((today - createdDay) / (1000 * 60 * 60 * 24));

      if (selectedDateRange === "Today" && diffDays !== 0) return false;
      if (selectedDateRange === "Yesterday" && diffDays !== 1) return false;
      if (selectedDateRange === "Last 7 Days" && diffDays > 7) return false;
      if (selectedDateRange === "Last 30 Days" && diffDays > 30) return false;
      if (selectedDateRange === "This Month" && (created.getMonth() !== now.getMonth() || created.getFullYear() !== now.getFullYear())) return false;
      if (selectedDateRange === "Last Month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (created.getMonth() !== lastMonth.getMonth() || created.getFullYear() !== lastMonth.getFullYear()) return false;
      }
    }
    return true;
  });

  const getPreviousPeriodCampaigns = () => {
    return featuredCampaigns.filter(c => {
      if (selectedCampaign !== "All Campaigns" && c.title !== selectedCampaign) return false;
      if (selectedDateRange === "All Time") return false;

      const created = new Date(c.createdAt || c.updatedAt || Date.now());
      const now = new Date();
      const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const diffDays = Math.round((today - createdDay) / (1000 * 60 * 60 * 24));

      if (selectedDateRange === "Today" && diffDays === 1) return true;
      if (selectedDateRange === "Yesterday" && diffDays === 2) return true;
      if (selectedDateRange === "Last 7 Days" && diffDays > 7 && diffDays <= 14) return true;
      if (selectedDateRange === "Last 30 Days" && diffDays > 30 && diffDays <= 60) return true;
      if (selectedDateRange === "This Month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (created.getMonth() === lastMonth.getMonth() && created.getFullYear() === lastMonth.getFullYear()) return true;
      }
      if (selectedDateRange === "Last Month") {
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        if (created.getMonth() === twoMonthsAgo.getMonth() && created.getFullYear() === twoMonthsAgo.getFullYear()) return true;
      }
      return false;
    });
  };

  const previousCampaigns = getPreviousPeriodCampaigns();

  const calculateTrend = (current, previous, format = 'percent') => {
    if (previous === 0) return current > 0 ? (format === 'percent' ? "+100%" : `+${current}`) : (format === 'percent' ? "0%" : "0");
    const diff = current - previous;
    if (format === 'percent') {
      const percent = (diff / previous) * 100;
      return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
    }
    return `${diff > 0 ? '+' : ''}${diff}`;
  };

  const getTrendText = () => {
    switch (selectedDateRange) {
      case "Today": return "vs yesterday";
      case "Yesterday": return "vs previous day";
      case "Last 7 Days": return "vs prev 7 days";
      case "Last 30 Days": return "vs prev 30 days";
      case "This Month": return "vs last month";
      case "Last Month": return "vs 2 months ago";
      default: return "";
    }
  };

  const transactions = rawTransactions.map(tx => ({
    id: tx.id,
    date: new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    campaign: tx.campaign,
    amount: rp(tx.amount),
    status: tx.status,
    method: tx.method || "Bank Transfer"
  })).filter(tx => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return tx.campaign.toLowerCase().includes(q) ||
      tx.amount.toLowerCase().includes(q) ||
      tx.status.toLowerCase().includes(q) ||
      tx.id.toLowerCase().includes(q);
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const d = await campaignApi.list();
        setFeaturedCampaigns((d.campaigns || []).filter(c => c.status === "ACTIVE" || c.status === "COMPLETED"));

        const txData = await transactionApi.list();
        if (Array.isArray(txData)) {
          setRawTransactions(txData);
        } else if (txData && Array.isArray(txData.data)) {
          setRawTransactions(txData.data);
        } else if (txData && txData.transactions) {
          setRawTransactions(txData.transactions);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const sparklineData = [{ v: 10 }, { v: 12 }, { v: 15 }, { v: 18 }, { v: 22 }, { v: 25 }, { v: 30 }, { v: 40 }, { v: 55 }, { v: 60 }, { v: 80 }];

  return (
    <div className="w-full max-w-[1400px] flex flex-col gap-4 pb-2">
      {/* Header & Global Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 font-medium">Here's what's happening with your funds today.</p>
        </div>

        <div className="flex items-center gap-3">
          <CustomSelect
            options={campaignOptions}
            value={selectedCampaign}
            onChange={setSelectedCampaign}
          />

          <DateRangeSelect
            value={selectedDateRange}
            onChange={setSelectedDateRange}
          />
        </div>
      </div>

      {/* Top Cards Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Stats Cards */}
        <div className="flex flex-col sm:flex-row flex-1 gap-3">
          {(() => {
            const getCampaignActualDonated = (campaignTitle) => {
              return rawTransactions
                .filter(tx => tx.campaign === campaignTitle && tx.status !== "Pending Processing")
                .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
            };

            const totalDonated = filteredCampaigns.reduce((sum, c) => sum + getCampaignActualDonated(c.title), 0);
            const activeCount = filteredCampaigns.filter(c => c.status === 'ACTIVE').length || filteredCampaigns.length;
            const released = filteredCampaigns.reduce((sum, c) => sum + getCampaignActualDonated(c.title), 0); // Demo: assuming all collected is released

            const prevTotalDonated = previousCampaigns.reduce((sum, c) => sum + getCampaignActualDonated(c.title), 0);
            const prevActiveCount = previousCampaigns.filter(c => c.status === 'ACTIVE').length || previousCampaigns.length;
            const prevReleased = previousCampaigns.reduce((sum, c) => sum + getCampaignActualDonated(c.title), 0);

            const trendText = getTrendText();
            const donatedTrend = calculateTrend(totalDonated, prevTotalDonated, 'percent');
            const activeTrend = calculateTrend(activeCount, prevActiveCount, 'number');
            const releasedTrend = calculateTrend(released, prevReleased, 'percent');

            return (
              <>
                <StatCard title="Total Donated" value={totalDonated > 0 ? rp(totalDonated) : "Rp 0"} color="emerald" data={sparklineData} trend={donatedTrend} trendText={trendText} icon={Wallet} />
                <StatCard title="Active Campaigns" value={activeCount.toString()} color="blue" data={sparklineData} trend={activeTrend} trendText={trendText} icon={Target} />
                <StatCard title="Funds Released" value={released > 0 ? rp(released) : "Rp 0"} color="purple" data={sparklineData} trend={releasedTrend} trendText={trendText} icon={Activity} />
              </>
            );
          })()}
        </div>
      </div>

      {/* Middle Row: Featured Campaigns */}
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Funded Campaigns</h2>
          <button onClick={() => navigate('/kampanye')} className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
            View all <MoveRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="web25-card rounded-xl overflow-hidden bg-white animate-pulse">
                <div className="h-24 bg-slate-200"></div>
                <div className="p-2.5 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <div className="h-2.5 bg-slate-200 rounded w-10"></div>
                      <div className="h-2.5 bg-slate-200 rounded w-8"></div>
                    </div>
                    <div className="h-1 bg-slate-200 rounded-full w-full"></div>
                    <div className="h-2.5 bg-slate-200 rounded w-1/2 mt-1.5"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredCampaigns.slice(0, 4).map((camp) => {
            const current = rawTransactions
              .filter(tx => tx.campaign === camp.title && tx.status !== "Pending Processing")
              .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

            const progress = camp.targetAmount ? Math.min(100, Math.round((current / camp.targetAmount) * 100)) : (current > 0 ? 100 : 0);
            const disbursed = camp.disbursed || rp(current);
            const image = camp.image || camp.imageUrl || "https://images.unsplash.com/photo-1541888086925-920eb1de49c1?q=80&w=600&auto=format&fit=crop";

            return (
              <div key={camp.id} className="web25-card rounded-xl overflow-hidden group hover:shadow-md transition-shadow bg-white">
                <div className="h-24 bg-slate-200 relative overflow-hidden">
                  <img src={image} alt={camp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                </div>
                <div className="p-2.5 space-y-2">
                  <div className="font-semibold text-xs text-slate-900 truncate">{camp.title}</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-medium">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-teal-600">{progress}%</span>
                    </div>
                    <ProgressBar progress={progress} />
                    <div className="text-[10px] font-medium text-slate-500 pt-0.5">
                      Disbursed: <span className="font-bold text-slate-800">{disbursed}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Table */}
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Transaction History</h2>
          <div className="relative group">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ color: "#000000ff" }}
              className="w-[220px] rounded-full border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-4 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="web25-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Campaign</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="border-t-0">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={`skel-${i}`} className="border-b border-slate-50 last:border-0 animate-pulse">
                      <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-2.5">
                        <div className="text-slate-700 font-medium">{tx.date}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-slate-900">{tx.campaign}</span>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{tx.amount}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tx.status === "Pending Processing"
                            ? "text-slate-600"
                            : tx.status === "Funds Disbursed"
                              ? "text-teal-600"
                              : "text-blue-600"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tx.status === "Pending Processing" ? "bg-slate-400" : tx.status === "Funds Disbursed" ? "bg-teal-500" : "bg-blue-500"
                            }`}></span>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => setSelectedTransaction(tx)}
                          className="text-teal-600 hover:text-teal-700 font-medium text-xs inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Details <MoveRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500 text-sm">
                      {searchQuery
                        ? "No transactions found matching your search criteria."
                        : "No transactions available yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 px-4 flex justify-between items-center bg-slate-50/30">
            <div className="text-sm font-medium text-slate-500">
              Showing {transactions.length > 0 ? 1 : 0} to {Math.min(5, transactions.length)} of {transactions.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white bg-white/50 transition-colors shadow-sm disabled:opacity-50">
                <ChevronDown size={16} className="rotate-90" />
              </button>
              <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white bg-white/50 transition-colors shadow-sm">
                <ChevronDown size={16} className="-rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setSelectedTransaction(null)}></div>
          <div className="web25-card relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up [animation-duration:200ms]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Disbursement Details</h3>
              <button onClick={() => setSelectedTransaction(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-1 shadow-sm border border-slate-200">
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              <div className="flex flex-col items-center justify-center text-center pb-5 border-b border-slate-100 border-dashed">
                <div className="text-sm font-medium text-slate-500 mb-1">Amount Transferred</div>
                <div className="text-3xl font-black text-slate-900 tracking-tight mb-3">{selectedTransaction.amount}</div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${selectedTransaction.status === "Pending Processing" ? "bg-slate-100 text-slate-600" :
                    selectedTransaction.status === "Funds Disbursed" ? "bg-teal-50 text-teal-700" : "bg-blue-50 text-blue-700"
                  }`}>
                  {selectedTransaction.status}
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Reference ID</span>
                  <span className="font-semibold text-slate-800">TRX-{selectedTransaction.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Date & Time</span>
                  <span className="font-semibold text-slate-800">{selectedTransaction.date}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Campaign</span>
                  <span className="font-semibold text-slate-800">{selectedTransaction.campaign}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Destination</span>
                  <span className="font-semibold text-slate-800">Yayasan / Foundation</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Transfer Method</span>
                  <span className="font-semibold text-slate-800">{selectedTransaction.method}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-teal-600/20">
                <Download size={14} /> Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, color, data, trend, trendText, icon: Icon }) {
  const colorMap = {
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', hex: '#10b981' },
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', hex: '#3b82f6' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50', hex: '#a855f7' },
  };

  const c = colorMap[color];
  const isPositive = trend && trend.startsWith('+');
  const isNeutral = trend === '0%' || trend === '0';
  const trendColor = isPositive
    ? 'text-emerald-700 bg-emerald-50/80'
    : isNeutral
      ? 'text-slate-600 bg-slate-100/80'
      : 'text-red-700 bg-red-50/80';

  return (
    <div className={`web25-card flex-1 p-5 rounded-2xl relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300`}>
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-0.5">
          <div className="text-sm font-medium text-slate-500">
            {title}
          </div>
          <div className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</div>
        </div>
        {Icon && <Icon size={20} className={c.text} />}
      </div>
      {trend && trendText && (
        <div className="flex items-center gap-1.5 mt-2 relative z-10">
          <div className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${trendColor}`}>
            {isPositive && <ArrowUpRight size={14} />}
            {!isPositive && !isNeutral && <ArrowUpRight size={14} className="rotate-90" />}
            {trend}
          </div>
          <span className="text-xs text-slate-400">{trendText}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-[40px] opacity-50 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={c.hex} stopOpacity={0.2} />
                <stop offset="95%" stopColor={c.hex} stopOpacity={0} />
              </linearGradient>
              <filter id={`shadow-${color}`} height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={c.hex} floodOpacity="0.5" />
              </filter>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={c.hex}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${color})`}
              filter={`url(#shadow-${color})`}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SortIcon() {
  return (
    <ChevronDown size={14} className="inline-block ml-1 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors" />
  );
}

function CustomSelect({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-[220px] h-9 web25-button rounded-md px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10"
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-[260px] web25-card rounded-lg z-50 overflow-hidden animate-fade-in-up [animation-duration:200ms]">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full web25-input rounded-md py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[240px] overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${value === opt ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 font-medium'}`}
                >
                  <span className="truncate block">{opt}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-xs font-medium text-slate-400">
                No campaigns found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DateRangeSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "This Month", "Last Month", "All Time"];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-[160px] h-9 web25-button rounded-md px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10"
      >
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <span className="truncate">{value}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-[160px] web25-card rounded-lg z-50 overflow-hidden animate-fade-in-up [animation-duration:200ms]">
          <div className="py-1">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${value === opt ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 font-medium'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


