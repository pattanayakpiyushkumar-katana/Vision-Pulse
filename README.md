# VisionPulse AI — Full-Stack Multimodal Visual Intelligence

VisionPulse AI is an enterprise-grade Computer Vision & Visual Intelligence platform built with **React (Vite)**, **Node.js/Express**, **Supabase (PostgreSQL + Storage)**, **Render**, and **Google Gemini 2.5 Flash Vision**.

---

## 🏛️ 3 Separate Isolated Systems

The repository is organized into three distinct, decoupled sub-systems:

```
c:\New folder\
├── client/                     # SYSTEM 1: Frontend Application (Configured for VERCEL)
│   ├── .env                    # Client environment (Vite API base URL & Supabase Anon Key)
│   ├── .env.example
│   ├── vercel.json             # Vercel deployment & SPA rewrite routing
│   └── src/
│       ├── config/supabaseClient.js # Direct Supabase Client (Anon Key)
│       └── ...
│
├── server/                     # SYSTEM 2: Core REST API Server & Multimodal AI Engine
│   ├── .env                    # Server environment (JWT, Gemini API key, Postgres)
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/supabaseClient.js
│       ├── services/geminiVisionService.js
│       └── ...
│
└── backend/                    # SYSTEM 3: Dedicated Backend (SUPABASE + RENDER Cloud)
    ├── .env                    # Full Supabase Credentials & Render config
    ├── .env.example
    ├── render.yaml             # Official Render Blueprint Specification
    ├── Dockerfile              # Container deployment for Render
    ├── supabase/
    │   └── schema.sql          # Supabase SQL Editor migration script with RLS
    ├── package.json
    └── src/
        ├── config/supabaseClient.js # Supabase Admin (Service Role) + Client (Anon)
        ├── services/supabaseStorageService.js # Supabase 'inspection-assets' bucket manager
        ├── routes/supabaseRoutes.js # /api/supabase/status endpoint
        └── index.js            # Render production server with /health probe
```

---

## ⚡ Deployment & Linking Matrix

| System | Target Cloud Platform | Connection Target | Configuration Files |
|---|---|---|---|
| **`client/`** | **Vercel** | Connects to Render Backend & Supabase Public API | `client/vercel.json`, `client/.env` |
| **`backend/`** | **Render** | Connects to Supabase Database & Supabase Storage | `backend/render.yaml`, `backend/Dockerfile`, `backend/.env` |
| **`server/`** | **Local / Container** | REST API & Gemini Vision Gateway | `server/.env`, `server/package.json` |

---

## 🔑 Environment Variables Reference

### 1. Backend Service (`backend/.env` — Supabase + Render)
```env
PORT=5000
NODE_ENV=development
RENDER=false

# Supabase PostgreSQL Connection URL (Found in: Project Settings -> Database -> Connection string)
DATABASE_URL=postgresql://postgres.[project-ref]:[db-password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require

# Supabase API Credentials (Found in: Project Settings -> API)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Security & Tokens
JWT_SECRET=visionpulse_super_secret_jwt_key_2026_production_grade_random_bytes_x981

# Google Gemini Vision Key (https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_google_ai_studio_gemini_api_key

# CORS Whitelist for Vercel Frontend
CLIENT_URL=http://localhost:5173
VERCEL_URL=https://your-visionpulse-app.vercel.app
```

### 2. Client Application (`client/.env` — Vercel)
```env
# Backend API Base URL (Render Cloud Service URL in production)
VITE_API_BASE_URL=http://localhost:5000/api

# Supabase Public Client Credentials (Anon Key)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/visionpulse
JWT_SECRET=visionpulse_super_secret_jwt_key_2026_production_grade_random_bytes_x981
GEMINI_API_KEY=your_google_ai_studio_gemini_api_key
CLIENT_URL=http://localhost:5173
```

---

## 🗄️ Setting Up Supabase Database & Storage

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project, click **SQL Editor** on the left menu, and create a **New Query**.
3. Open the migration file [`backend/supabase/schema.sql`](file:///C:/New%20folder/backend/supabase/schema.sql) in this repository and paste its entire contents into the SQL Editor.
4. Click **Run**. This will automatically:
   - Enable `pgcrypto` and `uuid-ossp`.
   - Provision `users`, `inspection_sites`, `visual_inspections`, and `detected_anomalies` tables.
   - Configure the public `inspection-assets` Supabase Storage bucket.
   - Set up Row Level Security (RLS) policies for both `service_role` and `anon` keys.
5. In **Project Settings -> Database**, copy the **URI (Connection Pooler, port 6543)** and paste it as `DATABASE_URL` in `backend/.env`.
6. In **Project Settings -> API**, copy:
   - **Project URL** -> `SUPABASE_URL`
   - **Project API keys: `anon` (public)** -> `SUPABASE_ANON_KEY`
   - **Project API keys: `service_role` (secret)** -> `SUPABASE_SERVICE_ROLE_KEY`

---

## 🚀 Deployment Instructions

### Deploying the Backend to Render:
1. Push this repository to GitHub or GitLab.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
3. Select your repository. Render will automatically detect [`backend/render.yaml`](file:///C:/New%20folder/backend/render.yaml) and configure the `visionpulse-backend` service.
4. Fill in your environment variables (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`).
5. Render deploys your backend with automatic health checks on `/health` and `/api/health`.

### Deploying the Client to Vercel:
1. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** -> **Project**.
2. Select your repository. Set the **Root Directory** to `client`.
3. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://visionpulse-backend.onrender.com/api` (your Render backend URL)
   - `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your_supabase_anon_key`
4. Click **Deploy**. [`client/vercel.json`](file:///C:/New%20folder/client/vercel.json) handles SPA client routing automatically.

---

## 🏃 Local Development

Run any of the systems locally with ease:

```bash
# Run Frontend Client (Vercel target) on http://localhost:5173
npm run dev:client

# Run Backend (Render + Supabase target) on http://localhost:5000
npm run dev:backend

# Run Core Server on http://localhost:5000
npm run dev:server
```
