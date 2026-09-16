import { useState } from 'react'
import {
  Heart,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Info,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
} from 'lucide-react'
import type { BloodGroup, CurrentUser, View } from '../types'
import { BLOOD_GROUPS, DISTRICTS, store, getDonorBadge } from '../store'
import BloodBadge from '../components/BloodBadge'

interface Props {
  user: CurrentUser
  setView: (v: View) => void
  onRegistered: () => void
  onToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void
}

export default function RegisterDonor({ user, setView, onRegistered, onToast }: Props) {
  const existing = store.getDonors().find(d => d.phone === user.phone || d.id === user.id)
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(existing?.bloodGroup ?? 'O+')
  const [district, setDistrict] = useState(existing?.district ?? 'Central District')
  const [email, setEmail] = useState(existing?.email ?? (user.email ?? ''))
  const [lastDonation, setLastDonation] = useState(existing?.lastDonation ? existing.lastDonation.slice(0, 10) : '')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const badge = existing ? getDonorBadge(existing.totalDonations) : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!district) return setError('Please select your residential or work district.')
    setError('')

    const donorData = {
      name: user.name,
      bloodGroup,
      district,
      phone: user.phone,
      email: email.trim() || `${user.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      lastDonation: lastDonation ? new Date(lastDonation).toISOString() : null,
      available: true,
    }

    if (existing) {
      store.updateDonor({ ...existing, ...donorData })
      onToast('success', 'Profile Updated', 'Your donor profile and eligibility details have been updated.')
    } else {
      store.addDonor(donorData)
      onToast('success', 'Welcome Donor!', 'You are now part of the emergency blood donor community!')
    }

    setSaved(true)
    setTimeout(() => {
      onRegistered()
      setView('home')
    }, 1200)
  }

  if (saved) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Heart className="w-10 h-10 fill-emerald-600 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
          {existing ? 'Profile Updated!' : 'Welcome to BloodLink!'}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Your voluntary donor status is active for <strong>{bloodGroup}</strong> blood in <strong>{district}</strong>.
        </p>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-left">
          <p className="font-bold flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Privacy Protected
          </p>
          <p>
            Your contact details remain confidential and are only shared when you accept an emergency blood match.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-rose-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-xl bg-white/20">
            <Heart className="w-5 h-5 text-red-200 fill-red-200" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-red-200">
            Donor Registry
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
          {existing ? 'Update Volunteer Profile' : 'Register as Blood Donor'}
        </h1>
        <p className="text-red-100 text-xs sm:text-sm">
          Join our district lifesaving network. Only receive alerts that match your medical compatibility.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Existing Badge Pill */}
        {badge && (
          <div className="p-4 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: badge.bgLight, borderColor: `${badge.color}40` }}>
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6" style={{ color: badge.color }} />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800">{badge.level} · {badge.title}</span>
                <p className="text-xs text-gray-600">{existing?.totalDonations || 0} lifetime donations recorded</p>
              </div>
            </div>
          </div>
        )}

        {/* Blood Group */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Your Blood Group *
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {BLOOD_GROUPS.map((g) => {
              const isSelected = bloodGroup === g
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setBloodGroup(g)}
                  className={`py-3 rounded-2xl font-black text-sm transition-all flex flex-col items-center justify-center border-2 ${
                    isSelected
                      ? 'bg-red-700 border-red-700 text-white shadow-md shadow-red-200 scale-105'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'
                  }`}
                >
                  <span>{g}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* District */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Your Primary District *
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-red-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone (read only from active user) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Verified Phone Number (Kept Confidential)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={user.phone}
              readOnly
              className="w-full pl-10 pr-4 py-3.5 bg-gray-100 border border-gray-200 rounded-2xl text-sm text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Last Donation Date */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Last Blood Donation Date (If any)
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-red-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={lastDonation}
              onChange={(e) => setLastDonation(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-red-500" /> A 90-day cooldown interval is medically maintained to protect donor stamina.
          </p>
        </div>

        {/* Privacy Note */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> 100% Privacy & Spam Prevention
          </p>
          <p>
            Your phone number is NEVER published publicly. You will receive notification alerts when local requests arise, and you choose when to accept and reveal your contact.
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold rounded-2xl text-sm sm:text-base transition shadow-lg shadow-red-200 flex items-center justify-center gap-2"
        >
          <Heart className="w-5 h-5 fill-white" />
          <span>{existing ? 'Save & Update Profile' : 'Complete Volunteer Registration'}</span>
        </button>
      </form>
    </div>
  )
}
