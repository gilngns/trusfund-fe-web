# TrustFund (NexTrust) — Web Dashboard

A modern, responsive, and secure web dashboard for the **TrustFund** (NexTrust) ecosystem. Built with **React, Vite, and Tailwind CSS**.

## 🌟 Key Features

This dashboard supports multiple roles out of the box, offering specialized views for different actors in the ecosystem.

### 🏛️ Role DINSOS (Dinas Sosial)
- **Dashboard Overview** — At-a-glance metrics of the entire donation ecosystem.
- **Verifikasi Yayasan** — Review, approve, or reject foundation registrations.
- **Pantau Kampanye** — Monitor all ongoing campaigns and track milestones.
- **Penanganan Kasus** — Resolve flagged or `FROZEN` campaigns (investigate and refund/continue).

### 🏢 Role YAYASAN (Foundation)
- **Manajemen Kampanye** — Create new donation campaigns and track their progress.
- **AI-Assisted RAB** — Automatically generate and validate Rencana Anggaran Biaya (RAB) with AI scoring.
- **Donasi & Transaksi** — Monitor all inbound donations, transactions, and fund disbursements in real-time.
- **Pencairan Dana (Payouts)** — Request and track fund withdrawals for campaign execution.
- **Penerima Manfaat** — Manage individuals and institutions receiving aid.

## 🛠️ Tech Stack
- **Frontend Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Map**: Pigeon Maps

## 📂 Project Structure

```text
src/
├── api/          # API client (fetch wrapper) & formatting utilities
├── context/      # React Context (e.g., AuthContext)
├── layouts/      # Dashboard layouts (DinsosLayout, YayasanLayout, AuthLayout)
├── pages/        #
│   ├── auth/     # Login, Register, & KYC pages
│   ├── dinsos/   # DINSOS role pages
│   └── yayasan/  # FOUNDATION role pages
├── App.jsx       # Routing & Protected Routes Configuration
└── main.jsx      # React entry point
```

## 🔒 Security Notes
- **API Proxy**: In development, API requests are proxied via Vite (`vite.config.js`) to hide the target backend URL from the frontend source code.
- **Environment Variables**: The `.env` file contains sensitive routing information and is excluded from source control (`.gitignore`).
