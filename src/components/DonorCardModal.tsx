import { X, Award, ShieldCheck, Heart, Share2, Sparkles, MapPin, Calendar, Phone } from 'lucide-react'
import type { Donor } from '../types'
import { getDonorBadge, daysSinceLastDonation, canDonate, nextEligibleDate } from '../store'
import BloodBadge from './BloodBadge'

interface Props {
  donor: Donor
  onClose: () => void
}

export default function DonorCardModal({ donor, onClose }: Props) {
  const badge = getDonorBadge(donor.totalDonations)
  const isEligible = canDonate(donor)
  const daysSince = daysSinceLastDonation(donor)
  const nextDate = nextEligibleDate(donor)
  const livesImpacted = Math.max(1, donor.totalDonations * 3)

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `${donor.name} - BloodLink Donor`,
        text: `I'm a registered ${donor.bloodGroup} blood donor on BloodLink! ${donor.totalDonations} donations, saving up to ${livesImpacted} lives.`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(`I'm a registered ${donor.bloodGroup} blood donor on BloodLink! ${donor.totalDonations} donations completed.`)
      alert('Donor profile summary copied to clipboard!')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100 flex flex-col">
        {/* Card Header with gradient background */}
        <div className="relative p-6 text-white" style={{ background: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #B91C1C 100%)' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-200 fill-red-200" />
            <span className="text-xs font-bold uppercase tracking-widest text-red-200">Official Digital Donor Card</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">{donor.name}</h3>
              <p className="text-xs text-red-200 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-red-300" /> {donor.district}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black px-3 py-1 bg-white text-red-800 rounded-2xl shadow-md border-2 border-red-200">
                {donor.bloodGroup}
              </span>
              <span className="text-[10px] text-red-200 mt-1 font-semibold uppercase">Blood Group</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5 bg-gradient-to-b from-white to-red-50/40">
          {/* Badge & Impact Highlight */}
          {badge && (
            <div
              className="p-4 rounded-2xl border flex items-center gap-3.5 shadow-sm"
              style={{ backgroundColor: badge.bgLight, borderColor: `${badge.color}40` }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
                style={{ backgroundColor: badge.color }}
              >
                <Award className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: badge.color }}>
                    {badge.level}
                  </span>
                  <span className="text-xs font-bold text-gray-800 truncate">{badge.title}</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{badge.description}</p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-black text-red-700">{donor.totalDonations}</p>
              <p className="text-[11px] font-semibold text-gray-500">Donations</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-black text-emerald-600">~{livesImpacted}</p>
              <p className="text-[11px] font-semibold text-gray-500">Lives Saved</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs font-bold text-gray-800 mt-1">
                {isEligible ? (
                  <span className="text-emerald-700 flex items-center justify-center gap-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Ready
                  </span>
                ) : (
                  <span className="text-amber-700">{daysSince ?? 0}/90d</span>
                )}
              </p>
              <p className="text-[11px] font-semibold text-gray-500 mt-1">Status</p>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-2 text-xs bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> Member Since</span>
              <span className="font-semibold text-gray-800">{new Date(donor.registeredAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> Verified Phone</span>
              <span className="font-semibold text-gray-800">{donor.phone}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-red-500" /> Next Eligibility</span>
              <span className="font-semibold text-gray-800">
                {isEligible ? 'Eligible Now' : nextDate ? nextDate.toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleShare}
              className="flex-1 py-3 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-200 transition"
            >
              <Share2 className="w-4 h-4" /> Share Donor Card
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
