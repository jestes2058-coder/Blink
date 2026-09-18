import { useState } from 'react'
import {
  Search,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  XCircle,
  Droplet,
  Trash2,
  Share2,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import type { CurrentUser, View, BloodRequest } from '../types'
import { store } from '../store'
import { formatRequestSchedule } from '../utils/dateSchedule'
import BloodBadge from '../components/BloodBadge'
import UrgencyBadge from '../components/UrgencyBadge'
import UserAvatar from '../components/UserAvatar'

interface Props {
  user: CurrentUser
  setView: (v: View) => void
  onToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function MyRequests({ user, setView, onToast }: Props) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'fulfilled'>('all')
  const [, forceUpdate] = useState(0)
  const refresh = () => forceUpdate(n => n + 1)

  const requests = store.getRequests()
  const myRequests = requests.filter(r => r.requestorId === user.id || r.requestorPhone === user.phone).reverse()

  const filtered = myRequests.filter((r) => {
    if (filterStatus === 'all') return true
    return r.status === filterStatus
  })

  function handleMarkFulfilled(req: BloodRequest) {
    store.updateRequest({ ...req, status: 'fulfilled' })
    onToast('success', 'Request Fulfilled', `Marked request for ${req.patientName} as fulfilled.`)
    refresh()
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to cancel and remove this blood request?')) {
      store.deleteRequest(id)
      onToast('info', 'Request Removed', 'Blood request cancelled.')
      refresh()
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-rose-900 rounded-3xl p-5 sm:p-8 text-white shadow-xl mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-xl bg-white/20">
            <Search className="w-4 h-4 text-red-200" />
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-200">
            Request Tracker
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
              My Blood Requests
            </h1>
            <p className="text-red-100 text-xs sm:text-sm">
              Track live donor notifications, responses, and revealed contact numbers.
            </p>
          </div>

          <button
            onClick={() => setView('request-blood')}
            className="w-full sm:w-auto px-4 py-2.5 bg-white text-red-900 hover:bg-red-50 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Droplet className="w-4 h-4 fill-red-700 text-red-700" />
            <span>+ New Request</span>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterStatus === 'all'
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            All Requests ({myRequests.length})
          </button>
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterStatus === 'open'
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            Active / Open ({myRequests.filter(r => r.status === 'open').length})
          </button>
          <button
            onClick={() => setFilterStatus('fulfilled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterStatus === 'fulfilled'
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            Fulfilled ({myRequests.filter(r => r.status === 'fulfilled').length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-10 sm:p-12 text-center shadow-sm max-w-md mx-auto space-y-3">
          <Search className="w-12 h-12 text-gray-300 mx-auto" />
          <h2 className="text-lg font-bold text-gray-800">No requests in this category</h2>
          <p className="text-xs text-gray-600">
            When you create a blood requirement, it will appear here with live match statuses.
          </p>
          <button
            onClick={() => setView('request-blood')}
            className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Submit a Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => {
            const accepted = req.matches.filter(m => m.status === 'accepted')
            const pending = req.matches.filter(m => m.status === 'pending')
            const declined = req.matches.filter(m => m.status === 'declined')
            const total = req.matches.length

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-red-100 shadow-sm overflow-hidden p-5 sm:p-6 space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <UserAvatar src={req.requestorAvatar || user.avatar} name={req.patientName} size="lg" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{req.patientName}</h2>
                        <BloodBadge group={req.bloodGroup} />
                        <UrgencyBadge urgency={req.urgency} size="sm" />
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          req.status === 'open' ? 'bg-blue-100 text-blue-700' :
                          req.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-red-600" /> {req.hospital} ({req.district}{req.state ? `, ${req.state}` : ''})
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">
                          <Calendar className="w-3.5 h-3.5 text-red-600" /> Needed: {formatRequestSchedule(req.requiredBy, req.neededDate, req.neededTime, req.urgency)}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-500" /> Created {timeAgo(req.createdAt)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {req.status === 'open' && (
                      <button
                        onClick={() => handleMarkFulfilled(req)}
                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Fulfilled
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="p-2 text-gray-400 hover:text-red-700 rounded-xl hover:bg-red-50 transition"
                      title="Cancel Request"
                      aria-label="Cancel Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700">
                      Donor Match Response ({total} notified in district)
                    </span>
                    <span className="text-gray-600">
                      {accepted.length > 0 && <span className="text-emerald-700 font-bold">{accepted.length} Accepted · </span>}
                      {pending.length > 0 && <span className="text-blue-600 font-medium">{pending.length} Pending</span>}
                    </span>
                  </div>

                  {total > 0 ? (
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden flex">
                      {accepted.length > 0 && (
                        <div
                          className="h-full bg-emerald-500 transition-[width] duration-300"
                          style={{ width: `${(accepted.length / total) * 100}%` }}
                        />
                      )}
                      {pending.length > 0 && (
                        <div
                          className="h-full bg-blue-400 transition-[width] duration-300"
                          style={{ width: `${(pending.length / total) * 100}%` }}
                        />
                      )}
                      {declined.length > 0 && (
                        <div
                          className="h-full bg-gray-400 transition-[width] duration-300"
                          style={{ width: `${(declined.length / total) * 100}%` }}
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700">
                      Searching for eligible donors in {req.district}...
                    </p>
                  )}
                </div>

                {/* Matches Donor List */}
                {total > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                      Individual Donor Match Records:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {req.matches.map((match) => {
                        const isAccepted = match.status === 'accepted'
                        const isDeclined = match.status === 'declined'
                        const donorObj = store.getDonors().find(d => d.id === match.donorId)

                        return (
                          <div
                            key={match.donorId}
                            className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                              isAccepted
                                ? 'bg-emerald-50/70 border-emerald-200'
                                : isDeclined
                                ? 'bg-gray-50 border-gray-200 opacity-60'
                                : 'bg-blue-50/50 border-blue-100'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2 gap-2">
                              <div className="flex items-center gap-2.5">
                                <UserAvatar
                                  src={match.donorAvatar || donorObj?.avatar}
                                  name={match.donorName}
                                  size="sm"
                                />
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{match.donorName}</p>
                                  <p className="text-[11px] text-gray-500">{match.donorBloodGroup} Donor</p>
                                </div>
                              </div>

                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                isAccepted ? 'bg-emerald-600 text-white' :
                                isDeclined ? 'bg-gray-400 text-white' :
                                'bg-blue-600 text-white'
                              }`}>
                                {match.status}
                              </span>
                            </div>

                            {/* Contact Box */}
                            {isAccepted ? (
                              <div className="mt-1 pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                                <div className="text-xs">
                                  <span className="text-emerald-700 font-semibold block">Donor Phone:</span>
                                  <span className="font-bold text-gray-900 text-sm">{donorObj?.phone || '+91 98765 43210'}</span>
                                </div>

                                <a
                                  href={`tel:${donorObj?.phone || ''}`}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
                                >
                                  <Phone className="w-3.5 h-3.5" /> Call Donor
                                </a>
                              </div>
                            ) : (
                              <div className="mt-1 pt-2 border-t border-gray-100 text-[11px] text-gray-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Contact hidden until donor accepts
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
