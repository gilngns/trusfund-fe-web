import { useState } from "react";
import { Building2, Mail, MapPin, Globe, Save, Upload, Building, CreditCard, UserCircle } from "lucide-react";

export default function YSettings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengaturan Yayasan</h1>
          <p className="text-slate-500 mt-1">Kelola profil dan informasi publik yayasan Anda.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm">
          <Save size={18} />
          Simpan Perubahan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row flex-1 min-h-0">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4 shrink-0 flex flex-col gap-1 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${
              activeTab === 'profile' ? 'bg-white text-teal-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-200/50 border border-transparent'
            }`}
          >
            <Building2 size={18} />
            Profil Organisasi
          </button>
          <button 
            onClick={() => setActiveTab('bank')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${
              activeTab === 'bank' ? 'bg-white text-teal-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-200/50 border border-transparent'
            }`}
          >
            <CreditCard size={18} />
            Rekening Bank
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-300 h-full">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Informasi Dasar</h2>
              <div className="flex flex-col xl:flex-row gap-8 items-start">
                <div className="w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 hover:border-teal-400 transition-colors cursor-pointer shrink-0">
                  <Upload size={28} className="mb-2" />
                  <span className="text-xs font-bold">Upload Logo</span>
                </div>
                
                <div className="flex-1 space-y-5 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputGroup label="Nama Yayasan" icon={Building2} defaultValue="Yayasan Harapan Bangsa" />
                    <InputGroup label="Email Resmi" icon={Mail} defaultValue="contact@harapanbangsa.org" type="email" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputGroup label="Alamat Lengkap" icon={MapPin} defaultValue="Jl. Sudirman No. 123, Jakarta Selatan" />
                    <InputGroup label="Website" icon={Globe} defaultValue="https://harapanbangsa.org" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi / Visi Misi</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-slate-400 resize-none text-slate-800 font-medium"
                      defaultValue="Berdedikasi untuk meningkatkan kesejahteraan anak yatim dan korban bencana alam di seluruh Indonesia."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-6 animate-in fade-in duration-300 h-full">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-800">Informasi Rekening Bank</h2>
                <p className="text-sm text-slate-500 mt-1">Digunakan untuk menerima pencairan dana kampanye (payout).</p>
              </div>
              
              <div className="max-w-xl space-y-5">
                <InputGroup label="Nama Bank" icon={Building} defaultValue="Bank Mandiri" />
                <InputGroup label="Nomor Rekening" icon={CreditCard} defaultValue="1234567890" />
                <InputGroup label="Nama Pemilik Rekening" icon={UserCircle} defaultValue="Yayasan Harapan Bangsa" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, icon: Icon, type = "text", defaultValue }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type={type} 
          defaultValue={defaultValue}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-slate-800 font-medium"
        />
      </div>
    </div>
  );
}
