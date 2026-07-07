import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationApi } from "../api/client";
import { 
  LayoutDashboard, Wallet, Megaphone, Calculator, Users, Settings,
  Menu, Search, Bell, LogOut, User, AlertTriangle, CheckCircle2, Info 
} from "lucide-react";

const NAV = [
  { to: "/y/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/y/donations", label: "Donasi & Transaksi", icon: Wallet },
  { to: "/y/campaigns", label: "Kampanye Program", icon: Megaphone },
  { to: "/y/rab", label: "Anggaran (RAB)", icon: Calculator },
  { to: "/y/beneficiaries", label: "Penerima Manfaat", icon: Users },
  { to: "/y/settings", label: "Pengaturan", icon: Settings },
];

export default function YayasanLayout({ children }) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const res = await notificationApi.list();
        if (res.notifications) setNotifications(res.notifications);
      } catch (e) {
        console.error("Failed to load notifications", e);
      }
    };
    if (user) {
      fetchNotifications();
      // Polling every 30 seconds for new notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        clearInterval(interval);
      };
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await notificationApi.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getInitials = (name) => {
    if (!name) return "YU"; // Yayasan User
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-500/30">
      {/* Topbar */}
      <header className="h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 sticky top-0">
        <div className="flex items-center">
          <button className="text-slate-500 hover:text-slate-800 transition-colors p-1.5 rounded-md hover:bg-slate-100 hidden sm:block md:hidden">
            <Menu size={20} />
          </button>
          <div className="font-extrabold text-xl tracking-tight text-slate-900 sm:ml-4 md:ml-0 flex items-center gap-2">
            <span className="text-teal-600">Yayasan</span>Portal.
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search data..." 
              style={{ color: "#0f172a" }}
              className="pl-9 pr-4 py-1.5 bg-slate-100/50 border border-transparent rounded-md text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 w-[240px] transition-all duration-200 placeholder:text-slate-400" 
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (unreadCount > 0) {
                    markAllAsRead();
                  }
                }}
                className="relative p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-md hover:bg-slate-100"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
              </button>
              
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-fade-in-up [animation-duration:200ms]">
                  <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center mb-1">
                    <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                    {unreadCount > 0 && <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-400 font-medium">No notifications yet.</div>
                    ) : (
                      notifications.map(n => {
                        const Icon = n.type === 'SUCCESS' ? CheckCircle2 : n.type === 'WARNING' ? AlertTriangle : n.type === 'USER' ? User : Info;
                        const iconBg = n.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-500' : n.type === 'WARNING' ? 'bg-yellow-50 text-yellow-500' : n.type === 'USER' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-500';
                        
                        // Parse date relatively (simple logic)
                        const d = new Date(n.createdAt);
                        const mins = Math.floor((new Date() - d) / 60000);
                        const timeStr = mins < 60 ? `${mins || 1} menit yang lalu` : mins < 1440 ? `${Math.floor(mins / 60)} jam yang lalu` : `${Math.floor(mins / 1440)} hari yang lalu`;
                        
                        return (
                          <div key={n.id} onClick={() => markAsRead(n.id, n.isRead)} className={`px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 cursor-pointer flex gap-3 ${!n.isRead ? 'bg-slate-50/50' : ''}`}>
                            <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
                              <Icon size={14} />
                            </div>
                            <div>
                              <p className="text-[13px] text-slate-700 font-medium leading-snug">{n.message}</p>
                              <p className="text-[10px] font-semibold text-slate-400 mt-1">{timeStr}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="px-4 pt-2 border-t border-slate-100">
                    <button className="w-full text-center text-xs font-bold text-teal-600 hover:text-teal-700 py-1 transition-colors">View All Activity</button>
                  </div>
                </div>
              )}
            </div>
            <div className="h-5 w-[1px] bg-slate-200"></div>
            <div className="relative" ref={profileRef}>
              <div 
                className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-slate-700 transition-colors select-none" 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                title={user?.name}
              >
                {getInitials(user?.name)}
              </div>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-fade-in-up [animation-duration:200ms]">
                  <div className="px-4 py-2.5 border-b border-slate-100/80 mb-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.name || "Yayasan User"}</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">{user?.email || "yayasan@trustfund.com"}</p>
                  </div>
                  
                  <div className="px-1.5">
                    <button 
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2 font-semibold rounded-md"
                    >
                      <User size={14} className="text-slate-400" />
                      Profil Yayasan
                    </button>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 font-semibold rounded-md mt-0.5"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[260px] bg-white flex flex-col py-6 shrink-0 border-r border-slate-200 hidden md:flex">
          <div className="px-5 mb-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Portal Yayasan</div>
          <nav className="flex flex-col px-3 gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                    isActive 
                      ? "bg-teal-50 text-teal-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <n.icon size={18} className={isActive ? 'text-teal-600' : 'text-slate-400'} />
                    {n.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
