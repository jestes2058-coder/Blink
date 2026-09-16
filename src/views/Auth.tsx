import { useState } from 'react'
import {
  Heart,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Droplet,
  MapPin,
  CheckCircle2,
  Database,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { BloodGroup, CurrentUser } from '../types'
import { BLOOD_GROUPS, DISTRICTS, store } from '../store'
import { supabase, isSupabaseConfigured } from '../supabase'

interface Props {
  onLogin: (user: CurrentUser) => void
}

export default function Auth({ onLogin }: Props) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  
  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  
  // Sign Up fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isVolunteerDonor, setIsVolunteerDonor] = useState(false)
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+')
  const [district, setDistrict] = useState('Central District')
  
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Handle Sign In
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!signInEmail.trim() || !signInPassword.trim()) {
      return setError('Please enter your email and password.')
    }
    setError('')
    setLoading(true)

    try {
      if (isSupabaseConfigured) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: signInEmail.trim(),
          password: signInPassword,
        })

        if (authError) {
          setError(authError.message)
          setLoading(false)
          return
        }

        if (data.user) {
          // Fetch user profile from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          const currentUser: CurrentUser = {
            id: data.user.id,
            name: profile?.name || data.user.user_metadata?.name || signInEmail.split('@')[0],
            phone: profile?.phone || data.user.phone || '+1-555-0100',
            email: data.user.email,
          }

          store.setCurrentUser(currentUser)
          await store.syncFromSupabase()
          onLogin(currentUser)
          return
        }
      } else {
        // Local mode fallback
        const existingUsers = store.getUsers()
        const user = existingUsers.find(
          u => (u.email && u.email.toLowerCase() === signInEmail.trim().toLowerCase()) || u.phone === signInEmail.trim()
        )

        const currentUser: CurrentUser = user || {
          id: 'usr-' + Math.random().toString(36).slice(2, 8),
          name: signInEmail.split('@')[0],
          phone: '+1-555-0100',
          email: signInEmail.trim(),
        }

        store.setCurrentUser(currentUser)
        onLogin(currentUser)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Sign Up
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Please enter your full name.')
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email address.')
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) return setError('Please enter a valid phone number.')
    if (password.length < 6) return setError('Password must be at least 6 characters long.')
    
    setError('')
    setLoading(true)

    try {
      if (isSupabaseConfigured) {
        // Sign up in Supabase Auth
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              name: name.trim(),
              phone: phone.trim(),
            }
          }
        })

        if (authErr) {
          setError(authErr.message)
          setLoading(false)
          return
        }

        const userId = authData.user?.id || 'usr-' + Math.random().toString(36).slice(2, 8)

        // Save profile in Supabase table
        await supabase.from('profiles').upsert({
          id: userId,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          blood_group: isVolunteerDonor ? bloodGroup : null,
          district: isVolunteerDonor ? district : null,
          is_donor: isVolunteerDonor,
        })

        // If opted to register as a donor, add to donors table
        if (isVolunteerDonor) {
          await store.addDonor({
            name: name.trim(),
            bloodGroup,
            district,
            phone: phone.trim(),
            email: email.trim(),
            lastDonation: null,
            available: true,
          })
        }

        const newUser: CurrentUser = {
          id: userId,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }

        store.setCurrentUser(newUser)
        await store.syncFromSupabase()
        onLogin(newUser)
      } else {
        // Local mode fallback
        const newUser = store.addUser(name.trim(), phone.trim(), email.trim())
        
        if (isVolunteerDonor) {
          await store.addDonor({
            name: name.trim(),
            bloodGroup,
            district,
            phone: phone.trim(),
            email: email.trim(),
            lastDonation: null,
            available: true,
          })
        }

        store.setCurrentUser(newUser)
        onLogin(newUser)
      }
    } catch (err: any) {
      setError(err?.message || 'Sign up failed. Please check inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-red-950 text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight block" style={{ fontFamily: "'DM Serif Display', serif" }}>
              BloodLink
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-200">
              Community Transfusion Network
            </span>
          </div>
        </div>

        {/* Database Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-red-100 border border-white/10">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isSupabaseConfigured ? 'Supabase Cloud Connected' : 'Local Storage Mode'}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left Side Value Props */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-800/80 border border-red-400/30 text-xs font-semibold text-red-100">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Secure Cloud Blood Donor Management</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Save lives in your community with complete privacy.
          </h1>

          <p className="text-red-100 text-sm sm:text-base leading-relaxed">
            Directly connect blood recipients with nearby verified donors in critical medical emergencies without sharing your contact details publicly.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Contact phone numbers stay confidential until you choose to accept a match request.</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <Droplet className="w-5 h-5 text-yellow-300 flex-shrink-0" />
              <span>Automatic blood group compatibility & 90-day medical interval tracking.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card (Sign In / Sign Up) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 text-gray-900 shadow-2xl border border-red-100">
          {/* Tabs */}
          <div className="flex rounded-2xl bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setTab('signin'); setError('') }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                tab === 'signin'
                  ? 'bg-white text-red-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setError('') }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                tab === 'signup'
                  ? 'bg-white text-red-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* SIGN IN FORM */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Email Address or Phone
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="name@example.com or +1-555-0100"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-gray-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('signup'); setError('') }}
                    className="font-bold text-red-700 hover:underline"
                  >
                    Sign up now
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1-555-0100"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Option to register as volunteer donor directly */}
              <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-100 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVolunteerDonor}
                    onChange={(e) => setIsVolunteerDonor(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    I also want to volunteer as a Blood Donor
                  </span>
                </label>

                {isVolunteerDonor && (
                  <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                    <div>
                      <span className="text-gray-500 font-semibold block mb-1">Blood Group</span>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-red-400"
                      >
                        {BLOOD_GROUPS.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-gray-500 font-semibold block mb-1">District</span>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-red-400"
                      >
                        {DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account & Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-gray-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('signin'); setError('') }}
                    className="font-bold text-red-700 hover:underline"
                  >
                    Sign in
                  </button>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-red-200/80 pt-4 border-t border-white/10">
        BloodLink Community Transfusion Network · Verified Supabase Cloud Storage
      </div>
    </div>
  )
}
