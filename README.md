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

## 🚀 Getting Started

Follow these steps to run the project locally:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory (you can copy from `.env.example`).
   ```env
   # API Prefix used by Vite Proxy
   VITE_API_BASE=/api
   
   # Target URL of the backend server
   API_TARGET_URL=https://nextrust.my.id
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for Production**
   ```bash
   npm run build
   ```

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
