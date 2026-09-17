import { useState, useEffect, lazy, Suspense } from 'react'
import {
  Home as HomeIcon,
  Bell,
  Search,
  Droplet,
  Heart,
  Users,
  GitCompare,
  Building2,
  CheckCircle,
} from 'lucide-react'
import type { CurrentUser, ToastMessage, View } from './types'
import { store, seedIfEmpty, COMPATIBLE_DONORS } from './store'
import { supabase, isSupabaseConfigured } from './supabase'
import { DEFAULT_STATE, DEFAULT_DISTRICT } from './data/indianLocations'
import Navbar from './components/Navbar'
import ToastContainer from './components/ToastContainer'

// Code-split views and modals for fast initial page load and high Lighthouse performance
const Auth = lazy(() => import('./views/Auth'))
const Home = lazy(() => import('./views/Home'))
const RegisterDonor = lazy(() => import('./views/RegisterDonor'))
const RequestBlood = lazy(() => import('./views/RequestBlood'))
const Notifications = lazy(() => import('./views/Notifications'))
const MyRequests = lazy(() => import('./views/MyRequests'))
const DonorsDirectory = lazy(() => import('./views/DonorsDirectory'))
const CompatibilityMatrix = lazy(() => import('./components/CompatibilityMatrix'))
const EligibilityQuiz = lazy(() => import('./views/EligibilityQuiz'))
const BloodBanks = lazy(() => import('./views/BloodBanks'))
const EmergencySOSModal = lazy(() => import('./components/EmergencySOSModal'))
const EditProfileModal = lazy(() => import('./components/EditProfileModal'))
const InstallAppBanner = lazy(() => import('./components/InstallAppBanner'))

function LoadingFallback() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-44 bg-red-100/40 rounded-3xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="h-28 bg-gray-100/60 rounded-2xl" />
        <div className="h-28 bg-gray-100/60 rounded-2xl" />
        <div className="h-28 bg-gray-100/60 rounded-2xl" />
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState<CurrentUser | null>(() => store.getCurrentUser())
  const [view, setView] = useState<View>('home')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [showSOSModal, setShowSOSModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    seedIfEmpty()
    
    // Defer network sync slightly so initial paint and FCP/LCP render instantaneously
    const scheduleSync = typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? (cb: () => void) => (window as any).requestIdleCallback(cb, { timeout: 1500 })
      : (cb: () => void) => setTimeout(cb, 100)

    const syncHandle = scheduleSync(() => {
      store.syncFromSupabase().then(() => {
        forceUpdate(n => n + 1)
      })
    })

    let authSubscription: { unsubscribe: () => void } | null = null

    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            const activeUser: CurrentUser = {
              id: session.user.id,
              name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              phone: profile?.phone || session.user.user_metadata?.phone || '',
              avatar: profile?.avatar,
              state: profile?.state || DEFAULT_STATE,
              district: profile?.district || DEFAULT_DISTRICT,
              bloodGroup: profile?.blood_group,
              isDonor: profile?.is_donor,
            }

            store.setCurrentUser(activeUser)
            setUser(activeUser)
          } catch (e) {
            console.warn('Supabase auth state user sync notice:', e)
          }
        }
      })
      authSubscription = data.subscription
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [])

  function handleInstallApp() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          addToast('success', 'App Installed', 'BloodLink has been added to your home screen!')
        }
        setDeferredPrompt(null)
      })
    } else {
      alert('To install BloodLink on your device:\n\n• On iOS (Safari): Tap Share ➔ Add to Home Screen.\n• On Android (Chrome): Tap Menu (⋮) ➔ Install App.')
    }
  }

  function addToast(type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) {
    const id = Math.random().toString(36).slice(2, 9)
    const newToast: ToastMessage = { id, type, title, message, timestamp: Date.now() }
    setToasts(prev => [...prev, newToast])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4500)
  }

  function dismissToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  function handleLogin(u: CurrentUser) {
    setUser(u)
    setView('home')
    addToast('success', 'Signed In', `Welcome, ${u.name}!`)
  }

  async function handleLogout() {
    store.clearCurrentUser()
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.warn('Supabase signOut notice:', e)
      }
    }
    setUser(null)
    setView('welcome')
    addToast('info', 'Signed Out', 'You have been safely signed out.')
  }

  function refresh() {
    forceUpdate(n => n + 1)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFF8F8] flex flex-col">
        <Suspense fallback={<LoadingFallback />}>
          <Auth onLogin={handleLogin} />
          {/* PWA Install Banner */}
          <InstallAppBanner onInstall={handleInstallApp} deferredPrompt={deferredPrompt} />
        </Suspense>

        {/* Toast Alert Notifications */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    )
  }

  const donors = store.getDonors()
  const requests = store.getRequests()
  const myProfile = donors.find(d => d.phone === user.phone || d.id === user.id || (user.email && d.email === user.email))
  
  // Real-time pending notification count for active donor
  const pendingCount = myProfile
    ? requests.filter(r => {
        const match = r.matches.find(m => m.donorId === myProfile.id || m.donorName === myProfile.name)
        if (match) return match.status === 'pending'
        if (r.status === 'open' && r.district.toLowerCase() === myProfile.district.toLowerCase()) {
          const compatible = COMPATIBLE_DONORS[r.bloodGroup] || []
          return compatible.includes(myProfile.bloodGroup) && r.requestorPhone !== myProfile.phone
        }
        return false
      }).length
    : 0

  // Mobile Bottom Navigation Items
  const mobileNavItems: { view: View; label: string; icon: any; badge?: number }[] = [
    { view: 'home', label: 'Home', icon: HomeIcon },
    { view: 'request-blood', label: 'Request', icon: Droplet },
    { view: 'my-requests', label: 'My Requests', icon: Search },
    { view: 'donors-directory', label: 'Donors', icon: Users },
    { view: 'notifications', label: 'Alerts', icon: Bell, badge: pendingCount },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F8] text-[#1A0505] relative">
      {/* Responsive Navbar */}
      <Navbar
        user={user}
        currentView={view}
        setView={setView}
        onLogout={handleLogout}
        onOpenSOS={() => setShowSOSModal(true)}
        onOpenEditProfile={() => setShowEditProfileModal(true)}
        pendingAlertsCount={pendingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 lg:pb-12 overflow-x-hidden">
        <Suspense fallback={<LoadingFallback />}>
          {view === 'home' && (
            <Home
              user={user}
              setView={setView}
              onOpenSOS={() => setShowSOSModal(true)}
              onUserUpdated={(u) => {
                setUser(u)
                refresh()
              }}
              onToast={addToast}
            />
          )}

          {view === 'request-blood' && (
            <RequestBlood
              user={user}
              setView={setView}
              onToast={addToast}
            />
          )}

          {view === 'my-requests' && (
            <MyRequests
              user={user}
              setView={setView}
              onToast={addToast}
            />
          )}

          {view === 'notifications' && (
            <Notifications
              user={user}
              setView={setView}
              onToast={addToast}
            />
          )}

          {view === 'register-donor' && (
            <RegisterDonor
              user={user}
              setView={setView}
              onRegistered={refresh}
              onToast={addToast}
            />
          )}

          {view === 'donors-directory' && (
            <DonorsDirectory
              user={user}
              setView={setView}
            />
          )}

          {view === 'compatibility' && (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
              <CompatibilityMatrix />
            </div>
          )}

          {view === 'eligibility-quiz' && (
            <EligibilityQuiz setView={setView} />
          )}

          {view === 'blood-banks' && (
            <BloodBanks setView={setView} />
          )}
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav aria-label="Mobile navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-red-100 px-3 py-2 flex items-center justify-around shadow-lg">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = view === item.view
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              aria-label={item.label}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-2xl transition relative ${
                isActive ? 'text-red-700 font-bold' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] ${isActive ? 'text-red-700 font-extrabold' : 'text-gray-700 font-semibold'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-red-700 mt-0.5" />
              )}
              {item.badge ? (
                <span className="absolute -top-1 right-2 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {item.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>

      {/* Modals & Dialogs */}
      <Suspense fallback={null}>
        {showSOSModal && (
          <EmergencySOSModal
            user={user}
            onClose={() => setShowSOSModal(false)}
            onSuccess={() => {
              addToast('warning', '🚨 Urgent SOS Broadcasted', 'All eligible donors in district have been alerted with emergency priority!')
              setView('my-requests')
            }}
          />
        )}

        {showEditProfileModal && (
          <EditProfileModal
            user={user}
            donorProfile={myProfile}
            onClose={() => setShowEditProfileModal(false)}
            onSaved={(updatedUser) => {
              setUser(updatedUser)
              refresh()
            }}
            onToast={addToast}
          />
        )}
      </Suspense>

      {/* Toast Alert Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
