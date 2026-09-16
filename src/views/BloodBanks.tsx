import { useState } from 'react'
import {
  Building2,
  Phone,
  Clock,
  MapPin,
  Search,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Flame,
} from 'lucide-react'
import type { BloodGroup, View } from '../types'
import { store, DISTRICTS } from '../store'
import BloodBadge from '../components/BloodBadge'

interface Props {
  setView: (v: View) => void
}

export default function BloodBanks({ setView }: Props) {
  const [searchDistrict, setSearchDistrict] = useState('ALL')
  const bloodBanks = store.getBloodBanks()

  const filteredBanks = bloodBanks.filter((bank) => {
    return searchDistrict === 'ALL' || bank.district === searchDistrict
  })

  function getStockBadge(status: 'high' | 'moderate' | 'low' | 'critical') {
    if (status === 'critical') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">Critical Stock</span>
    if (status === 'low') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">Low Stock</span>
    if (status === 'moderate') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">Moderate</span>
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">Adequate</span>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-rose-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-xl bg-white/20">
            <Building2 className="w-5 h-5 text-red-200" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-red-200">
            Verified Healthcare Directory
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
          District Blood Banks & Helplines
        </h1>
        <p className="text-red-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Official hospital blood storage facilities, 24/7 emergency centers, and direct contact numbers for acute transfusions.
        </p>
      </div>

      {/* 24/7 Emergency Helpline Bar */}
      <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-3xl p-5 sm:p-6 mb-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Flame className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">24/7 National Emergency Blood Hotline</h2>
            <p className="text-xs text-red-100">Direct hospital dispatch & rare blood group locator service</p>
          </div>
        </div>

        <a
          href="tel:18005550199"
          className="w-full sm:w-auto px-6 py-3 bg-white text-red-800 font-extrabold text-sm rounded-2xl hover:bg-red-50 active:scale-95 transition shadow-sm text-center flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" /> Call 1-800-555-BLOOD
        </a>
      </div>

      {/* District Filter */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Filter District:
          </span>
          <select
            value={searchDistrict}
            onChange={(e) => setSearchDistrict(e.target.value)}
            className="py-2.5 px-4 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="ALL">All Districts ({DISTRICTS.length})</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setView('request-blood')}
          className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-2xl transition shadow-sm"
        >
          + Request Blood From Donors
        </button>
      </div>

      {/* Blood Banks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBanks.map((bank) => (
          <div
            key={bank.id}
            className="bg-white rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">{bank.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" /> {bank.address}
                  </p>
                </div>

                {bank.isEmergency24x7 && (
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex-shrink-0 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> 24/7 Open
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600 mb-4 pb-3 border-b border-gray-100">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> {bank.timing}
                </span>
                <span className="font-semibold text-red-700">{bank.district}</span>
              </div>

              {/* Blood Stock Status preview */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Inventory Blood Group Availability
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as BloodGroup[]).map((grp) => {
                    const stock = bank.availableStock[grp] || 'moderate'
                    return (
                      <div key={grp} className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                        <span className="text-xs font-black text-gray-800 block">{grp}</span>
                        <span className={`text-[9px] font-bold block mt-0.5 ${
                          stock === 'critical' ? 'text-red-600' :
                          stock === 'low' ? 'text-amber-600' :
                          stock === 'moderate' ? 'text-blue-600' : 'text-emerald-600'
                        }`}>
                          {stock}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-5 border-t border-gray-100 flex items-center gap-3 mt-4">
              <a
                href={`tel:${bank.phone}`}
                className="flex-1 py-3 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Phone className="w-4 h-4" /> Call {bank.phone}
              </a>
              <button
                onClick={() => alert(`Directions to ${bank.name} (${bank.address}) will open in your maps application.`)}
                className="px-4 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-2xl transition flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Directions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
