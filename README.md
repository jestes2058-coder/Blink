# 🩸 BloodLink — Blood Donor Matching App & Web Portal

A modern, privacy-preserving, district-based emergency blood donor matching application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Vite 8**, and **Supabase Database & Auth**.

---

## ⚡ Supabase Setup (Storing All Data)

All user accounts, profiles, volunteer donors, blood requests, matches, and blood banks are stored in **Supabase**.

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account & project.

### Step 2: Run the Database Schema
1. In your Supabase dashboard, navigate to the **SQL Editor** on the left menu.
2. Open [`supabase_schema.sql`](file:///c:/Users/JESTES/Downloads/Blood%20Donor%20Matching%20App/supabase_schema.sql) from this repository, copy the entire content, paste it into the SQL editor, and click **RUN**.
3. This creates all tables:
   - `profiles`
   - `donors`
   - `blood_requests`
   - `blood_banks`
   - Row-Level Security (RLS) policies

### Step 3: Connect Your Supabase Keys
1. In your Supabase dashboard, go to **Project Settings** ➔ **API**.
2. Copy your **Project URL** and **`anon` `public` Key**.
3. Create a `.env` file in your project root (or copy from [`.env.example`](file:///c:/Users/JESTES/Downloads/Blood%20Donor%20Matching%20App/.env.example)):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Restart your development server (`npm run dev`). The app will show **"Supabase Cloud Connected"**!

---

## 🔐 Sign In & Sign Up Authentication

- **Sign In Tab**: Log in using your registered email and password.
- **Create Account Tab**: Register with your full name, email, phone number, and password.
- **Direct Donor Registration**: Option during signup to join as an active volunteer donor (select your blood group & district).

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

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:8443` (or the port displayed in your terminal).

### 3. Test Production Build Locally
```bash
npm run build
npm run preview
```

---

## 🌐 How to Deploy to Vercel

### Option 1: Deploy via Vercel Web Dashboard (Recommended)

1. Push this project to your **GitHub** / **GitLab** / **Bitbucket** repository:
   ```bash
   git init
   git add .
   git commit -m "feat: BloodLink with Supabase authentication and storage"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and log in.
3. Import your repository.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
5. Click **"Deploy"**.

---

### Option 2: Deploy via Vercel CLI

```bash
npx vercel
# For production:
npx vercel --prod
```
