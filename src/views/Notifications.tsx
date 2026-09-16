import { useState } from 'react'
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
} from 'lucide-react'
import type { CurrentUser, View, BloodRequest } from '../types'
import { store, canDonate, nextEligibleDate } from '../store'
import BloodBadge from '../components/BloodBadge'
import UrgencyBadge from '../components/UrgencyBadge'

interface Props {
  user: CurrentUser
  setView: (v: View) => void
  onToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void
}

export default function Notifications({ user, setView, onToast }: Props) {
  const donors = store.getDonors()
  const myProfile = donors.find(d => d.phone === user.phone || d.id === user.id)
  const [, forceUpdate] = useState(0)
  const refresh = () => forceUpdate(n => n + 1)

  if (!myProfile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-700 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-red-100">
          <Bell className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
          Donor Profile Required
        </h2>
        <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
          Register as a volunteer donor to receive tailored notifications when patients matching your blood group need help.
        </p>
        <button
          onClick={() => setView('register-donor')}
          className="px-6 py-3.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-2xl shadow-md transition"
        >
          Register as Volunteer Donor
        </button>
      </div>
    )
  }

  const eligible = canDonate(myProfile)
  const nextDate = nextEligibleDate(myProfile)

  const requests = store.getRequests()
  const myMatches = requests.filter(r =>
    r.matches.some(m => m.donorId === myProfile.id),
  )

  const pending = myMatches.filter(r => r.matches.find(m => m.donorId === myProfile.id)?.status === 'pending')
  const responded = myMatches.filter(r => {
    const m = r.matches.find(m => m.donorId === myProfile.id)
    return m?.status === 'accepted' || m?.status === 'declined'
  })

  function respond(req: BloodRequest, accept: boolean) {
    const updated: BloodRequest = {
      ...req,
      matches: req.matches.map(m =>
        m.donorId === myProfile!.id
          ? { ...m, status: accept ? 'accepted' : 'declined', respondedAt: new Date().toISOString() }
          : m,
      ),
      status: accept ? 'fulfilled' : req.status,
    }

    if (accept) {
      // Record this donation for the donor & update total
      store.updateDonor({
        ...myProfile!,
        lastDonation: new Date().toISOString(),
        totalDonations: (myProfile!.totalDonations || 0) + 1,
      })
      onToast('success', 'Request Accepted!', `You accepted the request for ${req.patientName}. Requestor phone number is now revealed.`)
    } else {
      onToast('info', 'Request Declined', `You declined the request for ${req.patientName}.`)
    }

    store.updateRequest(updated)
    refresh()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-rose-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-xl bg-white/20">
            <Bell className="w-5 h-5 text-red-200" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-red-200">
            Donor Alert Center
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Blood Match Notifications
            </h1>
            <p className="text-red-100 text-xs sm:text-sm">
              Review urgent requests matching your blood group ({myProfile.bloodGroup}) and district ({myProfile.district}).
            </p>
          </div>

          <BloodBadge group={myProfile.bloodGroup} size="lg" />
        </div>
      </div>

      {/* Eligibility reminder pill */}
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
              {eligible ? 'Status: Fully Eligible to Donate' : 'Status: In Donation Cooldown Interval'}
            </p>
            <p className="text-xs opacity-80">
              {eligible
                ? 'Your donation response immediately alerts the patient and fulfills the request.'
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
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Alerts Right Now</h3>
          <p className="text-xs text-gray-500 mb-6">
            When a patient in your district needs {myProfile.bloodGroup} blood, you will receive an immediate match notification here.
          </p>
          <button
            onClick={() => setView('home')}
            className="px-5 py-2.5 bg-red-700 text-white font-semibold text-xs rounded-xl"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Alerts */}
          {pending.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">
                  Awaiting Your Immediate Response ({pending.length})
                </h3>
              </div>

              <div className="space-y-4">
                {pending.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl border-2 border-red-200 shadow-md p-6 space-y-4 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xl font-bold text-gray-900">{req.patientName}</h4>
                          <UrgencyBadge urgency={req.urgency} size="sm" />
                        </div>
                        <p className="text-xs text-gray-500">
                          Requested by {req.requestorName} · Hospital: <strong>{req.hospital}</strong>
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
                        className="px-5 py-3.5 border border-gray-200 hover:border-red-300 text-gray-600 hover:text-red-600 font-bold text-sm rounded-2xl flex items-center justify-center gap-1.5 transition"
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
                  const match = req.matches.find(m => m.donorId === myProfile.id)!
                  const isAccepted = match.status === 'accepted'

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
                        <div className="mt-3 p-3 bg-white rounded-2xl border border-emerald-200 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <div>
                              <span className="text-gray-400 block">Patient / Requestor Contact:</span>
                              <span className="font-bold text-emerald-950 text-sm">{req.requestorPhone} ({req.requestorName})</span>
                            </div>
                          </div>

                          <a
                            href={`tel:${req.requestorPhone}`}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
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
