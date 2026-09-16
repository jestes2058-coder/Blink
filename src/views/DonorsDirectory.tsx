import { useState } from 'react'
import {
  Users,
  Search,
  Filter,
  MapPin,
  Heart,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  ShieldCheck,
  Droplet,
} from 'lucide-react'
import type { BloodGroup, CurrentUser, Donor, View } from '../types'
import { BLOOD_GROUPS, DISTRICTS, store, canDonate, daysSinceLastDonation, nextEligibleDate, getDonorBadge } from '../store'
import BloodBadge from '../components/BloodBadge'
import DonorCardModal from '../components/DonorCardModal'

interface Props {
  user: CurrentUser
  setView: (v: View) => void
  onRequestForDonor?: (donor: Donor) => void
  isSimulator?: boolean
}

export default function DonorsDirectory({ user, setView, isSimulator = false }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | 'ALL'>('ALL')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL')
  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false)
  const [selectedDonorCard, setSelectedDonorCard] = useState<Donor | null>(null)

  const donors = store.getDonors()

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesBlood = selectedBloodGroup === 'ALL' || donor.bloodGroup === selectedBloodGroup
    const matchesDistrict = selectedDistrict === 'ALL' || donor.district === selectedDistrict
    const isEligible = canDonate(donor)
    const matchesEligible = !filterEligibleOnly || isEligible

    return matchesSearch && matchesBlood && matchesDistrict && matchesEligible
  })

  return (
    <div className={`w-full ${isSimulator ? 'px-3 py-4 space-y-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'} overflow-x-hidden`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-rose-900 rounded-3xl p-5 sm:p-8 text-white shadow-xl mb-4 sm:mb-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md">
              <Users className="w-4 h-4 text-red-200" />
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-200">
              Community Network
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Registered Volunteer Donors
          </h1>
          <p className="text-red-100 text-xs sm:text-sm leading-relaxed">
            Search active donors by district and blood group. Direct contact details remain protected and are securely shared upon request confirmation.
          </p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-5 sm:p-6 mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, district, or blood group..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition"
            />
          </div>

          {/* District Select */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition"
            >
              <option value="ALL">All Districts ({DISTRICTS.length})</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Eligibility Toggle Button */}
          <button
            type="button"
            onClick={() => setFilterEligibleOnly(!filterEligibleOnly)}
            className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition ${
              filterEligibleOnly
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{filterEligibleOnly ? 'Showing: Ready Donors Only' : 'Show: Ready to Donate Only'}</span>
          </button>
        </div>

        {/* Blood group quick pills */}
        <div className="pt-2 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
            Blood Type:
          </span>
          <button
            onClick={() => setSelectedBloodGroup('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedBloodGroup === 'ALL'
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            All Types
          </button>
          {BLOOD_GROUPS.map((g) => {
            const isSel = selectedBloodGroup === g
            return (
              <button
                key={g}
                onClick={() => setSelectedBloodGroup(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isSel
                    ? 'bg-red-700 text-white shadow-sm ring-1 ring-red-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700'
                }`}
              >
                {g}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results Count & Grid */}
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Showing {filteredDonors.length} of {donors.length} Donors
        </p>
        <button
          onClick={() => setView('request-blood')}
          className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1"
        >
          <Droplet className="w-3.5 h-3.5 fill-red-600 text-red-600" /> Need Blood? Submit Request →
        </button>
      </div>

      {filteredDonors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto shadow-sm">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Donors Registered Yet</h3>
          <p className="text-xs text-gray-500 mb-5">
            Be the first volunteer blood donor in your district to help save lives!
          </p>
          <button
            onClick={() => setView('register-donor')}
            className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition shadow-md"
          >
            Register as Volunteer Donor
          </button>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${!isSimulator ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-3 sm:gap-5`}>
          {filteredDonors.map((donor) => {
            const isEligible = canDonate(donor)
            const daysSince = daysSinceLastDonation(donor)
            const nextDate = nextEligibleDate(donor)
            const badge = getDonorBadge(donor.totalDonations)

            return (
              <div
                key={donor.id}
                className="bg-white rounded-3xl border border-red-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top donor info & Blood Group Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-400 text-white font-black text-lg flex items-center justify-center shadow-sm">
                        {donor.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{donor.name}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" /> {donor.district}
                        </p>
                      </div>
                    </div>

                    <BloodBadge group={donor.bloodGroup} size="lg" />
                  </div>

                  {/* Lifesaver Badge Pill if any */}
                  {badge && (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold" style={{ backgroundColor: badge.bgLight, color: badge.color }}>
                      <Award className="w-3.5 h-3.5" />
                      <span>{badge.title} ({donor.totalDonations} donations)</span>
                    </div>
                  )}

                  {/* Status Indicator */}
                  <div className={`p-3 rounded-2xl border text-xs mb-4 ${
                    isEligible
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      {isEligible ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-bold">
                          {isEligible ? 'Eligible & Ready to Donate' : 'Cooldown Interval'}
                        </p>
                        <p className="text-[11px] opacity-80">
                          {isEligible
                            ? daysSince !== null ? `Last donated ${daysSince} days ago` : 'Available volunteer'
                            : nextDate ? `Eligible from ${nextDate.toLocaleDateString()}` : 'Interval active'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDonorCard(donor)}
                    className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5 text-red-600" /> View Digital ID
                  </button>
                  <button
                    onClick={() => setView('request-blood')}
                    className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Droplet className="w-3.5 h-3.5" /> Request Blood
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Digital Donor Modal */}
      {selectedDonorCard && (
        <DonorCardModal donor={selectedDonorCard} onClose={() => setSelectedDonorCard(null)} />
      )}
    </div>
  )
}
