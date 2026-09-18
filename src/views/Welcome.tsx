import { useState } from 'react'
import { Heart, Phone, User, Droplet, ShieldCheck, Sparkles, ArrowRight, Zap, Users } from 'lucide-react'
import type { CurrentUser, View } from '../types'
import { DEMO_USERS, store } from '../store'

interface Props {
  onLogin: (user: CurrentUser) => void
  setView: (v: View) => void
}

export default function Welcome({ onLogin }: Props) {
  const [mode, setMode] = useState<'pick' | 'new' | 'returning'>('pick')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  const users = store.getUsers()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return setError('Please enter both name and phone number.')
    if (phone.replace(/\D/g, '').length < 7) return setError('Please enter a valid phone number (minimum 7 digits).')
    
    const existing = users.find(u => u.phone === phone.trim())
    if (existing) {
      store.setCurrentUser(existing)
      onLogin(existing)
      return
    }

    const user = store.addUser(name.trim(), phone.trim())
    store.setCurrentUser(user)
    onLogin(user)
  }

  function handleSelect(user: CurrentUser) {
    store.setCurrentUser(user)
    onLogin(user)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-red-800 text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Brand Header */}
      <div className="max-w-4xl mx-auto w-full pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight block" style={{ fontFamily: "'DM Serif Display', serif" }}>
              B-Link
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-200">
              Community Transfusion Match
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-red-100 border border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Privacy-Preserving Matching</span>
        </div>
      </div>

      {/* Hero Content & Login Cards */}
      <div className="max-w-4xl mx-auto w-full py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left Value Prop */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-800/80 border border-red-400/30 text-xs font-semibold text-red-100">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Fast, Verified District Matches</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Connecting the right donor to the right patient.
          </h1>

          <p className="text-red-100 text-sm sm:text-base leading-relaxed">
            Intelligent district-based matching without community group spam. Protect your contact privacy while saving lives in critical emergencies.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-red-200 font-bold block">100% Volunteer Network</span>
              <span className="text-white/80">Zero fees, pure community aid</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-red-200 font-bold block">Smart Interval Check</span>
              <span className="text-white/80">90-day medical cooldown enforced</span>
            </div>
          </div>
        </div>

        {/* Right Interaction Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 text-gray-900 shadow-2xl border border-red-100">
          {mode === 'pick' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  Get Started
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Choose a demo persona or create your custom profile.
                </p>
              </div>

              {/* Quick Persona Demo Selector */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700 mb-2.5">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>1-Click Test Persona Logins:</span>
                </div>

                <div className="space-y-2">
                  {DEMO_USERS.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => handleSelect(demo)}
                      className="w-full p-3.5 rounded-2xl border border-red-100 hover:border-red-400 bg-red-50/40 hover:bg-red-50 transition text-left flex items-center justify-between group active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-700 text-white font-black text-sm flex items-center justify-center shadow-sm">
                          {demo.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-gray-900 group-hover:text-red-800 transition">
                            {demo.name}
                          </span>
                          <span className="block text-[11px] text-gray-500">{demo.roleDesc}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-700 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2.5">
                <button
                  onClick={() => setMode('new')}
                  className="w-full py-3.5 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-200 transition"
                >
                  Create Custom User Profile
                </button>

                {users.length > 0 && (
                  <button
                    onClick={() => setMode('returning')}
                    className="w-full py-3 border-2 border-gray-200 hover:border-red-300 text-gray-700 font-bold text-xs rounded-2xl transition"
                  >
                    Select From Existing Stored Users ({users.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === 'new' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <button
                type="button"
                onClick={() => { setMode('pick'); setError('') }}
                className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1"
              >
                ← Back to Personas
              </button>

              <div>
                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  Create Custom Profile
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sign in or register to request blood and volunteer as a donor.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="welcomeName" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="welcomeName"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    autoComplete="name"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="welcomePhone" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="welcomePhone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-200 transition"
              >
                Continue to Dashboard
              </button>
            </form>
          )}

          {mode === 'returning' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => { setMode('pick'); setError('') }}
                className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1"
              >
                ← Back to Personas
              </button>

              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Select User Profile
              </h2>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelect(u)}
                    className="w-full p-3 rounded-2xl border border-gray-100 hover:border-red-300 hover:bg-red-50/50 transition text-left flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-sm text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.phone}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-red-200/80 pt-6 border-t border-white/10">
        B-Link Community Transfusion Network · Free, Privacy-Preserving Blood Donor Matching
      </div>
    </div>
  )
}
