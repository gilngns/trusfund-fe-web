# NexTrust — Dashboard Dinas Sosial

Dashboard web untuk Dinas Sosial (DINSOS) pada platform NexTrust.
Dibangun dengan React + Vite. Terhubung ke backend `https://nextrust.my.id/api`.

## Fitur
- **Login** (khusus role DINSOS/ADMIN)
- **Verifikasi Yayasan** — setujui pendaftaran yayasan
- **Tinjau Kampanye** — pantau semua kampanye & status
- **Kampanye Beku** — resolve campaign FROZEN (lanjutkan / refund)

## Menjalankan
```bash
npm install
npm run dev      # development, buka http://localhost:5173
npm run build    # build produksi ke folder dist/
npm run preview  # preview hasil build
```

## Konfigurasi
Salin `.env.example` ke `.env` bila perlu ganti base URL API:
```
VITE_API_BASE=https://nextrust.my.id/api
```

## Login
Butuh akun dengan role **DINSOS**. Buat lewat Swagger backend
(`POST /api/auth/register` dengan `"role": "DINSOS"`).

## Struktur
```
src/
├── api/          # client HTTP + helper format
├── context/      # AuthContext, ToastContext
├── components/   # Layout, komponen UI reusable
├── pages/        # Login, Foundations, Campaigns, Frozen
├── App.jsx       # routing + protected routes
└── main.jsx      # entry + providers
```

## Pengembangan selanjutnya
Struktur sudah disiapkan untuk menambah dashboard Yayasan (role FOUNDATION):
tinggal tambah halaman baru di `pages/`, rute di `App.jsx`, dan menu di `Layout.jsx`.
