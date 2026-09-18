import { useState, useEffect, lazy, Suspense, useCallback } from 'react'
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
  Flame,
  AlertTriangle,
  Volume2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import type { CurrentUser, ToastMessage, View, BloodRequest, BloodGroup } from './types'
import { store, seedIfEmpty, COMPATIBLE_DONORS, playEmergencyAlarm, playNotificationSound } from './store'
import { supabase, isSupabaseConfigured, REALTIME_CHANNEL_NAME } from './supabase'
import { DEFAULT_STATE, DEFAULT_DISTRICT } from './data/indianLocations'
import { requestNotificationPermission, sendBrowserNotification } from './utils/browserNotifications'
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
const IncomingRequestAlertModal = lazy(() => import('./components/IncomingRequestAlertModal'))

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
  const [incomingAlertRequest, setIncomingAlertRequest] = useState<BloodRequest | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [, forceUpdate] = useState(0)

  const addToast = useCallback((type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    const id = Math.random().toString(36).slice(2, 9)
    const newToast: ToastMessage = { id, type, title, message, timestamp: Date.now() }
    setToasts(prev => [...prev, newToast])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5500)
  }, [])

  const handleIncomingSOS = useCallback((req: BloodRequest) => {
    const currentUser = store.getCurrentUser()
    if (!currentUser) return
    if (req.requestorId === currentUser.id || (currentUser.phone && req.requestorPhone === currentUser.phone)) {
      return
    }

    const myBlood = currentUser.bloodGroup || 'O+'
    const compatible = COMPATIBLE_DONORS[req.bloodGroup as BloodGroup] || []
    const isCompatible = compatible.includes(myBlood as BloodGroup)

    const userDistrict = (currentUser.district || '').trim().toLowerCase()
    const reqDistrict = (req.district || '').trim().toLowerCase()
    const userState = (currentUser.state || '').trim().toLowerCase()
    const reqState = (req.state || '').trim().toLowerCase()

    const isSameDistrict = Boolean(userDistrict && reqDistrict && (userDistrict === reqDistrict || userDistrict.includes(reqDistrict) || reqDistrict.includes(userDistrict)))
    const isSameState = Boolean(userState && reqState && userState === reqState)
    const isMatchingArea = isSameDistrict || isSameState || !reqDistrict || !userDistrict

    // Notify if user is in same district/area and compatible, or if critical emergency
    if ((isMatchingArea && isCompatible) || isSameDistrict || req.urgency === 'critical') {
      try {
        if (req.urgency === 'critical') {
          playEmergencyAlarm()
        } else {
          playNotificationSound()
        }
      } catch (audioErr) {
        console.warn('Audio play notice:', audioErr)
      }

      // Native Browser & Mobile Lockscreen Notification
      sendBrowserNotification(
        req.urgency === 'critical'
          ? `🚨 CRITICAL SOS: ${req.bloodGroup} Blood in ${req.district}!`
          : `🩸 ${req.bloodGroup} Blood Needed in ${req.district}!`,
        {
          body: `${req.patientName} needs ${req.unitsNeeded || 1} unit(s) at ${req.hospital}. Needed: ${req.requiredBy || 'ASAP'}. Tap to view.`,
          requireInteraction: true,
        }
      )

      // Pop up interactive alert modal
      setIncomingAlertRequest(req)

      addToast(
        req.urgency === 'critical' ? 'error' : 'warning',
        req.urgency === 'critical' ? '🚨 EMERGENCY BLOOD ALERT IN YOUR AREA!' : `🩸 Blood Request in ${req.district}`,
        `${req.patientName} needs ${req.bloodGroup} at ${req.hospital} · ${req.requiredBy || 'Needed urgently'}`
      )
    }

    forceUpdate(n => n + 1)
  }, [addToast])

  useEffect(() => {
    seedIfEmpty()
    requestNotificationPermission()

    // 1. Initial background sync
    store.syncFromSupabase().then(() => {
      forceUpdate(n => n + 1)
    })

    // 2. Real-Time Supabase Channel & Event Subscriptions
    let sbChannel: any = null
    if (isSupabaseConfigured) {
      try {
        sbChannel = supabase
          .channel(REALTIME_CHANNEL_NAME)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'blood_requests' },
            async (payload) => {
              await store.syncFromSupabase()
              if (payload.eventType === 'INSERT') {
                const row = payload.new as any
                const mappedReq: BloodRequest = {
                  id: row.id,
                  requestorId: row.requestor_id,
                  requestorName: row.requestor_name,
                  requestorPhone: row.requestor_phone,
                  requestorAvatar: row.requestor_avatar,
                  patientName: row.patient_name,
                  bloodGroup: row.blood_group as BloodGroup,
                  state: row.state || DEFAULT_STATE,
                  district: row.district,
                  urgency: row.urgency,
                  hospital: row.hospital,
                  unitsNeeded: row.units_needed,
                  notes: row.notes || '',
                  createdAt: row.created_at || new Date().toISOString(),
                  status: row.status,
                  matches: row.matches || [],
                }
                handleIncomingSOS(mappedReq)
              } else {
                forceUpdate(n => n + 1)
              }
            }
          )
          .on('broadcast', { event: 'sos_alert' }, ({ payload }) => {
            if (payload) {
              handleIncomingSOS(payload as BloodRequest)
            }
          })
          .subscribe()
      } catch (err) {
        console.warn('Supabase realtime subscription notice:', err)
      }
    }

    // 3. Multi-Tab & Cross-Window Storage Event Listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bd_requests' || e.key === 'bd_donors') {
        forceUpdate(n => n + 1)
      }
      if (e.key === 'bd_last_sos' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed && parsed.req) {
            handleIncomingSOS(parsed.req)
          }
        } catch {}
      }
    }

    // 4. Custom window broadcast listener
    const handleCustomBroadcast = (e: any) => {
      if (e.detail) {
        handleIncomingSOS(e.detail)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('bloodlink_sos_broadcast', handleCustomBroadcast)

    // 5. Periodic 3-Second Cloud Sync Polling Fallback (for instant cross-device sync)
    const pollInterval = setInterval(async () => {
      if (isSupabaseConfigured) {
        const prevRequests = store.getRequests()
        await store.syncFromSupabase()
        const newRequests = store.getRequests()

        if (newRequests.length > prevRequests.length) {
          const fresh = newRequests.filter(nr => !prevRequests.some(pr => pr.id === nr.id))
          fresh.forEach(fr => handleIncomingSOS(fr))
        }
        forceUpdate(n => n + 1)
      }
    }, 3000)

    // 6. Supabase Auth State Listener
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
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('bloodlink_sos_broadcast', handleCustomBroadcast)
      clearInterval(pollInterval)
      if (sbChannel) {
        supabase.removeChannel(sbChannel)
      }
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [handleIncomingSOS])

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
  
  const userBloodGroup = (user.bloodGroup || myProfile?.bloodGroup || 'O+') as BloodGroup
  const userDistrict = (user.district || myProfile?.district || '').trim().toLowerCase()
  const userState = (user.state || myProfile?.state || '').trim().toLowerCase()

  // Real-time matching calculation for active user
  const matchingRequests = requests.filter(r => {
    if (r.status !== 'open') return false
    if (r.requestorId === user.id || (user.phone && r.requestorPhone === user.phone)) return false

    const compatible = COMPATIBLE_DONORS[r.bloodGroup] || []
    if (!compatible.includes(userBloodGroup)) return false

    const reqDistrict = (r.district || '').trim().toLowerCase()
    const reqState = (r.state || '').trim().toLowerCase()
    const isCritical = r.urgency === 'critical'

    // 1. Same district match
    if (reqDistrict && userDistrict && (reqDistrict === userDistrict || reqDistrict.includes(userDistrict) || userDistrict.includes(reqDistrict))) {
      return true
    }

    // 2. Critical SOS emergency in state
    if (isCritical && (reqState === userState || !reqDistrict || !userDistrict)) {
      return true
    }

    return false
  })

  // Pending count for alerts badge
  const pendingCount = matchingRequests.filter(r => {
    const match = r.matches.find(m => m.donorId === user.id || (myProfile && m.donorId === myProfile.id))
    return !match || match.status === 'pending'
  }).length

  // Find most urgent active Critical SOS for top banner alert
  const activeCriticalSOS = matchingRequests.find(r => r.urgency === 'critical')

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

      {/* Persistent Floating Emergency SOS Alert Banner (when active matching SOS is triggered) */}
      {activeCriticalSOS && (
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white shadow-lg border-b-2 border-yellow-400 py-2.5 px-3 sm:px-6 sticky top-14 sm:top-16 z-30 animate-pulse">
          <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-yellow-400 text-red-950 font-extrabold flex-shrink-0 animate-bounce">
                <Flame className="w-4 h-4 fill-red-950" />
              </span>
              <div>
                <span className="font-extrabold tracking-wide uppercase text-yellow-300 mr-1.5">
                  CRITICAL EMERGENCY SOS:
                </span>
                <span className="font-semibold text-white">
                  <strong>{activeCriticalSOS.bloodGroup}</strong> needed for {activeCriticalSOS.patientName} at {activeCriticalSOS.hospital} ({activeCriticalSOS.district})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => playEmergencyAlarm()}
                title="Play Alarm Siren"
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
              >
                <Volume2 className="w-3.5 h-3.5" /> Siren
              </button>
              <button
                type="button"
                onClick={() => setView('notifications')}
                className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-red-950 rounded-lg text-xs font-black shadow-md flex items-center gap-1 transition"
              >
                <span>Respond to SOS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

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

        {incomingAlertRequest && (
          <IncomingRequestAlertModal
            request={incomingAlertRequest}
            onAccept={(req) => {
              setIncomingAlertRequest(null)
              setView('notifications')
              addToast('info', 'Opening Request', `Viewing details for ${req.patientName}.`)
            }}
            onDismiss={() => setIncomingAlertRequest(null)}
          />
        )}
      </Suspense>

      {/* Toast Alert Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
