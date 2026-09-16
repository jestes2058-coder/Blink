# 🩸 BloodLink — Blood Donor Matching App & Web Portal

> **🌐 Live Production Website & PWA**: [https://bloodlink-app-black.vercel.app](https://bloodlink-app-black.vercel.app)  
> **📦 GitHub Repository**: [https://github.com/jestes2058-coder/Blink](https://github.com/jestes2058-coder/Blink)

A modern, privacy-preserving, district-based emergency blood donor matching application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Vite 8**, and **Supabase Database & Auth**.

---

## 📱 Mobile App & Web Capabilities

- **📱 Installable Mobile App (PWA)**:
  - Add to Home Screen on iOS & Android.
  - Native standalone display without browser address bars.
  - App Icon (`public/icon.svg`) and Web App Manifest (`public/manifest.json`).
  - Mobile bottom navigation bar with active notification counters.
- **🌐 Full Responsive Website**:
  - Multi-column dashboard on desktop & tablets.
  - Interactive blood compatibility matrix, volunteer donor search directory, eligibility quiz, and blood banks directory.
- **🖥️ Interactive Mode Switcher**:
  - Live toggle between **"Full Website"** view and **"Mobile App Simulator"** (renders an iPhone canvas with status bar and notch) to preview both experiences directly on your PC!

---

## ⚡ Supabase Setup (Storing All Data)

All user accounts, profiles, volunteer donors, blood requests, matches, and blood banks are stored in **Supabase**.

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account & project.

### Step 2: Run the Database Schema
1. In your Supabase dashboard, navigate to the **SQL Editor** on the left menu.
2. Open [`supabase_schema.sql`](file:///c:/Users/JESTES/Downloads/Blood%20Donor%20Matching%20App/supabase_schema.sql), copy the content, paste it into the SQL editor, and click **RUN**.
3. This creates all tables (`profiles`, `donors`, `blood_requests`, `blood_banks`) with Row-Level Security (RLS) policies.

### Step 3: Connect Your Supabase Keys
- You can connect your keys with 1-click in the live web app by clicking the **"Setup Cloud Database"** button in the top bar, or add them to `.env`:
  ```env
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-public-key
  ```

---

## 📲 How to Install as a Mobile App

### On iPhone / iPad (iOS Safari)
1. Open [https://bloodlink-app-black.vercel.app](https://bloodlink-app-black.vercel.app) in Safari.
2. Tap the **Share** button (box with an arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**. The BloodLink icon will now appear on your home screen!

### On Android (Chrome / Edge)
1. Open [https://bloodlink-app-black.vercel.app](https://bloodlink-app-black.vercel.app) in Chrome.
2. Tap the **Install App** button on the bottom banner (or tap `⋮` ➔ **"Install App"** / **"Add to Home Screen"**).
3. Tap **Install**.

---

## 🚀 How to Run Locally

```bash
npm install
npm run dev
```
Open `http://localhost:8443` in your browser.
