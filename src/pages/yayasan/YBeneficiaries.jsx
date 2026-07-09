import { Search, UserPlus, Heart, MapPin, Phone } from "lucide-react";

export default function YBeneficiaries() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Penerima Manfaat</h1>
          <p className="text-slate-500 mt-1">Database individu atau institusi yang dibantu.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm text-sm">
          <UserPlus size={16} />
          Tambah Data
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama atau NIK..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-6 gap-6">
          <BeneficiaryCard 
            name="Panti Asuhan Kasih Bunda" 
            type="Institusi" 
            location="Jakarta Selatan" 
            phone="0812-3456-7890" 
            programsCount={3}
          />
          <BeneficiaryCard 
            name="Bpk. Rahmat Santoso" 
            type="Individu" 
            location="Kab. Lombok Utara" 
            phone="-" 
            programsCount={1}
          />
        </div>
      </div>
    </div>
  );
}

function BeneficiaryCard({ name, type, location, phone, programsCount }) {
  return (
    <div className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <Heart size={20} />
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${type === 'Institusi' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
          {type}
        </span>
      </div>
      
      <h3 className="font-bold text-slate-800 text-lg mb-1">{name}</h3>
      
      <div className="space-y-2 mt-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-slate-400" /> {location}
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-slate-400" /> {phone}
        </div>
      </div>
      
      <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          Terlibat di <span className="text-teal-600 font-bold">{programsCount}</span> Program
        </span>
        <button className="text-sm font-semibold text-teal-600 hover:underline">Profil Lengkap</button>
      </div>
    </div>
  );
}
