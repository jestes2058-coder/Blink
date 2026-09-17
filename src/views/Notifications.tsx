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
  Mail,
  ExternalLink,
  Copy,
  X,
  Send,
  Eye,
} from 'lucide-react'
import type { CurrentUser, View, BloodRequest, SentEmailAlert } from '../types'
import {
  store,
  canDonate,
  nextEligibleDate,
  COMPATIBLE_DONORS,
  playNotificationSound,
  playEmergencyAlarm,
  generateDonorAlertEmail,
} from '../store'
import BloodBadge from '../components/BloodBadge'
import UrgencyBadge from '../components/UrgencyBadge'
import UserAvatar from '../components/UserAvatar'

interface Props {
  user: CurrentUser
  setView: (v: View) => void
  onToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void
}

export default function Notifications({ user, setView, onToast }: Props) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedEmailAlert, setSelectedEmailAlert] = useState<SentEmailAlert | null>(null)
  const [emailTab, setEmailTab] = useState<'preview' | 'code'>('preview')
  const [, forceUpdate] = useState(0)
  const refresh = () => forceUpdate(n => n + 1)

  const donors = store.getDonors()
  const myProfile = donors.find(d => d.phone === user.phone || d.id === user.id || (user.email && d.email === user.email))

  // If not a registered donor yet
  if (!myProfile) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-12 space-y-6 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 text-red-700 rounded-3xl flex items-center justify-center mx-auto border border-red-100 shadow-sm">
          <Bell className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Enable Emergency Donor Alerts
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Join the volunteer donor registry to receive instant alerts whenever patients matching your blood group in {user.district || 'your district'} need emergency aid.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-red-100 shadow-sm text-left max-w-md mx-auto space-y-2 text-xs">
          <p className="font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" /> How Notifications &amp; Email Alerts Work:
          </p>
          <div className="space-y-1.5 text-gray-600 text-[11px] sm:text-xs">
            <p>1. Patients in your district file an urgent blood request.</p>
            <p>2. Our matching engine verifies your 90-day cooldown and compatibility.</p>
            <p>3. You receive an emergency situation email and siren alert with complete privacy protection.</p>
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

    if (r.status === 'open' && r.district.toLowerCase() === myProfile.district.toLowerCase()) {
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
      if (accept) {
        playNotificationSound()
      }
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
        donorAvatar: myProfile!.avatar,
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

  function handleTestAlarm() {
    playEmergencyAlarm()
    onToast('warning', '🚨 Emergency Siren Test', 'Emergency alert siren is loud, active and functioning on your device!')
  }

  function handleOpenEmailAlert(req: BloodRequest) {
    const existing = store.getEmailForRequest(req.id, myProfile?.email)
    if (existing) {
      setSelectedEmailAlert(existing)
    } else {
      // Generate preview alert on the fly
      const { subject, htmlBody, plainText } = generateDonorAlertEmail(req, myProfile!)
      setSelectedEmailAlert({
        id: 'email-preview-' + req.id,
        requestId: req.id,
        recipientEmail: myProfile!.email || `${myProfile!.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        recipientName: myProfile!.name,
        patientName: req.patientName,
        bloodGroup: req.bloodGroup,
        urgency: req.urgency,
        hospital: req.hospital,
        district: req.district,
        state: req.state,
        subject,
        htmlBody,
        plainText,
        sentAt: req.createdAt,
        status: 'delivered',
      })
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-hidden">
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
              Match Notifications &amp; Email Alerts
            </h1>
            <p className="text-red-100 text-xs sm:text-sm">
              Live alerts for <strong>{myProfile.district}{myProfile.state ? `, ${myProfile.state}` : ''}</strong> matching your <strong>{myProfile.bloodGroup}</strong> blood group.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleTestAlarm}
              title="Test emergency siren sound"
              aria-label="Test emergency siren sound"
              className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl border border-red-400 text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-yellow-300" />
              <span>Test Alarm</span>
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
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
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
                ? 'Your response immediately updates the patient and hospital in your district.'
                : `Next eligible donation window opens on ${nextDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-white/50"
          title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
          aria-label={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-red-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
        </button>
      </div>

      {/* Main Request Lists */}
      {myMatches.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">No Active Emergency Requests in {myProfile.district}</h3>
          <p className="text-gray-500 text-xs max-w-sm mx-auto">
            You are on standby. Whenever patients matching your {myProfile.bloodGroup} blood group require blood in {myProfile.district}, you will receive a situational email and instant notification.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Alerts */}
          {pending.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-700">
                    Awaiting Your Response ({pending.length})
                  </h2>
                </div>
                <span className="text-[11px] text-gray-600">Fast responses save critical lives</span>
              </div>

              <div className="space-y-4">
                {pending.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl border-2 border-red-300 shadow-lg p-5 sm:p-6 space-y-4 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <UserAvatar
                          src={req.requestorAvatar}
                          name={req.requestorName}
                          size="lg"
                          bloodGroup={req.bloodGroup}
                          showBadge
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{req.patientName}</h3>
                            <UrgencyBadge urgency={req.urgency} size="sm" />
                          </div>
                          <p className="text-xs text-gray-600">
                            Requested by <strong>{req.requestorName}</strong> · Hospital: <strong>{req.hospital}</strong>
                          </p>
                        </div>
                      </div>

                      <BloodBadge group={req.bloodGroup} size="lg" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-gray-50 p-3.5 sm:p-4 rounded-2xl">
                      <div>
                        <span className="text-gray-600 font-semibold block mb-0.5">District</span>
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" /> {req.district}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-semibold block mb-0.5">Units Needed</span>
                        <span className="font-bold text-gray-800">{req.unitsNeeded || 1} Unit(s)</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-gray-600 font-semibold block mb-0.5">Time of Request</span>
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" /> {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {req.notes && (
                      <div className="p-3 rounded-xl bg-red-50/50 border border-red-100 text-xs text-red-950">
                        <span className="font-bold">Patient Notes: </span> {req.notes}
                      </div>
                    )}

                    {/* Email alert & Privacy banner */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-red-50/70 border border-red-200/70 rounded-2xl text-xs">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>Situational email dispatched to <strong>{myProfile.email}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenEmailAlert(req)}
                        className="px-3 py-1 bg-white hover:bg-red-50 border border-red-300 text-red-700 rounded-xl font-bold text-xs transition flex items-center gap-1 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Alert Email
                      </button>
                    </div>

                    {/* Response buttons */}
                    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
                      <button
                        onClick={() => respond(req, true)}
                        className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition"
                      >
                        <CheckCircle className="w-4 h-4" /> Accept &amp; Reveal Contact
                      </button>
                      <button
                        onClick={() => respond(req, false)}
                        className="px-6 py-3.5 border border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-600 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1.5 transition"
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
                Past Requests History ({responded.length})
              </h2>
              <div className="space-y-3">
                {responded.map((req) => {
                  const match = req.matches.find(m => m.donorId === myProfile.id || m.donorName === myProfile.name)!
                  const isAccepted = match?.status === 'accepted'

                  return (
                    <div
                      key={req.id}
                      className={`p-4 sm:p-5 rounded-3xl border transition ${
                        isAccepted ? 'bg-emerald-50/60 border-emerald-200' : 'bg-gray-50 border-gray-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2 gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar src={req.requestorAvatar} name={req.requestorName} size="md" />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-gray-900 text-base">{req.patientName}</h3>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ${
                                isAccepted ? 'bg-emerald-600' : 'bg-gray-500'
                              }`}>
                                {isAccepted ? 'Accepted' : 'Declined'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {req.hospital} · {req.district}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEmailAlert(req)}
                            className="p-2 text-gray-500 hover:text-red-700 rounded-xl hover:bg-white transition"
                            title="View sent alert email"
                            aria-label="View sent alert email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <BloodBadge group={req.bloodGroup} />
                        </div>
                      </div>

                      {/* Revealed phone number if accepted */}
                      {isAccepted && (
                        <div className="mt-3 p-3.5 bg-white rounded-2xl border border-emerald-200 flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-2.5 text-xs">
                            <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <div>
                              <span className="text-gray-600 block">Patient / Hospital Contact:</span>
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

      {/* Situational Email Alert Preview Modal */}
      {selectedEmailAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">Donor Emergency Email Alert</h3>
                  <p className="text-[11px] text-gray-300">
                    Dispatched to {selectedEmailAlert.recipientEmail} ({selectedEmailAlert.recipientName})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-gray-800 rounded-xl p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setEmailTab('preview')}
                    className={`px-3 py-1 rounded-lg transition ${
                      emailTab === 'preview' ? 'bg-red-700 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    HTML Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailTab('code')}
                    className={`px-3 py-1 rounded-lg transition ${
                      emailTab === 'code' ? 'bg-red-700 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Plain Text
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEmailAlert(null)}
                  aria-label="Close email alert preview"
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Email Subject Bar */}
            <div className="px-5 py-3 bg-gray-100 border-b border-gray-200 text-xs flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="font-bold text-gray-600 mr-2">Subject:</span>
                <span className="font-bold text-gray-900">{selectedEmailAlert.subject}</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px] uppercase flex-shrink-0">
                Delivered
              </span>
            </div>

            {/* Email Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
              {emailTab === 'preview' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedEmailAlert.htmlBody }}
                    className="email-render-box"
                  />
                </div>
              ) : (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed">
                  {selectedEmailAlert.plainText}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Situational template based on <strong>{selectedEmailAlert.urgency.toUpperCase()}</strong> urgency.
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedEmailAlert.plainText)
                  onToast('success', 'Email Copied', 'Plain text email body copied to clipboard.')
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
