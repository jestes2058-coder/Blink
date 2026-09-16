import { useState, useEffect } from 'react'
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
import Auth from './views/Auth'
import Home from './views/Home'
import RegisterDonor from './views/RegisterDonor'
import RequestBlood from './views/RequestBlood'
import Notifications from './views/Notifications'
import MyRequests from './views/MyRequests'
import DonorsDirectory from './views/DonorsDirectory'
import CompatibilityMatrix from './components/CompatibilityMatrix'
import EligibilityQuiz from './views/EligibilityQuiz'
import BloodBanks from './views/BloodBanks'
import Navbar from './components/Navbar'
import ToastContainer from './components/ToastContainer'
import EmergencySOSModal from './components/EmergencySOSModal'
import DeviceModeBar from './components/DeviceModeBar'
import InstallAppBanner from './components/InstallAppBanner'
import MobileSimulatorFrame from './components/MobileSimulatorFrame'
import SupabaseConfigModal from './components/SupabaseConfigModal'

export default function App() {
  const [user, setUser] = useState<CurrentUser | null>(() => store.getCurrentUser())
  const [view, setView] = useState<View>('home')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [showSOSModal, setShowSOSModal] = useState(false)
  const [showDBModal, setShowDBModal] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'web' | 'mobile'>('web')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    seedIfEmpty()
    store.syncFromSupabase().then(() => {
      forceUpdate(n => n + 1)
    })

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
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
      alert('To install BloodLink:\n\n• On iOS (Safari): Tap Share ➔ Add to Home Screen.\n• On Android (Chrome): Tap Menu (⋮) ➔ Install App.')
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

  function handleLogout() {
    store.clearCurrentUser()
    setUser(null)
    setView('welcome')
    addToast('info', 'Signed Out', 'You have been safely signed out.')
  }

  function refresh() {
    forceUpdate(n => n + 1)
  }

  const isSimulator = deviceMode === 'mobile'

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFF8F8] flex flex-col">
        {/* Device Mode Bar */}
        <DeviceModeBar
          deviceMode={deviceMode}
          onToggleMode={setDeviceMode}
          onInstallClick={handleInstallApp}
          onOpenDBModal={() => setShowDBModal(true)}
          canInstall={true}
        />

        <MobileSimulatorFrame isMobileSimulator={isSimulator}>
          <Auth onLogin={handleLogin} />
        </MobileSimulatorFrame>

        {/* PWA Install Banner */}
        <InstallAppBanner onInstall={handleInstallApp} deferredPrompt={deferredPrompt} />

        {/* Database Config Modal */}
        {showDBModal && (
          <SupabaseConfigModal
            onClose={() => setShowDBModal(false)}
            onSaved={() => {
              addToast('success', 'Cloud Synced', 'Connected to Supabase database.')
              refresh()
            }}
          />
        )}
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
        if (r.status === 'open' && r.district === myProfile.district) {
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

  const appContent = (
    <div className="min-h-screen flex flex-col bg-[#FFF8F8] text-[#1A0505] relative">
      {/* Responsive Navbar */}
      <Navbar
        user={user}
        currentView={view}
        setView={setView}
        onLogout={handleLogout}
        onOpenSOS={() => setShowSOSModal(true)}
        pendingAlertsCount={pendingCount}
        isSimulator={isSimulator}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 lg:pb-12 overflow-x-hidden">
        {view === 'home' && (
          <Home
            user={user}
            setView={setView}
            onOpenSOS={() => setShowSOSModal(true)}
            isSimulator={isSimulator}
          />
        )}

        {view === 'request-blood' && (
          <RequestBlood
            user={user}
            setView={setView}
            onToast={addToast}
            isSimulator={isSimulator}
          />
        )}

        {view === 'my-requests' && (
          <MyRequests
            user={user}
            setView={setView}
            onToast={addToast}
            isSimulator={isSimulator}
          />
        )}

        {view === 'notifications' && (
          <Notifications
            user={user}
            setView={setView}
            onToast={addToast}
            isSimulator={isSimulator}
          />
        )}

        {view === 'register-donor' && (
          <RegisterDonor
            user={user}
            setView={setView}
            onRegistered={refresh}
            onToast={addToast}
            isSimulator={isSimulator}
          />
        )}

        {view === 'donors-directory' && (
          <DonorsDirectory
            user={user}
            setView={setView}
            isSimulator={isSimulator}
          />
        )}

        {view === 'compatibility' && (
          <div className={`w-full ${isSimulator ? 'px-3 py-4' : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'} overflow-x-hidden`}>
            <CompatibilityMatrix />
          </div>
        )}

        {view === 'eligibility-quiz' && (
          <EligibilityQuiz setView={setView} isSimulator={isSimulator} />
        )}

        {view === 'blood-banks' && (
          <BloodBanks setView={setView} isSimulator={isSimulator} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Visible on mobile screens or mobile simulator mode) */}
      <nav className={`${isSimulator ? 'sticky' : 'lg:hidden fixed'} bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-red-100 px-3 py-2 flex items-center justify-around shadow-lg`}>
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = view === item.view
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-2xl transition relative ${
                isActive ? 'text-red-700 font-bold' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] ${isActive ? 'text-red-700 font-extrabold' : 'text-gray-400 font-medium'}`}>
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

      {/* Emergency SOS Modal */}
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

      {/* Toast Alert Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFF8F8] flex flex-col">
      {/* Device Mode Switcher Bar */}
      <DeviceModeBar
        deviceMode={deviceMode}
        onToggleMode={setDeviceMode}
        onInstallClick={handleInstallApp}
        onOpenDBModal={() => setShowDBModal(true)}
        canInstall={true}
      />

      {/* Mobile Simulator Frame or Full Website */}
      <MobileSimulatorFrame isMobileSimulator={isSimulator}>
        {appContent}
      </MobileSimulatorFrame>

      {/* Install App Banner */}
      <InstallAppBanner onInstall={handleInstallApp} deferredPrompt={deferredPrompt} />

      {/* Cloud DB Modal */}
      {showDBModal && (
        <SupabaseConfigModal
          onClose={() => setShowDBModal(false)}
          onSaved={() => {
            addToast('success', 'Cloud Synced', 'Connected to Supabase database.')
            refresh()
          }}
        />
      )}
    </div>
  )
}
