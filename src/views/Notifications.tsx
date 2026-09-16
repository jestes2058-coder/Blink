import { useState, useEffect } from 'react'
import {
  Bell,
  MapPin,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Phone,
  Droplet,
  ShieldCheck,
  Award,
  ArrowRight,
  Volume2,
  VolumeX,
  Flame,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import type { CurrentUser, View, BloodRequest } from '../types'
import {
  store,
  canDonate,
  nextEligibleDate,
  COMPATIBLE_DONORS,
  playNotificationSound,
} from '../store'
import BloodBadge from '../components/BloodBadge'
import UrgencyBadge from '../components/UrgencyBadge'

interface Props {
  user: CurrentUser
  setView: (v: View) => void
  onToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void
  isSimulator?: boolean
}

export default function Notifications({ user, setView, onToast, isSimulator = false }: Props) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [, forceUpdate] = useState(0)
  const refresh = () => forceUpdate(n => n + 1)

  const donors = store.getDonors()
  const myProfile = donors.find(d => d.phone === user.phone || d.id === user.id || (user.email && d.email === user.email))

  // If not a registered donor yet
  if (!myProfile) {
    return (
      <div className={`w-full ${isSimulator ? 'px-3 py-6 space-y-4' : 'max-w-2xl mx-auto px-4 py-12 space-y-6'} text-center`}>
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 text-red-700 rounded-3xl flex items-center justify-center mx-auto border border-red-100 shadow-sm">
          <Bell className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Enable Emergency Donor Alerts
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Join the volunteer donor registry to receive instant alerts whenever patients matching your blood group in your district need emergency aid.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-red-100 shadow-sm text-left max-w-md mx-auto space-y-2 text-xs">
          <p className="font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" /> How Notifications Work:
          </p>
          <div className="space-y-1.5 text-gray-600 text-[11px] sm:text-xs">
            <p>1. Patients in your district file an urgent blood request.</p>
            <p>2. Our matching engine verifies your 90-day cooldown and compatibility.</p>
            <p>3. You receive an alert and choose to Accept or Decline with complete privacy.</p>
          </div>
        </div>

        <button
          onClick={() => setView('register-donor')}
          className="w-full sm:w-auto px-6 py-3 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md transition"
        >
          Register as Volunteer Donor
        </button>
      </div>
    )
  }

  const eligible = canDonate(myProfile)
  const nextDate = nextEligibleDate(myProfile)
  const requests = store.getRequests()

  // Collect all requests that match this donor:
  const myMatches = requests.filter(r => {
    const hasExplicitMatch = r.matches.some(m => m.donorId === myProfile.id || m.donorName === myProfile.name)
    if (hasExplicitMatch) return true

    if (r.status === 'open' && r.district === myProfile.district) {
      const compatible = COMPATIBLE_DONORS[r.bloodGroup] || []
      return compatible.includes(myProfile.bloodGroup) && r.requestorPhone !== myProfile.phone
    }

    return false
  })

  const pending = myMatches.filter(r => {
    const match = r.matches.find(m => m.donorId === myProfile.id || m.donorName === myProfile.name)
    if (!match && r.status === 'open') return true
    return match?.status === 'pending'
  })

  const responded = myMatches.filter(r => {
    const match = r.matches.find(m => m.donorId === myProfile.id || m.donorName === myProfile.name)
    return match?.status === 'accepted' || match?.status === 'declined'
  })

  function respond(req: BloodRequest, accept: boolean) {
    if (soundEnabled) {
      playNotificationSound()
    }

    let existingMatch = req.matches.find(m => m.donorId === myProfile!.id || m.donorName === myProfile!.name)
    let updatedMatches = [...req.matches]

    if (existingMatch) {
      updatedMatches = updatedMatches.map(m =>
        m.donorId === myProfile!.id || m.donorName === myProfile!.name
          ? { ...m, status: accept ? 'accepted' : 'declined', respondedAt: new Date().toISOString() }
          : m
      )
    } else {
      updatedMatches.push({
        donorId: myProfile!.id,
        donorName: myProfile!.name,
        donorBloodGroup: myProfile!.bloodGroup,
        donorDistrict: myProfile!.district,
        status: accept ? 'accepted' : 'declined',
        notifiedAt: new Date().toISOString(),
        respondedAt: new Date().toISOString(),
      })
    }

    const updated: BloodRequest = {
      ...req,
      matches: updatedMatches,
      status: accept ? 'fulfilled' : req.status,
    }

    if (accept) {
      store.updateDonor({
        ...myProfile!,
        lastDonation: new Date().toISOString(),
        totalDonations: (myProfile!.totalDonations || 0) + 1,
      })
      onToast('success', 'Blood Request Accepted!', `You accepted the request for ${req.patientName}. Requestor phone number is now revealed below.`)
    } else {
      onToast('info', 'Request Declined', `You declined the request for ${req.patientName}.`)
    }

    store.updateRequest(updated)
    refresh()
  }

  function handleTestAlert() {
    playNotificationSound()
    onToast('info', '🔔 Notification Test', 'Audio and notification alert system is fully active and functional!')
  }

  return (
    <div className={`w-full ${isSimulator ? 'px-3 py-4 space-y-4' : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'} overflow-x-hidden`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-rose-900 rounded-3xl p-5 sm:p-8 text-white shadow-xl mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-xl bg-white/20">
            <Bell className="w-4 h-4 text-red-200" />
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-200">
            Donor Alert Center
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Match Notifications
            </h1>
            <p className="text-red-100 text-xs sm:text-sm">
              Live alerts for <strong>{myProfile.district}</strong> matching your <strong>{myProfile.bloodGroup}</strong> blood group.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestAlert}
              title="Test notification alert sound"
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-yellow-300" />
              <span>Test Chime</span>
            </button>
            <BloodBadge group={myProfile.bloodGroup} size="sm" />
          </div>
        </div>
      </div>

      {/* Eligibility reminder banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
        eligible ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950' : 'bg-amber-50/90 border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            eligible ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
          }`}>
            {eligible ? <ShieldCheck className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-bold text-sm">
              {eligible ? 'Status: Fully Eligible & Ready to Donate' : 'Status: Medical 90-day Cooldown Interval'}
            </p>
            <p className="text-xs opacity-80">
              {eligible
                ? 'Your response immediately updates the patient and hospital.'
                : nextDate ? `Next eligible date: ${nextDate.toLocaleDateString()}` : 'Cooldown active'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setView('register-donor')}
          className="text-xs font-bold underline hover:opacity-80 whitespace-nowrap"
        >
          Edit Profile
        </button>
      </div>

      {myMatches.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm max-w-md mx-auto">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Active Requests</h3>
          <p className="text-xs text-gray-500 mb-6">
            When a patient in {myProfile.district} needs {myProfile.bloodGroup} blood, an emergency alert with audio chime will appear right here!
          </p>
          <button
            onClick={() => setView('home')}
            className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Alerts */}
          {pending.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">
                    Awaiting Your Response ({pending.length})
                  </h3>
                </div>
                <span className="text-[11px] text-gray-500">Fast responses save critical lives</span>
              </div>

              <div className="space-y-4">
                {pending.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl border-2 border-red-300 shadow-lg p-6 space-y-4 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xl font-bold text-gray-900">{req.patientName}</h4>
                          <UrgencyBadge urgency={req.urgency} size="sm" />
                        </div>
                        <p className="text-xs text-gray-500">
                          Requested by <strong>{req.requestorName}</strong> · Hospital: <strong>{req.hospital}</strong>
                        </p>
                      </div>

                      <BloodBadge group={req.bloodGroup} size="lg" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-gray-50 p-4 rounded-2xl">
                      <div>
                        <span className="text-gray-400 block mb-0.5">District</span>
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-600" /> {req.district}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Units Needed</span>
                        <span className="font-bold text-gray-800">{req.unitsNeeded || 1} Unit(s)</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Time of Request</span>
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" /> {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {req.notes && (
                      <div className="p-3 rounded-xl bg-red-50/50 border border-red-100 text-xs text-red-950">
                        <span className="font-bold">Patient Notes: </span> {req.notes}
                      </div>
                    )}

                    {/* Privacy notice */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
                      <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>Requestor phone number will be revealed immediately once you click Accept.</span>
                    </div>

                    {/* Response buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => respond(req, true)}
                        className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition"
                      >
                        <CheckCircle className="w-4 h-4" /> Accept & Reveal Contact
                      </button>
                      <button
                        onClick={() => respond(req, false)}
                        className="px-6 py-3.5 border border-gray-200 hover:border-red-300 text-gray-600 hover:text-red-600 font-bold text-sm rounded-2xl flex items-center justify-center gap-1.5 transition"
                      >
                        <XCircle className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Responded Requests */}
          {responded.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Past Requests History ({responded.length})
              </h3>
              <div className="space-y-3">
                {responded.map((req) => {
                  const match = req.matches.find(m => m.donorId === myProfile.id || m.donorName === myProfile.name)!
                  const isAccepted = match?.status === 'accepted'

                  return (
                    <div
                      key={req.id}
                      className={`p-5 rounded-3xl border transition ${
                        isAccepted ? 'bg-emerald-50/60 border-emerald-200' : 'bg-gray-50 border-gray-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-base">{req.patientName}</h4>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ${
                              isAccepted ? 'bg-emerald-600' : 'bg-gray-500'
                            }`}>
                              {isAccepted ? 'Accepted' : 'Declined'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {req.hospital} · {req.district}
                          </p>
                        </div>

                        <BloodBadge group={req.bloodGroup} />
                      </div>

                      {/* Revealed phone number if accepted */}
                      {isAccepted && (
                        <div className="mt-3 p-3.5 bg-white rounded-2xl border border-emerald-200 flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-2.5 text-xs">
                            <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <div>
                              <span className="text-gray-400 block">Patient / Hospital Contact:</span>
                              <span className="font-bold text-emerald-950 text-base">{req.requestorPhone} ({req.requestorName})</span>
                            </div>
                          </div>

                          <a
                            href={`tel:${req.requestorPhone}`}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call Now
                          </a>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
