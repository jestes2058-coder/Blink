import { useState } from "react"
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
} from "lucide-react"
import type { BloodGroup, View } from "../types"
import { store } from "../store"
import {
  INDIAN_STATES_AND_DISTRICTS,
  getDistrictsForState,
  DEFAULT_STATE,
} from "../data/indianLocations"
import BloodBadge from "../components/BloodBadge"

interface Props {
  setView: (v: View) => void
}

export default function BloodBanks({ setView }: Props) {
  const [searchState, setSearchState] = useState(DEFAULT_STATE)
  const [searchDistrict, setSearchDistrict] = useState("ALL")
  const bloodBanks = store.getBloodBanks()

  const availableDistricts = getDistrictsForState(searchState)

  function handleStateChange(newState: string) {
    setSearchState(newState)
    setSearchDistrict("ALL")
  }

  const filteredBanks = bloodBanks.filter((bank) => {
    const matchState =
      searchState === "ALL" || !bank.state || bank.state === searchState
    const matchDistrict =
      searchDistrict === "ALL" || bank.district === searchDistrict
    return matchState && matchDistrict
  })

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-rose-900 rounded-3xl p-5 sm:p-8 text-white shadow-xl mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-xl bg-white/20">
            <Building2 className="w-4 h-4 text-red-200" />
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-200">
            Verified Healthcare Directory
          </span>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          District Blood Banks & Helplines
        </h1>
        <p className="text-red-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Official hospital blood storage facilities, 24/7 emergency centers,
          and direct contact numbers for acute transfusions.
        </p>
      </div>

      {/* 24/7 Emergency Helpline Bar */}
      <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-3xl p-5 sm:p-6 mb-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Flame className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              24/7 National Emergency Blood Helpline
            </h2>
            <p className="text-xs text-red-100">
              Direct hospital dispatch & emergency ambulance coordination
            </p>
          </div>
        </div>

        <a
          href="tel:108"
          className="w-full sm:w-auto px-6 py-3 bg-white text-red-800 font-extrabold text-sm rounded-2xl hover:bg-red-50 active:scale-95 transition shadow-sm text-center flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" /> Call 108 Helpline
        </a>
      </div>

      {/* State & District Filter */}
      <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="flex-1 min-w-[160px]">
            <label
              htmlFor="searchStateBank"
              className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              State
            </label>
            <select
              id="searchStateBank"
              name="state"
              value={searchState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              {INDIAN_STATES_AND_DISTRICTS.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <label
              htmlFor="searchDistrictBank"
              className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              District
            </label>
            <select
              id="searchDistrictBank"
              name="district"
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="ALL">
                All Districts ({availableDistricts.length})
              </option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setView("request-blood")}
          className="self-end sm:self-auto px-4 py-3 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-2xl transition shadow-sm whitespace-nowrap"
        >
          + Request Blood From Donors
        </button>
      </div>

      {/* Blood Banks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredBanks.map((bank) => (
          <div
            key={bank.id}
            className="bg-white rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition p-5 sm:p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                    {bank.name}
                  </h2>
                  <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />{" "}
                    {bank.address}
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
                  <Clock className="w-3.5 h-3.5 text-gray-500" /> {bank.timing}
                </span>
                <span className="font-semibold text-red-700">
                  {bank.district}
                  {bank.state ? `, ${bank.state}` : ""}
                </span>
              </div>

              {/* Blood Stock Status preview */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Inventory Blood Group Availability
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    "O+",
                    "O-",
                    "A+",
                    "A-",
                    "B+",
                    "B-",
                    "AB+",
                    "AB-",
                  ] as BloodGroup[]).map((grp) => {
                    const stock = bank.availableStock[grp] || "moderate"
                    return (
                      <div
                        key={grp}
                        className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100"
                      >
                        <span className="text-xs font-black text-gray-800 block">
                          {grp}
                        </span>
                        <span
                          className={`text-[9px] font-bold block mt-0.5 ${
                            stock === "critical"
                              ? "text-red-600"
                              : stock === "low"
                                ? "text-amber-600"
                                : stock === "moderate"
                                  ? "text-blue-600"
                                  : "text-emerald-600"
                          }`}
                        >
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
                onClick={() =>
                  alert(
                    `Directions to ${bank.name} (${bank.address}) will open in Google Maps.`,
                  )
                }
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
