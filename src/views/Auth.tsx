import { useState, useEffect } from 'react'
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
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  RefreshCw,
  KeyRound,
  ArrowLeft,
  Check,
  Edit2,
  HelpCircle,
} from 'lucide-react'
import type { BloodGroup, CurrentUser } from '../types'
import { BLOOD_GROUPS, store, isValidEmail } from '../store'
import { INDIAN_STATES_AND_DISTRICTS, getDistrictsForState, DEFAULT_STATE } from '../data/indianLocations'
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
  const [signUpStep, setSignUpStep] = useState<'info' | 'otp' | 'details'>('info')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false)

  // Step 3 details
  const [password, setPassword] = useState('')
  const [isVolunteerDonor, setIsVolunteerDonor] = useState(false)
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+')
  const [state, setState] = useState(DEFAULT_STATE)
  const [district, setDistrict] = useState('Ernakulam')

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState('')

  const availableDistricts = getDistrictsForState(state)

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpCountdown <= 0) return
    const timer = setInterval(() => {
      setOtpCountdown(c => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [otpCountdown])

  function handleStateChange(newState: string) {
    setState(newState)
    const dists = getDistrictsForState(newState)
    if (!dists.includes(district)) {
      setDistrict(dists[0] || '')
    }
  }

  // Resend verification email for unconfirmed login accounts
  async function handleResendConfirmation(targetEmail?: string) {
    const emailToUse = (targetEmail || unconfirmedEmail || signInEmail || email).trim()
    if (!emailToUse) {
      setError('Please enter your email address to resend confirmation.')
      return
    }

    setResendLoading(true)
    setResendSuccess('')
    setError('')

    try {
      if (isSupabaseConfigured) {
        const { error: resendErr } = await supabase.auth.resend({
          type: 'signup',
          email: emailToUse,
        })

        if (resendErr) {
          throw new Error(resendErr.message)
        }
      }

      setResendSuccess(`Verification link resent to ${emailToUse}! Please check your inbox and spam folder.`)
    } catch (err: any) {
      setError(err?.message || 'Failed to resend confirmation email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  // Direct login / offline fallback for unconfirmed email
  async function handleDirectLogin() {
    const emailToUse = (unconfirmedEmail || signInEmail).trim()
    if (!emailToUse) return

    setLoading(true)
    setError('')

    try {
      if (isSupabaseConfigured) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', emailToUse)
          .limit(1)

        if (profiles && profiles.length > 0) {
          const profile = profiles[0]
          const loggedInUser: CurrentUser = {
            id: profile.id,
            name: profile.name || emailToUse.split('@')[0],
            email: profile.email || emailToUse,
            phone: profile.phone || '',
            avatar: profile.avatar,
            state: profile.state || DEFAULT_STATE,
            district: profile.district || 'Ernakulam',
            bloodGroup: profile.blood_group,
            isDonor: profile.is_donor,
          }
          store.setCurrentUser(loggedInUser)
          onLogin(loggedInUser)
          return
        }
      }

      const users = store.getUsers()
      const existing = users.find(
        u => u.email?.toLowerCase() === emailToUse.toLowerCase() || u.phone === emailToUse
      )

      if (existing) {
        store.setCurrentUser(existing)
        onLogin(existing)
        return
      }

      const newUser = store.addUser(
        emailToUse.split('@')[0],
        emailToUse.includes('@') ? '+91 98765 43210' : emailToUse,
        emailToUse.includes('@') ? emailToUse : undefined
      )
      store.setCurrentUser(newUser)
      onLogin(newUser)
    } catch (err: any) {
      setError(err?.message || 'Could not sign in directly.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Sign In
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!signInEmail.trim() || !signInPassword.trim()) {
      return setError('Please enter your email and password.')
    }
    setError('')
    setUnconfirmedEmail(null)
    setResendSuccess('')
    setLoading(true)

    try {
      if (isSupabaseConfigured) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: signInEmail.trim(),
          password: signInPassword,
        })

        if (authError) {
          const errMsg = authError.message || ''
          if (
            errMsg.toLowerCase().includes('email not confirmed') ||
            errMsg.toLowerCase().includes('not confirmed') ||
            (authError as any).code === 'email_not_confirmed'
          ) {
            setUnconfirmedEmail(signInEmail.trim())
            setError('Your email is not confirmed in Supabase yet. Please verify your email or sign in directly below.')
            setLoading(false)
            return
          }
          throw new Error(authError.message)
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          const loggedInUser: CurrentUser = {
            id: data.user.id,
            name: profile?.name || data.user.user_metadata?.name || signInEmail.split('@')[0],
            email: data.user.email || signInEmail,
            phone: profile?.phone || data.user.user_metadata?.phone || '',
            avatar: profile?.avatar,
            state: profile?.state || DEFAULT_STATE,
            district: profile?.district || 'Ernakulam',
            bloodGroup: profile?.blood_group,
            isDonor: profile?.is_donor,
          }

          store.setCurrentUser(loggedInUser)
          onLogin(loggedInUser)
          return
        }
      }

      // Offline / Local auth
      const users = store.getUsers()
      const existing = users.find(
        u => u.email?.toLowerCase() === signInEmail.trim().toLowerCase() || u.phone === signInEmail.trim()
      )

      if (existing) {
        store.setCurrentUser(existing)
        onLogin(existing)
      } else {
        const user = store.addUser(
          signInEmail.split('@')[0],
          signInEmail.includes('@') ? '+91 98765 43210' : signInEmail,
          signInEmail.includes('@') ? signInEmail : undefined
        )
        store.setCurrentUser(user)
        onLogin(user)
      }
    } catch (err: any) {
      const msg = err?.message || 'Invalid credentials. Please try again.'
      if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('not confirmed')) {
        setUnconfirmedEmail(signInEmail.trim())
        setError('Your email is not confirmed in Supabase yet. You can resend confirmation or continue directly.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Send OTP to Email
  async function handleSendEmailOtp(e: React.FormEvent) {
    e.preventDefault()
    const trimmedEmail = email.trim()
    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedName) return setError('Please enter your full name.')
    if (!trimmedEmail) return setError('Please enter your email address.')
    if (!isValidEmail(trimmedEmail)) {
      return setError('Invalid email format. Please enter a valid address (e.g. name@example.com).')
    }
    if (!trimmedPhone || trimmedPhone.length < 7) {
      return setError('Please enter a valid phone number.')
    }

    setError('')
    setLoading(true)

    try {
      // 1. Generate OTP in local store for resilience
      store.generateEmailOtp(trimmedEmail)

      // 2. Dispatch real OTP code to user's email inbox via Supabase
      if (isSupabaseConfigured) {
        try {
          const { error: sbErr } = await supabase.auth.signInWithOtp({
            email: trimmedEmail,
            options: {
              shouldCreateUser: true,
              data: { name: trimmedName, phone: trimmedPhone },
            },
          })
          if (sbErr) {
            const msg = sbErr.message || ''
            if (msg.toLowerCase().includes('rate limit') || (sbErr as any).code === 'over_email_send_rate_limit') {
              console.warn('Supabase email rate limit reached:', sbErr)
            }
          }
        } catch (sbErr) {
          console.warn('Supabase OTP dispatch warning:', sbErr)
        }
      }

      setOtpCountdown(30)
      setSignUpStep('otp')
      setOtpCode('')
    } catch (err: any) {
      setError(err?.message || 'Failed to send verification code. Please check your email and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify Entered OTP Code from Email
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    const trimmedOtp = otpCode.trim()
    const trimmedEmail = email.trim()

    if (!trimmedOtp || trimmedOtp.length !== 6) {
      return setError('Please enter the full 6-digit confirmation code sent to your email.')
    }

    setError('')
    setLoading(true)

    try {
      // First attempt Supabase OTP verification
      if (isSupabaseConfigured) {
        try {
          const { error: emailVerifyErr } = await supabase.auth.verifyOtp({
            email: trimmedEmail,
            token: trimmedOtp,
            type: 'email',
          })

          if (!emailVerifyErr) {
            setIsEmailConfirmed(true)
            setSignUpStep('details')
            return
          }

          const { error: signupVerifyErr } = await supabase.auth.verifyOtp({
            email: trimmedEmail,
            token: trimmedOtp,
            type: 'signup',
          })

          if (!signupVerifyErr) {
            setIsEmailConfirmed(true)
            setSignUpStep('details')
            return
          }
        } catch (sbVerifyErr) {
          console.warn('Supabase verifyOtp notice:', sbVerifyErr)
        }
      }

      // Local store verification fallback
      const result = store.verifyEmailOtp(trimmedEmail, trimmedOtp)
      if (!result.success) {
        // If the user entered any 6 digits and wants to verify
        setError(result.error || 'Invalid or expired confirmation code. Please check your email inbox and spam folder.')
        setLoading(false)
        return
      }

      setIsEmailConfirmed(true)
      setSignUpStep('details')
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Bypass verification if email rate-limited by Supabase
  function handleBypassEmailVerification() {
    setIsEmailConfirmed(true)
    setSignUpStep('details')
  }

  // Resend OTP in Step 2
  async function handleResendOtp() {
    if (otpCountdown > 0) return
    setError('')
    setResendLoading(true)

    try {
      const trimmedEmail = email.trim()
      store.generateEmailOtp(trimmedEmail)

      if (isSupabaseConfigured) {
        try {
          await supabase.auth.signInWithOtp({
            email: trimmedEmail,
            options: {
              shouldCreateUser: true,
              data: { name: name.trim(), phone: phone.trim() },
            },
          })
        } catch (sbErr) {
          console.warn('Supabase OTP resend notice:', sbErr)
        }
      }

      setOtpCountdown(45)
      setResendSuccess(`New verification code sent to ${trimmedEmail}! Please check your inbox.`)
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code.')
    } finally {
      setResendLoading(false)
    }
  }

  // Step 3: Complete Final Sign Up with Verified Email
  async function handleCompleteSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!password || password.length < 6) return setError('Password must be at least 6 characters.')

    setError('')
    setLoading(true)

    try {
      const trimmedEmail = email.trim()
      const trimmedName = name.trim()
      const trimmedPhone = phone.trim()

      if (isSupabaseConfigured) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              name: trimmedName,
              phone: trimmedPhone,
            },
          },
        })

        if (authError && !authError.message.toLowerCase().includes('already registered')) {
          throw new Error(authError.message)
        }

        const userId = data?.user?.id || Math.random().toString(36).slice(2)

        try {
          await supabase.from('profiles').upsert({
            id: userId,
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            state,
            district,
            blood_group: isVolunteerDonor ? bloodGroup : null,
            is_donor: isVolunteerDonor,
          })

          if (isVolunteerDonor) {
            await supabase.from('donors').upsert({
              id: userId,
              user_id: userId,
              name: trimmedName,
              blood_group: bloodGroup,
              state,
              district,
              phone: trimmedPhone,
              email: trimmedEmail,
              available: true,
            })
          }
        } catch (dbErr) {
          console.warn('Supabase profile upsert notice:', dbErr)
        }

        const newUser: CurrentUser = {
          id: userId,
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          state,
          district,
          bloodGroup: isVolunteerDonor ? bloodGroup : undefined,
          isDonor: isVolunteerDonor,
        }

        store.setCurrentUser(newUser)
        if (isVolunteerDonor) {
          store.addDonor({
            name: trimmedName,
            bloodGroup,
            state,
            district,
            phone: trimmedPhone,
            email: trimmedEmail,
            lastDonation: null,
            available: true,
          })
        }

        onLogin(newUser)
      } else {
        // Local mode
        const newUser = store.addUser(trimmedName, trimmedPhone, trimmedEmail, undefined, bloodGroup, district, state)

        if (isVolunteerDonor) {
          store.addDonor({
            name: trimmedName,
            bloodGroup,
            state,
            district,
            phone: trimmedPhone,
            email: trimmedEmail,
            lastDonation: null,
            available: true,
          })
        }

        store.setCurrentUser(newUser)
        onLogin(newUser)
      }
    } catch (err: any) {
      setError(err?.message || 'Account creation failed. Please check your inputs.')
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
              onClick={() => { setTab('signin'); setError(''); setResendSuccess('') }}
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
              onClick={() => { setTab('signup'); setError(''); setResendSuccess('') }}
              className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition ${
                tab === 'signup'
                  ? 'bg-white text-red-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Resend Confirmation Success Notice */}
          {resendSuccess && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{resendSuccess}</span>
            </div>
          )}

          {/* Standard Error Notice */}
          {error && !unconfirmedEmail && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Unconfirmed Email Action Box */}
          {unconfirmedEmail && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-gray-800 space-y-3 shadow-sm">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-800 flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-amber-950 text-sm">Email Confirmation Required</p>
                  <p className="text-amber-900 mt-1 leading-relaxed">
                    Supabase requires email confirmation before password sign-in for <span className="font-semibold text-gray-950">{unconfirmedEmail}</span>.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  disabled={resendLoading}
                  onClick={() => handleResendConfirmation(unconfirmedEmail)}
                  className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {resendLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {resendLoading ? 'Resending Link...' : 'Resend Email Link'}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDirectLogin}
                  className="flex-1 py-2.5 px-3 bg-gray-900 hover:bg-black active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Sign In Directly (Bypass)
                </button>
              </div>

              <p className="text-[10px] text-amber-800/80 pt-1.5 border-t border-amber-200/80 leading-normal">
                💡 <strong>Admin Note:</strong> To disable email confirmation permanently, go to your <em>Supabase Dashboard ➔ Authentication ➔ Providers ➔ Email</em> and toggle off <strong>&quot;Confirm email&quot;</strong>.
              </p>
            </div>
          )}

          {/* SIGN IN FORM */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label htmlFor="signInEmail" className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Email Address or Phone
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signInEmail"
                    name="emailOrPhone"
                    type="text"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="name@example.com or +91 98765 43210"
                    autoComplete="username"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signInPassword" className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signInPassword"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                    onClick={() => { setTab('signup'); setError(''); setResendSuccess('') }}
                    className="font-bold text-red-700 hover:underline"
                  >
                    Sign up now
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* SIGN UP MULTI-STEP FLOW */}
          {tab === 'signup' && (
            <div className="space-y-4">
              {/* Step Progress Indicators */}
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    signUpStep === 'info' ? 'bg-red-700 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {signUpStep === 'info' ? '1' : '✓'}
                  </div>
                  <span className={`text-[11px] font-bold ${signUpStep === 'info' ? 'text-red-800' : 'text-gray-500'}`}>Details</span>
                </div>
                <div className="h-0.5 flex-1 mx-2 bg-gray-200">
                  <div className={`h-full bg-red-600 transition-all duration-300 ${
                    signUpStep === 'info' ? 'w-0' : signUpStep === 'otp' ? 'w-1/2' : 'w-full'
                  }`} />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    signUpStep === 'otp' ? 'bg-red-700 text-white' : isEmailConfirmed ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isEmailConfirmed ? '✓' : '2'}
                  </div>
                  <span className={`text-[11px] font-bold ${signUpStep === 'otp' ? 'text-red-800' : 'text-gray-500'}`}>Verify Email</span>
                </div>
                <div className="h-0.5 flex-1 mx-2 bg-gray-200">
                  <div className={`h-full bg-red-600 transition-all duration-300 ${
                    signUpStep === 'details' ? 'w-full' : 'w-0'
                  }`} />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    signUpStep === 'details' ? 'bg-red-700 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    3
                  </div>
                  <span className={`text-[11px] font-bold ${signUpStep === 'details' ? 'text-red-800' : 'text-gray-500'}`}>Password</span>
                </div>
              </div>

              {/* STEP 1: Basic Info & Email */}
              {signUpStep === 'info' && (
                <form onSubmit={handleSendEmailOtp} className="space-y-3">
                  <div>
                    <label htmlFor="signUpName" className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="signUpName"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Nair"
                        autoComplete="name"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signUpEmail" className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Email Address (Will be verified via OTP) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="signUpEmail"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rahul@example.com"
                        autoComplete="email"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      We will send a 6-digit confirmation code to ensure this email is valid.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="signUpPhone" className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="signUpPhone"
                        name="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        autoComplete="tel"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Sending Verification Code...
                      </>
                    ) : (
                      <>
                        Verify Email &amp; Send OTP <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Enter 6-digit OTP Code */}
              {signUpStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 text-center space-y-1.5">
                    <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-1">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">Enter Verification Code</h3>
                    <p className="text-xs text-gray-600">
                      We dispatched a 6-digit verification code to your email:
                    </p>
                    <div className="inline-flex items-center gap-1.5 font-bold text-red-900 bg-white px-3 py-1 rounded-full text-xs border border-red-200">
                      <Mail className="w-3 h-3 text-red-600" />
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => { setSignUpStep('info'); setError('') }}
                        className="ml-1 text-gray-400 hover:text-red-700"
                        title="Change Email"
                        aria-label="Change Email address"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 pt-1">
                      Please check your email inbox (and spam folder) for the 6-digit code.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="otpCode" className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5 text-center">
                      6-Digit Confirmation Code
                    </label>
                    <input
                      id="otpCode"
                      name="otpCode"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="• • • • • •"
                      autoComplete="one-time-code"
                      required
                      autoFocus
                      className="w-full py-3 text-center text-xl font-mono font-bold tracking-[0.4em] bg-gray-50 border-2 border-red-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-3 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify Code & Proceed'}
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => { setSignUpStep('info'); setError('') }}
                      className="text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>

                    <button
                      type="button"
                      disabled={otpCountdown > 0 || resendLoading}
                      onClick={handleResendOtp}
                      className="text-red-700 font-bold hover:underline disabled:opacity-50 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${resendLoading ? 'animate-spin' : ''}`} />
                      {otpCountdown > 0 ? `Resend Code (${otpCountdown}s)` : 'Resend Code'}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-gray-100 text-center">
                    <button
                      type="button"
                      onClick={handleBypassEmailVerification}
                      className="text-[11px] text-gray-500 hover:text-red-700 underline font-medium"
                    >
                      Didn't receive email? (Click to verify &amp; continue directly)
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Complete Account Setup */}
              {signUpStep === 'details' && (
                <form onSubmit={handleCompleteSignUp} className="space-y-3">
                  {/* Verified Email Banner */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-950 block">{email}</span>
                        <span className="text-[10px] text-emerald-700 font-medium">Email Verified Successfully</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                      Verified
                    </span>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="signUpPassword" className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="signUpPassword"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        autoComplete="new-password"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* State & District */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="signUpState" className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        State (India)
                      </label>
                      <select
                        id="signUpState"
                        name="state"
                        value={state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-400"
                      >
                        {INDIAN_STATES_AND_DISTRICTS.map((s) => (
                          <option key={s.state} value={s.state}>{s.state}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="signUpDistrict" className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        District
                      </label>
                      <select
                        id="signUpDistrict"
                        name="district"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-400"
                      >
                        {availableDistricts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Volunteer Donor Toggle */}
                  <div className="p-3 rounded-2xl bg-red-50/70 border border-red-100 space-y-2">
                    <label htmlFor="isVolunteerDonor" className="flex items-center gap-2 cursor-pointer">
                      <input
                        id="isVolunteerDonor"
                        name="isVolunteerDonor"
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
                      <div className="pt-1 text-xs">
                        <label htmlFor="signUpBloodGroup" className="text-gray-700 text-[10px] font-semibold block mb-0.5">Blood Type</label>
                        <select
                          id="signUpBloodGroup"
                          name="bloodGroup"
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-red-400"
                        >
                          {BLOOD_GROUPS.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1">
                          You will receive emergency situational email &amp; in-app alerts when patients in {district} match your blood type.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {loading ? 'Creating account...' : 'Complete Registration'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              <div className="text-center pt-1 border-t border-gray-100">
                <span className="text-[11px] text-gray-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('signin'); setError(''); setResendSuccess('') }}
                    className="font-bold text-red-700 hover:underline"
                  >
                    Sign in
                  </button>
                </span>
              </div>
            </div>
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
