import { useState } from 'react'
import {
  Heart,
  Droplet,
  Search,
  Bell,
  Users,
  GitCompare,
  CheckCircle,
  Building2,
  LogOut,
  Menu,
  X,
  Award,
  Database,
  User,
} from 'lucide-react'
import type { CurrentUser, View } from '../types'
import { store } from '../store'
import { isSupabaseConfigured } from '../supabase'

interface Props {
  user: CurrentUser
  currentView: View
  setView: (v: View) => void
  onLogout: () => void
  onOpenSOS: () => void
  pendingAlertsCount: number
}

export default function Navbar({
  user,
  currentView,
  setView,
  onLogout,
  onOpenSOS,
  pendingAlertsCount,
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const donors = store.getDonors()
  const myProfile = donors.find(d => d.phone === user.phone || d.id === user.id || (user.email && d.email === user.email))

  const navLinks: { view: View; label: string; icon: any; badge?: number }[] = [
    { view: 'home', label: 'Dashboard', icon: Heart },
    { view: 'request-blood', label: 'Request Blood', icon: Droplet },
    { view: 'my-requests', label: 'My Requests', icon: Search },
    { view: 'notifications', label: 'Alerts', icon: Bell, badge: pendingAlertsCount },
    { view: 'donors-directory', label: 'Find Donors', icon: Users },
    { view: 'compatibility', label: 'Blood Matrix', icon: GitCompare },
    { view: 'eligibility-quiz', label: 'Check Eligibility', icon: CheckCircle },
    { view: 'blood-banks', label: 'Blood Banks', icon: Building2 },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-red-100 shadow-sm">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-700 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-200 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-red-900 tracking-tight block leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  BloodLink
                </span>
                <span className="text-[10px] font-semibold text-red-600 tracking-widest uppercase">
                  Community Match
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {navLinks.slice(0, 6).map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.view
                return (
                  <button
                    key={item.view}
                    onClick={() => setView(item.view)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 relative ${
                      isActive
                        ? 'bg-red-50 text-red-700 font-extrabold'
                        : 'text-gray-600 hover:text-red-700 hover:bg-red-50/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                )
              })}

              <button
                onClick={() => setView('eligibility-quiz')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  currentView === 'eligibility-quiz' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:text-red-700'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Eligibility</span>
              </button>
              <button
                onClick={() => setView('blood-banks')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  currentView === 'blood-banks' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:text-red-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Blood Banks</span>
              </button>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* SOS Emergency Button */}
            <button
              onClick={onOpenSOS}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-red-200 flex items-center gap-1.5 transition active:scale-95 animate-pulse"
            >
              <Droplet className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">Urgent SOS</span>
              <span className="sm:hidden">SOS</span>
            </button>

            {/* Active User Badge / Profile */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-800 font-bold flex items-center justify-center text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-gray-800 block leading-tight">{user.name}</span>
                <span className="text-[10px] text-gray-500">{myProfile ? `${myProfile.bloodGroup} Donor` : 'User'}</span>
              </div>
            </div>

            {/* Donor Profile or Join Button */}
            {myProfile ? (
              <button
                onClick={() => setView('register-donor')}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100/70 text-red-800 text-xs font-bold transition"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{myProfile.bloodGroup} Donor</span>
              </button>
            ) : (
              <button
                onClick={() => setView('register-donor')}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>Join Donors</span>
              </button>
            )}

            {/* Sign Out Button */}
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-gray-400 hover:text-red-700 hover:bg-red-50 transition flex items-center gap-1 text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-red-700 hover:bg-red-50 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-red-100 bg-white/98 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-red-700 text-white font-bold flex items-center justify-center text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-xs text-gray-900">{user.name}</p>
                <p className="text-[10px] text-gray-500">{user.email || user.phone}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-2.5 py-1 text-red-700 font-bold text-xs rounded-lg hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.view
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    setView(item.view)
                    setMobileMenuOpen(false)
                  }}
                  className={`p-3 rounded-2xl text-left flex items-center gap-2.5 transition text-xs font-bold ${
                    isActive
                      ? 'bg-red-700 text-white shadow-md shadow-red-200'
                      : 'bg-gray-50 hover:bg-red-50 text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-white text-red-700 text-[10px] font-black">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => {
                setView('register-donor')
                setMobileMenuOpen(false)
              }}
              className="w-full py-2.5 rounded-xl bg-red-50 text-red-800 text-xs font-bold text-center border border-red-200"
            >
              {myProfile ? 'Update Donor Profile' : 'Register as Donor'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
