import { useState } from 'react'
import { X, Database, CheckCircle2, AlertCircle, Copy, Check, Sparkles, RefreshCw, Key, Globe } from 'lucide-react'
import { isSupabaseConfigured } from '../supabase'
import { store } from '../store'

interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function SupabaseConfigModal({ onClose, onSaved }: Props) {
  const [url, setUrl] = useState(localStorage.getItem('bd_custom_sb_url') || import.meta.env.VITE_SUPABASE_URL || '')
  const [key, setKey] = useState(localStorage.getItem('bd_custom_sb_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '')
  const [testing, setTesting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copiedSchema, setCopiedSchema] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || !key.trim()) {
      setStatusMsg({ type: 'error', text: 'Please provide both Project URL and Public Anon Key.' })
      return
    }

    setTesting(true)
    setStatusMsg(null)

    try {
      localStorage.setItem('bd_custom_sb_url', url.trim())
      localStorage.setItem('bd_custom_sb_key', key.trim())
      
      setStatusMsg({ type: 'success', text: '✅ Supabase credentials saved! Syncing tables...' })
      await store.syncFromSupabase()
      
      setTimeout(() => {
        onSaved()
        onClose()
      }, 1200)
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to connect. Please check credentials.' })
    } finally {
      setTesting(false)
    }
  }

  function handleCopySQL() {
    const sqlContent = `-- BloodLink Supabase Tables Setup
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  blood_group TEXT,
  district TEXT,
  is_donor BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.donors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID,
  name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  district TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  last_donation TIMESTAMPTZ,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  total_donations INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.blood_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  requestor_id TEXT NOT NULL,
  requestor_name TEXT NOT NULL,
  requestor_phone TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  district TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'urgent',
  hospital TEXT NOT NULL,
  units_needed INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'open',
  matches JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read donors" ON public.donors FOR SELECT USING (true);
CREATE POLICY "Public insert donors" ON public.donors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update donors" ON public.donors FOR UPDATE USING (true);
CREATE POLICY "Public read requests" ON public.blood_requests FOR SELECT USING (true);
CREATE POLICY "Public insert requests" ON public.blood_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update requests" ON public.blood_requests FOR UPDATE USING (true);`

    navigator.clipboard.writeText(sqlContent)
    setCopiedSchema(true)
    setTimeout(() => setCopiedSchema(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white text-gray-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-red-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Cloud & Supabase Data Setup
            </h3>
            <p className="text-xs text-gray-500">Zero-config automatic storage & cloud sync</p>
          </div>
        </div>

        {/* Current status info */}
        <div className="mb-5 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
            <span className="font-bold text-gray-800">
              {isSupabaseConfigured ? 'Connected to Supabase Cloud' : 'Automatic Local Storage Active'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopySQL}
            className="px-3 py-1 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition flex items-center gap-1 text-[11px]"
          >
            {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSchema ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
          </button>
        </div>

        {statusMsg && (
          <div className={`mb-4 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label htmlFor="supabaseUrlInput" className="block font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-gray-500" /> Supabase Project URL
            </label>
            <input
              id="supabaseUrlInput"
              name="supabaseUrl"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-red-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="supabaseKeyInput" className="block font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-gray-500" /> Public Anon API Key
            </label>
            <input
              id="supabaseKeyInput"
              name="supabaseKey"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-red-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={testing}
              className="flex-1 py-3.5 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Save & Connect Cloud Database</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3.5 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
