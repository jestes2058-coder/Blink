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

        await supabase.from('profiles').upsert({
          id: userId,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          blood_group: isVolunteerDonor ? bloodGroup : null,
          district: isVolunteerDonor ? district : null,
          is_donor: isVolunteerDonor,
        })

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
    <div className="min-h-full w-full bg-gradient-to-br from-red-950 via-red-900 to-red-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md flex-shrink-0">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight block leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
              BloodLink
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-red-200 block">
              Transfusion Match
            </span>
          </div>
        </div>

        {/* Database Status indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-red-100 border border-white/10">
          <Database className="w-3 h-3 text-emerald-400" />
          <span className="hidden sm:inline">{isSupabaseConfigured ? 'Supabase Connected' : 'Auto Storage'}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto my-auto py-4 flex flex-col items-center justify-center">
        {/* Mobile Header Intro */}
        <div className="text-center mb-6 max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-800/80 border border-red-400/30 text-[11px] font-semibold text-red-100 mb-2">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span>Emergency Blood Matching</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Save lives with complete privacy.
          </h1>
          <p className="text-xs text-red-100 mt-1 max-w-xs mx-auto">
            Connect patients with local verified donors in urgent hospital emergencies.
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-7 text-gray-900 shadow-2xl border border-red-100">
          {/* Tabs */}
          <div className="flex rounded-2xl bg-gray-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => { setTab('signin'); setError('') }}
              className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition ${
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
              className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition ${
                tab === 'signup'
                  ? 'bg-white text-red-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* SIGN IN FORM */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
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
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-gray-500">
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
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Option to register as volunteer donor directly */}
              <div className="p-3 rounded-2xl bg-red-50/60 border border-red-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVolunteerDonor}
                    onChange={(e) => setIsVolunteerDonor(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    Register me as a Volunteer Donor
                  </span>
                </label>

                {isVolunteerDonor && (
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div>
                      <span className="text-gray-500 text-[10px] font-semibold block mb-0.5">Blood Type</span>
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
                      <span className="text-gray-500 text-[10px] font-semibold block mb-0.5">District</span>
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
                className="w-full py-3 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating account...' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <span className="text-[11px] text-gray-500">
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
      <div className="w-full max-w-4xl mx-auto text-center text-[11px] text-red-200/80 pt-3 border-t border-white/10">
        BloodLink Community Transfusion Network
      </div>
    </div>
  )
}
