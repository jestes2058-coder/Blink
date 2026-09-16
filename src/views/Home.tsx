import { useState } from 'react'
import {
  Droplet,
  Heart,
  Bell,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Award,
  ArrowRight,
  GitCompare,
  Building2,
  ShieldCheck,
  Flame,
  Sparkles,
  Phone,
} from 'lucide-react'
import type { CurrentUser, View } from '../types'
import {
  store,
  canDonate,
  daysSinceLastDonation,
  nextEligibleDate,
  DONATION_INTERVAL_DAYS,
  getDonorBadge,
} from '../store'
import BloodBadge from '../components/BloodBadge'
import UrgencyBadge from '../components/UrgencyBadge'
import DonorCardModal from '../components/DonorCardModal'

interface Props {
  user: CurrentUser
  setView: (v: View) => void
  onOpenSOS: () => void
  isSimulator?: boolean
}

export default function Home({ user, setView, onOpenSOS, isSimulator = false }: Props) {
  const [showDonorCardModal, setShowDonorCardModal] = useState(false)

  const donors = store.getDonors()
  const requests = store.getRequests()
  const myDonorProfile = donors.find(d => d.id === user.id || d.phone === user.phone)
  const myRequests = requests.filter(r => r.requestorId === user.id || r.requestorPhone === user.phone)

  const pendingForMe = requests.filter(r =>
    r.matches.some(m => m.donorId === (myDonorProfile?.id ?? '') && m.status === 'pending'),
  )

  const totalDonors = donors.length
  const totalOpenRequests = requests.filter(r => r.status === 'open').length
  const urgentRequests = requests.filter(r => r.status === 'open' && (r.urgency === 'critical' || r.urgency === 'urgent'))

  const eligible = myDonorProfile ? canDonate(myDonorProfile) : false
  const nextDate = myDonorProfile ? nextEligibleDate(myDonorProfile) : null
  const daysSince = myDonorProfile ? daysSinceLastDonation(myDonorProfile) : null
  const donorBadge = myDonorProfile ? getDonorBadge(myDonorProfile.totalDonations) : null

  return (
    <div className={`w-full ${isSimulator ? 'px-3 py-4 space-y-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8'} overflow-x-hidden`}>
      {/* Hero Banner with Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950 via-red-900 to-rose-950 text-white p-5 sm:p-8 shadow-xl">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className={`relative z-10 flex flex-col ${!isSimulator ? 'lg:flex-row lg:items-center' : ''} justify-between gap-5`}>
          <div className="w-full max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-red-200 text-[11px] font-semibold mb-2.5 border border-white/10">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>Transfusion & Matching Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight break-words" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Welcome back, {user.name}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-red-100/90 leading-relaxed">
              Real-time matching connects verified district blood donors with patients in need — ensuring rapid emergency response with complete privacy.
            </p>

            {/* Quick Action buttons */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full">
              <button
                onClick={() => setView('request-blood')}
                className="w-full py-2.5 px-3 bg-white text-red-900 hover:bg-red-50 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Droplet className="w-4 h-4 fill-red-700 text-red-700 flex-shrink-0" />
                <span>Request Blood</span>
              </button>

              <button
                onClick={onOpenSOS}
                className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-red-400/40 transition flex items-center justify-center gap-1.5 active:scale-95 animate-pulse"
              >
                <Flame className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                <span>Emergency SOS</span>
              </button>

              {myDonorProfile && (
                <button
                  onClick={() => setShowDonorCardModal(true)}
                  className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-white/20 transition flex items-center justify-center gap-1.5 truncate"
                >
                  <Award className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                  <span className="truncate">Donor ID Card</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center border border-white/10">
              <Users className="w-4 h-4 text-red-200 mx-auto mb-0.5" />
              <p className="text-xl sm:text-2xl font-black text-white">{totalDonors}</p>
              <p className="text-[10px] font-semibold text-red-200 truncate">Active Donors</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center border border-white/10">
              <AlertCircle className="w-4 h-4 text-amber-300 mx-auto mb-0.5" />
              <p className="text-xl sm:text-2xl font-black text-white">{totalOpenRequests}</p>
              <p className="text-[10px] font-semibold text-red-200 truncate">Open Requests</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-300 mx-auto mb-0.5" />
              <p className="text-xl sm:text-2xl font-black text-white">100%</p>
              <p className="text-[10px] font-semibold text-red-200 truncate">Privacy Safe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Alerts notification if any requests match this donor */}
      {pendingForMe.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-bounce">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">
                {pendingForMe.length} Blood Request{pendingForMe.length > 1 ? 's' : ''} Awaiting Your Response!
              </h2>
              <p className="text-xs text-red-100">
                A patient matching your blood type ({myDonorProfile?.bloodGroup}) urgently needs your assistance.
              </p>
            </div>
          </div>

          <button
            onClick={() => setView('notifications')}
            className="w-full sm:w-auto px-6 py-3 bg-white text-red-800 font-extrabold text-xs sm:text-sm rounded-2xl shadow hover:bg-red-50 transition"
          >
            Review & Respond Now →
          </button>
        </div>
      )}

      {/* Main 2-Column Dashboard Layout */}
      <div className={`grid grid-cols-1 ${!isSimulator ? 'lg:grid-cols-3' : ''} gap-4 sm:gap-6`}>
        {/* Left 2 Columns: Donor Status + Quick Actions + Live Emergency Feed */}
        <div className={`${!isSimulator ? 'lg:col-span-2' : ''} space-y-4 sm:space-y-6`}>
          {/* Donor Profile Status Card */}
          {myDonorProfile ? (
            <div className="bg-white rounded-3xl border border-red-100 p-4 sm:p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {eligible ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : <Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                      {eligible ? 'Eligible to Donate Blood' : 'Donation Cooldown Active'}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                      {eligible
                        ? daysSince !== null ? `Last donated ${daysSince} days ago · Active` : 'Ready for active requests'
                        : nextDate ? `Cooldown until ${nextDate.toLocaleDateString()}` : 'Cooldown active'}
                    </p>
                  </div>
                </div>

                <BloodBadge group={myDonorProfile.bloodGroup} size="sm" />
              </div>

              {/* Progress bar if in cooldown */}
              {!eligible && (
                <div className="mb-3.5 p-3 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <div className="flex justify-between text-[11px] font-semibold text-amber-800 mb-1">
                    <span>{daysSince ?? 0} of {DONATION_INTERVAL_DAYS} days</span>
                    <span>{Math.max(0, DONATION_INTERVAL_DAYS - (daysSince ?? 0))}d remaining</span>
                  </div>
                  <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((daysSince ?? 0) / DONATION_INTERVAL_DAYS) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Donor Badges & Details Bar */}
              <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {donorBadge && (
                    <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-xl" style={{ backgroundColor: donorBadge.bgLight, color: donorBadge.color }}>
                      ★ {donorBadge.title} ({myDonorProfile.totalDonations})
                    </span>
                  )}
                  <span className="text-[11px] text-gray-500">{myDonorProfile.district}</span>
                </div>

                <button
                  onClick={() => setShowDonorCardModal(true)}
                  className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1"
                >
                  View ID Card →
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-3xl border border-red-200 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 fill-red-600 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Join Volunteer Blood Donors</h3>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Help your local community in emergencies. Contact details stay 100% private.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setView('register-donor')}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition whitespace-nowrap"
              >
                Register as Donor
              </button>
            </div>
          )}

          {/* Quick Feature Grid */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
              Explore Platform Features
            </h3>
            <div className={`grid grid-cols-1 ${!isSimulator ? 'sm:grid-cols-3' : ''} gap-2.5 sm:gap-3`}>
              {/* Find Donors */}
              <button
                onClick={() => setView('donors-directory')}
                className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition text-left group flex items-center sm:flex-col justify-between sm:justify-between gap-3"
              >
                <div className="flex items-center sm:flex-col sm:items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm group-hover:text-red-700 transition">Donor Directory</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500">Search active district volunteers</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 sm:hidden" />
              </button>

              {/* Compatibility Matrix */}
              <button
                onClick={() => setView('compatibility')}
                className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition text-left group flex items-center sm:flex-col justify-between sm:justify-between gap-3"
              >
                <div className="flex items-center sm:flex-col sm:items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <GitCompare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm group-hover:text-red-700 transition">Blood Compatibility</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500">Check medical transfusion matching</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 sm:hidden" />
              </button>

              {/* Blood Banks Directory */}
              <button
                onClick={() => setView('blood-banks')}
                className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition text-left group flex items-center sm:flex-col justify-between sm:justify-between gap-3"
              >
                <div className="flex items-center sm:flex-col sm:items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm group-hover:text-red-700 transition">Blood Banks & Helplines</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500">24/7 hospital inventory & hotlines</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 sm:hidden" />
              </button>
            </div>
          </div>

          {/* Active Urgent Requests in District */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Active Critical & Urgent Requests
              </h3>
              <button
                onClick={() => setView('my-requests')}
                className="text-xs font-bold text-red-700 hover:text-red-800"
              >
                View All My Requests →
              </button>
            </div>

            {urgentRequests.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 text-center shadow-sm">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-800">All recent requests are fulfilled</p>
                <p className="text-xs text-gray-400 mt-1">No outstanding emergency shortage at this time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentRequests.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl border border-red-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BloodBadge group={req.bloodGroup} />
                        <UrgencyBadge urgency={req.urgency} size="sm" />
                        <span className="text-xs font-bold text-gray-800">{req.patientName}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {req.hospital} · {req.district}
                      </p>
                    </div>

                    <button
                      onClick={() => setView('request-blood')}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-800 font-bold text-xs rounded-xl transition"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Mini Compatibility Teaser & Educational Tools */}
        <div className="space-y-6">
          {/* Eligibility Quiz Promo Card */}
          <div className="bg-gradient-to-br from-red-800 to-rose-950 text-white rounded-3xl p-6 shadow-md">
            <div className="flex items-center gap-2 mb-2 text-yellow-300">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Self Assessment</span>
            </div>
            <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Can You Donate Today?
            </h3>
            <p className="text-xs text-red-100 mb-4 leading-relaxed">
              Take our interactive 1-minute screener to check weight, age, and interval eligibility before heading to a center.
            </p>
            <button
              onClick={() => setView('eligibility-quiz')}
              className="w-full py-3 bg-white text-red-900 hover:bg-red-50 font-bold text-xs rounded-2xl shadow transition flex items-center justify-center gap-1.5"
            >
              Start Health Screener <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Compatibility Guide Widget */}
          <div className="bg-white rounded-3xl border border-red-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">Blood Type Quick Match</h3>
              <button
                onClick={() => setView('compatibility')}
                className="text-xs font-bold text-red-700 hover:underline"
              >
                Full Matrix
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-red-50/60 border border-red-100">
                <p className="font-bold text-red-950 mb-0.5">O- Negative Donors</p>
                <p className="text-gray-600">Can donate to ALL 8 blood groups (Universal Donor).</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                <p className="font-bold text-amber-950 mb-0.5">AB+ Positive Recipients</p>
                <p className="text-gray-600">Can safely receive blood from ALL blood groups.</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <p className="font-bold text-emerald-950 mb-0.5">District Matching</p>
                <p className="text-gray-600">Automatic filter prevents long travel times in emergency cases.</p>
              </div>
            </div>
          </div>

          {/* Emergency 24/7 Helpline Widget */}
          <div className="bg-white rounded-3xl border border-red-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base mb-2">Emergency Hotline</h3>
            <p className="text-xs text-gray-500 mb-3">For acute trauma and mass casualty blood supply dispatch.</p>
            <a
              href="tel:18005550199"
              className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-800 font-bold text-xs rounded-2xl border border-red-200 flex items-center justify-center gap-2 transition"
            >
              <Phone className="w-4 h-4 text-red-600" /> Call 1-800-555-BLOOD
            </a>
          </div>
        </div>
      </div>

      {/* Modal for Donor ID card */}
      {showDonorCardModal && myDonorProfile && (
        <DonorCardModal donor={myDonorProfile} onClose={() => setShowDonorCardModal(false)} />
      )}
    </div>
  )
}
