# 🩸 BloodLink — Supabase Integration & Setup Guide

This guide provides step-by-step instructions on connecting the **BloodLink** Blood Donor Matching application to your **Supabase** backend.

---

## 📋 Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Step 1: Create a Supabase Project](#step-1-create-a-supabase-project)
3. [Step 2: Execute SQL Schema & Policies](#step-2-execute-sql-schema--policies)
4. [Step 3: Enable Supabase Realtime](#step-3-enable-supabase-realtime)
5. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
6. [Step 5: In-App Database Settings (Alternative)](#step-5-in-app-database-settings-alternative)
7. [Step 6: Verify Connection & Sync](#step-6-verify-connection--sync)
8. [Database Schema Reference](#database-schema-reference)
9. [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## 1. Overview & Architecture

BloodLink uses Supabase for:
- **Realtime Donor Matching**: Live broadcast of emergency requests to matched donors in the district.
- **Relational Storage**: Storing verified donors, blood bank inventories, emergency blood requests, and user profiles.
- **Offline Fallback**: Automatic local storage fallback with seamless sync when cloud connection is restored.
- **Row Level Security (RLS)**: Securing sensitive donor contact details while allowing fast emergency lookups.

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and log in or create a free account.
2. Click **New Project**.
3. Choose an organization, enter a **Project Name** (e.g. `bloodlink-app`), set a secure **Database Password**, and select a region closest to your users.
4. Click **Create new project** and wait ~1-2 minutes for provisioning to complete.

---

## Step 2: Execute SQL Schema & Policies

We have provided a complete SQL file: [`supabase_schema.sql`](./supabase_schema.sql).

1. In your Supabase Dashboard, click on **SQL Editor** from the left navigation bar (icon: `>_`).
2. Click **New query**.
3. Copy the entire contents of [`supabase_schema.sql`](./supabase_schema.sql) and paste it into the editor.
4. Click the green **Run** button (or press `Ctrl+Enter` / `Cmd+Enter`).
5. Verify that all tables (`profiles`, `donors`, `blood_requests`, `blood_banks`) and policies are created without errors.

---

## Step 3: Enable Supabase Realtime

To enable instant emergency alerts and live status updates:

1. In the Supabase Dashboard, navigate to **Database** ➔ **Publications** (or **Replication**).
2. Click on the `supabase_realtime` publication.
3. Ensure the toggle is enabled for:
   - `donors`
   - `blood_requests`
   - `blood_banks`
4. Alternatively, running the SQL script [`supabase_schema.sql`](./supabase_schema.sql) already executes:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_requests;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.donors;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_banks;
   ```

---

## Step 4: Configure Environment Variables

1. In your Supabase Dashboard, go to **Project Settings** (gear icon) ➔ **API**.
2. Find:
   - **Project URL** (e.g. `https://xyzprojectid.supabase.co`)
   - **Project API Keys** ➔ `anon` `public` key (e.g. `eyJhbGciOiJIUzI1NiIsInR5cCI...`)
3. In the root directory of this project, create a file named `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```
4. Restart your development server:
   ```bash
   npm run dev
   ```

---

## Step 5: In-App Database Settings (Alternative)

If you are running in production, testing on mobile, or deploying to Vercel/Capacitor without rebuilding:

1. Open the BloodLink app in your browser or simulator.
2. Click the **Connect Database** / **Cloud DB** button in the top status bar.
3. Paste your **Supabase URL** and **Anon Key**.
4. Click **Save & Connect**. BloodLink will validate the connection and sync all local records to your Supabase tables.

---

## Step 6: Verify Connection & Sync

1. Open the app and navigate to **Request Blood** or click **Emergency SOS**.
2. Submit a test emergency blood request.
3. Go to Supabase Dashboard ➔ **Table Editor** ➔ `blood_requests`.
4. You should immediately see the newly submitted request record with its matched donors!
5. Open another browser window or mobile simulator to verify realtime alert synchronization.

---

## Database Schema Reference

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| `public.profiles` | User profiles & preferences | `id` (UUID), `name`, `email`, `phone`, `blood_group`, `district` |
| `public.donors` | Active volunteer blood donors | `id`, `name`, `blood_group`, `district`, `phone`, `last_donation`, `total_donations`, `available` |
| `public.blood_requests` | Urgent & emergency requests | `id`, `requestor_name`, `patient_name`, `blood_group`, `district`, `urgency`, `hospital`, `matches` |
| `public.blood_banks` | Verified blood banks & stocks | `id`, `name`, `district`, `address`, `phone`, `timing`, `is_emergency_24x7`, `available_stock` |

---

## Troubleshooting & FAQs

### 1. `VITE_SUPABASE_URL` is undefined or not connecting
- Make sure the variable is prefixed with `VITE_`. Vite only exposes environment variables prefixed with `VITE_` to client-side code.
- Always restart the Vite dev server after modifying `.env`.

### 2. Row-Level Security (RLS) blocking inserts
- Ensure you ran the RLS policy block in `supabase_schema.sql`. The policies allow anon users to query donors and broadcast emergency requests while maintaining district security.

### 3. Realtime notifications not firing
- Confirm that `blood_requests` is added to the `supabase_realtime` publication in Supabase Dashboard ➔ Database ➔ Replication.
