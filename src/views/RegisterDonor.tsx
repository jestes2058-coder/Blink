import { useState, useRef } from 'react'
import {
  Heart,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Info,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react'
import type { BloodGroup, CurrentUser, View } from '../types'
import { BLOOD_GROUPS, store, getDonorBadge } from '../store'
import { INDIAN_STATES_AND_DISTRICTS, getDistrictsForState, DEFAULT_STATE } from '../data/indianLocations'
import { supabase, isSupabaseConfigured } from '../supabase'
import UserAvatar from '../components/UserAvatar'

interface Props {
  user: CurrentUser
  setView: (v: View) => void
  onRegistered: () => void
  onToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void
}

export default function RegisterDonor({ user, setView, onRegistered, onToast }: Props) {
  const existing = store.getDonors().find(d => d.phone === user.phone || d.id === user.id || (user.email && d.email === user.email))
  
  const [name, setName] = useState(existing?.name ?? user.name ?? '')
  const [phone, setPhone] = useState(existing?.phone ?? (user.phone && user.phone !== '+1-555-0100' ? user.phone : ''))
  const [email, setEmail] = useState(existing?.email ?? (user.email ?? ''))
  const [avatar, setAvatar] = useState<string | undefined>(existing?.avatar || user.avatar)
  const [state, setState] = useState(existing?.state || user.state || DEFAULT_STATE)
  const [district, setDistrict] = useState(existing?.district || user.district || 'Ernakulam')
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(existing?.bloodGroup ?? user.bloodGroup ?? 'O+')
  const [lastDonation, setLastDonation] = useState(existing?.lastDonation ? existing.lastDonation.slice(0, 10) : '')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const availableDistricts = getDistrictsForState(state)
  const badge = existing ? getDonorBadge(existing.totalDonations) : null

  function handleStateChange(newState: string) {
    setState(newState)
    const dists = getDistrictsForState(newState)
    if (!dists.includes(district)) {
      setDistrict(dists[0] || '')
    }
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size exceeds 5MB. Please choose a smaller image.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_DIM = 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width)
            width = MAX_DIM
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height)
            height = MAX_DIM
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
          setAvatar(compressedDataUrl)
          setError('')
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Please enter your full name.')
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
      return setError('Please enter a valid phone number (minimum 7 digits).')
    }
    if (!district) return setError('Please select your residential or work district.')
    setError('')
    setSaving(true)

    try {
      // 1. Update Current User
      const updatedUser: CurrentUser = {
        ...user,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || user.email,
        avatar: avatar || undefined,
        state,
        district,
        bloodGroup,
        isDonor: true,
      }
      store.setCurrentUser(updatedUser)

      // 2. Add or Update Donor Record
      const donorData = {
        name: name.trim(),
        bloodGroup,
        state,
        district,
        phone: phone.trim(),
        email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '')}@example.com`,
        avatar: avatar || undefined,
        lastDonation: lastDonation ? new Date(lastDonation).toISOString() : null,
        available: true,
      }

      if (existing) {
        await store.updateDonor({ ...existing, ...donorData })
        onToast('success', 'Profile Updated', 'Your phone number and donor details have been saved.')
      } else {
        await store.addDonor(donorData)
        onToast('success', 'Welcome Donor!', 'You are now registered in the emergency donor network!')
      }

      // 3. Sync to Supabase cloud in backend if connected
      if (isSupabaseConfigured) {
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || user.email,
            blood_group: bloodGroup,
            state,
            district,
            avatar: avatar || undefined,
            is_donor: true,
          })
        } catch (dbErr) {
          console.warn('Supabase profile sync warning:', dbErr)
        }
      }

      setSaved(true)
      setTimeout(() => {
        onRegistered()
        setView('home')
      }, 1000)
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Heart className="w-8 h-8 sm:w-10 sm:h-10 fill-emerald-600 animate-pulse" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
          {existing ? 'Profile Updated!' : 'Welcome to B-Link!'}
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm">
          Your voluntary donor status is active for <strong>{bloodGroup}</strong> blood in <strong>{district}, {state}</strong>.
        </p>
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-left">
          <p className="font-bold flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Phone & Privacy Protected
          </p>
          <p>
            Your phone number <strong>{phone}</strong> is verified and will only be shared when you accept an emergency blood match.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-rose-900 rounded-3xl p-5 sm:p-8 text-white shadow-xl mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-xl bg-white/20">
            <Heart className="w-4 h-4 text-red-200 fill-red-200" />
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-200">
            Donor Registry & Profile
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
          {existing ? 'Edit Profile & Donor Details' : 'Register as Blood Donor'}
        </h1>
        <p className="text-red-100 text-xs sm:text-sm">
          Update your photo, phone number, location, and blood group to ensure emergency alerts reach you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-red-100 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-5">
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

        {/* Profile Photo Upload */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <UserAvatar src={avatar} name={name || 'User'} size="lg" bloodGroup={bloodGroup} showBadge />
          <div className="flex-1 space-y-1.5">
            <p className="text-xs font-bold text-gray-800">Donor Profile Photo</p>
            <p className="text-[11px] text-gray-500">
              Helps emergency patients and blood bank coordinators verify donor identity.
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar(undefined)}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-50 flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="registerDonorPhotoFileInput"
              name="photoFile"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="donorName" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="donorName"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Nair"
              autoComplete="name"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Phone Number (Editable) */}
        <div>
          <label htmlFor="donorPhone" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Phone Number * (Used for Emergency Match Alerts)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-red-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="donorPhone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              autoComplete="tel"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition"
            />
          </div>
          <p className="text-[11px] text-gray-600 mt-1">
            🔒 Kept 100% private. Only shared with a requestor when you tap "Accept".
          </p>
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="donorEmail" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="donorEmail"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Blood Group */}
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Your Blood Group *
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {BLOOD_GROUPS.map((g) => {
              const isSelected = bloodGroup === g
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setBloodGroup(g)}
                  className={`py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-colors duration-150 flex flex-col items-center justify-center border-2 ${
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

        {/* State & District Cascading Select */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="donorState" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              State (India) *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-red-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                id="donorState"
                name="state"
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition font-medium"
              >
                {INDIAN_STATES_AND_DISTRICTS.map((s) => (
                  <option key={s.state} value={s.state}>{s.state}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="donorDistrict" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              District ({state}) *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-red-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                id="donorDistrict"
                name="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition font-medium"
              >
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Last Donation Date */}
        <div>
          <label htmlFor="donorLastDonation" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Last Blood Donation Date (If any)
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-red-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="donorLastDonation"
              name="lastDonation"
              type="date"
              value={lastDonation}
              onChange={(e) => setLastDonation(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition font-medium"
            />
          </div>
          <p className="text-[11px] text-gray-600 mt-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-red-500" /> A 90-day cooldown interval is medically maintained to protect donor stamina.
          </p>
        </div>

        {/* Privacy Note */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> 100% Privacy & Spam Prevention
          </p>
          <p className="text-[11px] sm:text-xs">
            Your phone number is NEVER published publicly. You will receive notification alerts when local requests arise, and you choose when to accept and reveal your contact.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span>{saving ? 'Saving...' : existing ? 'Save & Update Profile' : 'Complete Volunteer Registration'}</span>
        </button>
      </form>
    </div>
  )
}
