import { useState } from 'react'
import { X, Flame, AlertCircle, Droplet, MapPin, Building2, ShieldAlert } from 'lucide-react'
import type { BloodGroup, CurrentUser } from '../types'
import { BLOOD_GROUPS, store } from '../store'
import { INDIAN_STATES_AND_DISTRICTS, getDistrictsForState, DEFAULT_STATE } from '../data/indianLocations'
import BloodBadge from './BloodBadge'

interface Props {
  user: CurrentUser
  onClose: () => void
  onSuccess: () => void
}

export default function EmergencySOSModal({ user, onClose, onSuccess }: Props) {
  const [patientName, setPatientName] = useState('')
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-')
  const [state, setState] = useState(user.state || DEFAULT_STATE)
  const [district, setDistrict] = useState(user.district || 'Ernakulam')
  const [hospital, setHospital] = useState('')
  const [error, setError] = useState('')

  const availableDistricts = getDistrictsForState(state)

  function handleStateChange(newState: string) {
    setState(newState)
    const dists = getDistrictsForState(newState)
    if (!dists.includes(district)) {
      setDistrict(dists[0] || '')
    }
  }

  function handleTriggerSOS(e: React.FormEvent) {
    e.preventDefault()
    if (!patientName.trim()) return setError('Please specify the patient name.')
    if (!hospital.trim()) return setError('Hospital name is required for urgent dispatch.')
    setError('')

    store.addRequest({
      requestorId: user.id,
      requestorName: user.name,
      requestorPhone: user.phone,
      requestorAvatar: user.avatar,
      patientName: patientName.trim(),
      bloodGroup,
      state,
      district,
      urgency: 'critical',
      hospital: hospital.trim(),
      unitsNeeded: 2,
      notes: '🚨 URGENT SOS EMERGENCY: Critical transfusion needed immediately.',
    })

    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-red-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-red-500">
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-rose-700 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            aria-label="Close emergency modal"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded-lg bg-white/20 text-yellow-300">
              <Flame className="w-5 h-5 animate-pulse" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-red-100">
              Immediate Trauma & ICU Broadcast
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Trigger Urgent Emergency SOS
          </h3>
          <p className="text-xs text-red-100 mt-1">
            Instantly alerts all eligible donors in {district}, {state} with emergency siren alarm & notifications.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleTriggerSOS} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div>
            <label htmlFor="sosPatientName" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Patient Full Name *
            </label>
            <input
              id="sosPatientName"
              name="patientName"
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Anjali Nair (ICU Ward 3)"
              autoComplete="name"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Blood Group Needed *
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {BLOOD_GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setBloodGroup(g)}
                  className={`py-2 rounded-xl text-xs font-black border-2 transition ${
                    bloodGroup === g
                      ? 'bg-red-700 border-red-700 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="sosState" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                State (India) *
              </label>
              <select
                id="sosState"
                name="state"
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-red-400 focus:outline-none font-medium"
              >
                {INDIAN_STATES_AND_DISTRICTS.map((s) => (
                  <option key={s.state} value={s.state}>{s.state}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sosDistrict" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                District ({state}) *
              </label>
              <select
                id="sosDistrict"
                name="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-red-400 focus:outline-none font-medium"
              >
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="sosHospital" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Hospital / ICU Location *
            </label>
            <input
              id="sosHospital"
              name="hospital"
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="e.g. Medical College Hospital, Kozhikode"
              required
              className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-red-300 flex items-center justify-center gap-2 transition"
            >
              <Flame className="w-4 h-4 text-yellow-300" />
              <span>Broadcast Priority SOS Alert</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-2xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
