import { useState } from "react"
import {
  AlertCircle,
  MapPin,
  Building2,
  Phone,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  Mail,
  Calendar,
  Clock,
  Droplet,
} from "lucide-react"
import type { BloodGroup, Urgency, CurrentUser, View } from "../types"
import {
  BLOOD_GROUPS,
  store,
  findEligibleDonors,
  COMPATIBLE_DONORS,
} from "../store"
import {
  INDIAN_STATES_AND_DISTRICTS,
  getDistrictsForState,
  DEFAULT_STATE,
} from "../data/indianLocations"
import {
  getTodayDateString,
  getTomorrowDateString,
  getDefaultTimeString,
  computeScheduleDetails,
} from "../utils/dateSchedule"
import BloodBadge from "../components/BloodBadge"
import UrgencyBadge from "../components/UrgencyBadge"
import UserAvatar from "../components/UserAvatar"

interface Props {
  user: CurrentUser
  setView: (v: View) => void
  onToast: (
    type: "success" | "info" | "warning" | "error",
    title: string,
    message: string,
  ) => void
}

export default function RequestBlood({ user, setView, onToast }: Props) {
  const [step, setStep] = useState<"form" | "preview" | "done">("form")
  const [patientName, setPatientName] = useState("")
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(
    user.bloodGroup || "O+",
  )
  const [state, setState] = useState(user.state || DEFAULT_STATE)
  const [district, setDistrict] = useState(user.district || "Ernakulam")
  const [urgency, setUrgency] = useState<Urgency>("urgent")
  const [hospital, setHospital] = useState("")
  const [unitsNeeded, setUnitsNeeded] = useState(1)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [matchCount, setMatchCount] = useState(0)

  // Timing & Schedule state
  const [scheduleType, setScheduleType] =
    useState<"immediate" | "today" | "tomorrow" | "scheduled">("today")
  const [neededDate, setNeededDate] = useState(getTodayDateString())
  const [neededTime, setNeededTime] = useState(getDefaultTimeString(2))

  const donors = store.getDonors()
  const compatibleTypes = COMPATIBLE_DONORS[bloodGroup] || []
  const availableDistricts = getDistrictsForState(state)

  // Real-time schedule calculation
  const scheduleDetails = computeScheduleDetails(
    scheduleType,
    neededDate,
    neededTime,
  )

  function handleStateChange(newState: string) {
    setState(newState)
    const dists = getDistrictsForState(newState)
    if (!dists.includes(district)) {
      setDistrict(dists[0] || "")
    }
  }

  function handleUrgencySelect(u: Urgency) {
    setUrgency(u)
    if (u === "critical") {
      setScheduleType("immediate")
    } else if (u === "planned" && scheduleType === "immediate") {
      setScheduleType("scheduled")
      setNeededDate(getTomorrowDateString())
    }
  }

  // Quick preset time helpers
  function setQuickTimeOffset(hours: number) {
    const d = new Date()
    d.setHours(d.getHours() + hours)
    const h = String(d.getHours()).padStart(2, "0")
    const m = String(Math.floor(d.getMinutes() / 15) * 15).padStart(2, "0")
    setNeededTime(`${h}:${m}`)
  }

  // Calculate live available donors in the selected district
  const currentEligible = findEligibleDonors(
    {
      requestorId: user.id,
      requestorPhone: user.phone,
      bloodGroup,
      district,
    },
    donors,
  )

  const urgencies: { val: Urgency; label: string; desc: string }[] = [
    {
      val: "critical",
      label: "Critical / Emergency",
      desc: "Needed within 1–4 hours (Trauma/Surgery)",
    },
    { val: "urgent", label: "Urgent", desc: "Needed within 24 hours" },
    {
      val: "planned",
      label: "Planned / Scheduled",
      desc: "Scheduled procedure or future transfusion",
    },
  ]

  function handlePreview(e: React.FormEvent) {
    e.preventDefault()
    if (!patientName.trim()) {
      setError("Please enter the patient's full name.")
      const el = document.getElementById("patientName")
      if (el) el.focus()
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    if (!district) {
      setError("Please select the patient hospital district.")
      const el = document.getElementById("requestDistrict")
      if (el) el.focus()
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    if (!hospital.trim()) {
      setError("Hospital or medical clinic name is required.")
      const el = document.getElementById("hospitalName")
      if (el) el.focus()
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    setError("")

    setMatchCount(currentEligible.length)
    setStep("preview")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSubmit() {
    const newReq = await store.addRequest({
      requestorId: user.id,
      requestorName: user.name,
      requestorPhone: user.phone,
      requestorAvatar: user.avatar,
      patientName: patientName.trim(),
      bloodGroup,
      state,
      district,
      urgency,
      hospital: hospital.trim(),
      unitsNeeded,
      neededDate: scheduleDetails.neededDate,
      neededTime: scheduleDetails.neededTime,
      requiredBy: scheduleDetails.displayBadge,
      notes: notes.trim(),
    })

    const count = newReq.matches ? newReq.matches.length : 0
    if (count > 0) {
      onToast(
        "success",
        "Request Broadcasted",
        `Notified ${count} eligible donor${
          count > 1 ? "s" : ""
        } in ${district}, ${state}.`,
      )
    } else {
      onToast(
        "info",
        "Request Saved",
        "Request recorded. Donors will match as soon as volunteers in your district become available.",
      )
    }

    setStep("done")
  }

  if (step === "done") {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 shadow-sm animate-bounce">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div>
          <h2
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Blood Request Broadcasted!
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Your requirement for <strong>{patientName}</strong> has been
            scheduled and matched with eligible donors in {district}, {state}.
          </p>
        </div>

        {/* Scheduled summary card */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left max-w-md mx-auto space-y-2 text-xs">
          <p className="font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>Scheduled Transfusion Timing:</span>
          </p>
          <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
            <p className="text-red-700 font-extrabold text-sm">
              {scheduleDetails.displayBadge}
            </p>
            <p className="text-gray-500 text-[11px]">
              Day:{" "}
              <span className="font-bold text-gray-700">
                {scheduleDetails.dayOfWeek}
              </span>{" "}
              · Date:{" "}
              <span className="font-bold text-gray-700">
                {scheduleDetails.formattedDate}
              </span>{" "}
              · Time:{" "}
              <span className="font-bold text-gray-700">
                {scheduleDetails.formattedTime}
              </span>
            </p>
          </div>
        </div>

        {/* Situational Email Broadcast Alert Card */}
        <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 text-left max-w-md mx-auto space-y-2 text-xs">
          <p className="font-bold text-red-950 flex items-center gap-2">
            <Mail className="w-4 h-4 text-red-700 flex-shrink-0" />
            <span>Situational Email Alerts Dispatched</span>
          </p>
          <p className="text-gray-600 text-[11px] leading-relaxed">
            Personalized emergency alert emails containing patient hospital
            details, required blood units, and scheduled date/time (
            {scheduleDetails.displayBadge}) were dispatched to all eligible{" "}
            {bloodGroup} compatible donors in {district}.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setView("my-requests")}
            className="w-full sm:w-auto px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl sm:rounded-2xl transition shadow-md shadow-red-200 text-xs sm:text-sm"
          >
            Track in My Requests
          </button>
          <button
            onClick={() => setView("home")}
            className="w-full sm:w-auto px-6 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl sm:rounded-2xl transition text-xs sm:text-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (step === "preview") {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6 overflow-x-hidden">
        <div className="bg-gradient-to-r from-red-900 to-rose-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl">
          <button
            onClick={() => setStep("form")}
            className="text-red-200 hover:text-white text-xs font-bold mb-2 flex items-center gap-1"
          >
            ← Back to Edit
          </button>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Confirm Request Details
          </h1>
          <p className="text-red-100 text-xs mt-1">
            Review scheduled date, time, patient details and matching reach
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Summary Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 gap-3">
            <div className="flex items-center gap-3">
              <UserAvatar src={user.avatar} name={user.name} size="md" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  Requestor: {user.name}
                </p>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Patient: {patientName}
                </h2>
              </div>
            </div>
            <UrgencyBadge urgency={urgency} />
          </div>

          {/* Scheduled Timing Callout Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-700 flex-shrink-0" />
                <span className="font-extrabold text-sm text-red-950">
                  When Blood is Needed:
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 uppercase tracking-wide">
                {scheduleDetails.relativeLabel}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white/80 backdrop-blur-sm p-2.5 rounded-xl border border-red-100">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  Day of Week
                </span>
                <span className="text-sm font-extrabold text-gray-900">
                  {scheduleDetails.dayOfWeek}
                </span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-2.5 rounded-xl border border-red-100">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  Scheduled Date
                </span>
                <span className="text-sm font-extrabold text-gray-900">
                  {scheduleDetails.formattedDate}
                </span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-2.5 rounded-xl border border-red-100">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  Required Time
                </span>
                <span className="text-sm font-extrabold text-red-700">
                  {scheduleDetails.formattedTime}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 text-xs">
            <div className="bg-gray-50 p-3 sm:p-4 rounded-2xl">
              <p className="text-gray-600 font-semibold mb-1 text-[11px]">
                Blood Group Needed
              </p>
              <BloodBadge group={bloodGroup} size="sm" />
            </div>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-2xl">
              <p className="text-gray-600 font-semibold mb-1 text-[11px]">
                Hospital / Clinic
              </p>
              <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                {hospital}
              </p>
            </div>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-2xl">
              <p className="text-gray-600 font-semibold mb-1 text-[11px]">
                Location
              </p>
              <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                {district}, {state}
              </p>
            </div>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-2xl">
              <p className="text-gray-600 font-semibold mb-1 text-[11px]">
                Units Required
              </p>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {unitsNeeded} Unit{unitsNeeded > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {notes && (
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
              <p className="font-bold text-gray-700 mb-0.5">Clinical Notes:</p>
              <p className="text-gray-600">{notes}</p>
            </div>
          )}

          {/* Real-time Match Reach Box */}
          <div
            className={`p-3.5 rounded-2xl border ${
              matchCount > 0
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : "bg-amber-50 border-amber-200 text-amber-950"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>
                {matchCount > 0
                  ? `${matchCount} eligible volunteer donor${
                      matchCount > 1 ? "s" : ""
                    } found in ${district}, ${state}`
                  : `0 donors found in ${district} right now`}
              </span>
            </div>
            <p className="text-[11px] mt-1 opacity-90">
              {matchCount > 0
                ? "Matched donors will receive an instant push alert, situational email with the scheduled time, and alarm notification."
                : "Your request will stay active on the emergency board and match when donors become available."}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 sm:py-3.5 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-red-200 flex items-center justify-center gap-2"
          >
            <Droplet className="w-4 h-4 fill-white" />
            <span>Submit Blood Request & Alert Donors</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-rose-900 rounded-3xl p-5 sm:p-8 text-white shadow-xl mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-xl bg-white/20">
            <Droplet className="w-4 h-4 text-red-200 fill-red-200" />
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-200">
            Donor Matching Engine
          </span>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-1"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Request Blood for Patient
        </h1>
        <p className="text-red-100 text-xs sm:text-sm">
          Plan, schedule, or broadcast immediate emergency blood requirements to
          verified donors in your district.
        </p>
      </div>

      <form
        onSubmit={handlePreview}
        className="bg-white rounded-3xl border border-red-100 shadow-sm p-4 sm:p-6 space-y-5 sm:space-y-6"
      >
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Patient Name */}
        <div>
          <label
            htmlFor="patientName"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
          >
            Patient Full Name *
          </label>
          <input
            id="patientName"
            name="patientName"
            type="text"
            value={patientName}
            onChange={(e) => {
              setPatientName(e.target.value)
              if (error) setError("")
            }}
            placeholder="e.g. Anjali Menon"
            required
            className={`w-full px-4 py-3.5 bg-gray-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition ${
              error && !patientName.trim()
                ? "border-red-500 ring-2 ring-red-300 bg-red-50/40 text-red-950"
                : "border-gray-200 focus:ring-red-400 focus:bg-white"
            }`}
          />
          {error && !patientName.trim() && (
            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Please enter the patient's
              full name to proceed
            </p>
          )}
        </div>

        {/* Blood Group Required */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Required Blood Group *
            </span>
            <span className="text-xs text-gray-500">
              Compatible with donors:{" "}
              <span className="font-bold text-red-700">
                {compatibleTypes.join(", ")}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {BLOOD_GROUPS.map((g) => {
              const isSelected = bloodGroup === g
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setBloodGroup(g)}
                  className={`py-3 rounded-2xl font-black text-sm transition-colors duration-150 flex flex-col items-center justify-center border-2 ${
                    isSelected
                      ? "bg-red-700 border-red-700 text-white shadow-md shadow-red-200 scale-105"
                      : "bg-white border-gray-200 text-gray-700 hover:border-red-300"
                  }`}
                >
                  <span>{g}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Urgency Level */}
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Urgency Level *
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {urgencies.map((u) => {
              const isSelected = urgency === u.val
              return (
                <button
                  key={u.val}
                  type="button"
                  onClick={() => handleUrgencySelect(u.val)}
                  className={`p-4 rounded-2xl border-2 text-left transition-colors duration-150 flex flex-col justify-between ${
                    isSelected
                      ? u.val === "critical"
                        ? "bg-red-700 border-red-700 text-white shadow-md shadow-red-200"
                        : u.val === "urgent"
                          ? "bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-200"
                          : "bg-emerald-700 border-emerald-700 text-white shadow-md"
                      : "bg-white border-gray-200 text-gray-700 hover:border-red-300"
                  }`}
                >
                  <span className="font-bold text-sm">{u.label}</span>
                  <span
                    className={`text-[11px] mt-1 ${
                      isSelected ? "opacity-90" : "text-gray-600"
                    }`}
                  >
                    {u.desc}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NEW SECTION: When is Blood Required? (Date, Day & Time Scheduling) */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-3xl bg-red-50/50 border-2 border-red-200/80 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-950">
                When is Blood Wanted / Planned? (Date & Time) *
              </span>
            </div>
            <span className="text-[11px] font-semibold text-gray-600">
              Day & Time are automatically computed
            </span>
          </div>

          {/* Quick Schedule Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => {
                setScheduleType("immediate")
                setUrgency("critical")
              }}
              className={`p-3 rounded-2xl border-2 text-xs font-bold text-center transition flex flex-col items-center justify-center gap-1 ${
                scheduleType === "immediate"
                  ? "bg-red-700 border-red-700 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-red-300"
              }`}
            >
              <span className="flex items-center gap-1">
                ⚡ Immediate / ASAP
              </span>
              <span
                className={`text-[10px] font-normal ${
                  scheduleType === "immediate"
                    ? "text-red-100"
                    : "text-gray-500"
                }`}
              >
                Within 1–4 hrs
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScheduleType("today")
                setNeededDate(getTodayDateString())
              }}
              className={`p-3 rounded-2xl border-2 text-xs font-bold text-center transition flex flex-col items-center justify-center gap-1 ${
                scheduleType === "today"
                  ? "bg-red-700 border-red-700 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-red-300"
              }`}
            >
              <span>📅 Today</span>
              <span
                className={`text-[10px] font-normal ${
                  scheduleType === "today" ? "text-red-100" : "text-gray-500"
                }`}
              >
                Specific time today
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScheduleType("tomorrow")
                setNeededDate(getTomorrowDateString())
              }}
              className={`p-3 rounded-2xl border-2 text-xs font-bold text-center transition flex flex-col items-center justify-center gap-1 ${
                scheduleType === "tomorrow"
                  ? "bg-red-700 border-red-700 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-red-300"
              }`}
            >
              <span>🌅 Tomorrow</span>
              <span
                className={`text-[10px] font-normal ${
                  scheduleType === "tomorrow" ? "text-red-100" : "text-gray-500"
                }`}
              >
                Specific time tomorrow
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScheduleType("scheduled")
                setNeededDate(getTomorrowDateString())
              }}
              className={`p-3 rounded-2xl border-2 text-xs font-bold text-center transition flex flex-col items-center justify-center gap-1 ${
                scheduleType === "scheduled"
                  ? "bg-red-700 border-red-700 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-red-300"
              }`}
            >
              <span>🗓️ Planned / Scheduled</span>
              <span
                className={`text-[10px] font-normal ${
                  scheduleType === "scheduled"
                    ? "text-red-100"
                    : "text-gray-500"
                }`}
              >
                Select future date
              </span>
            </button>
          </div>

          {/* Date & Time Input Row */}
          {scheduleType !== "immediate" && (
            <div className="bg-white p-4 rounded-2xl border border-red-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date Picker (enabled for 'scheduled' or shows fixed date for today/tomorrow) */}
                <div>
                  <label
                    htmlFor="neededDate"
                    className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5 text-red-600" />
                    <span>Required Date *</span>
                  </label>
                  <input
                    id="neededDate"
                    name="neededDate"
                    type="date"
                    min={getTodayDateString()}
                    value={scheduleDetails.neededDate}
                    disabled={
                      scheduleType === "today" || scheduleType === "tomorrow"
                    }
                    onChange={(e) => setNeededDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-75 disabled:bg-gray-100"
                  />
                </div>

                {/* Time Picker */}
                <div>
                  <label
                    htmlFor="neededTime"
                    className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    <span>Required Time *</span>
                  </label>
                  <input
                    id="neededTime"
                    name="neededTime"
                    type="time"
                    value={neededTime}
                    onChange={(e) => setNeededTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>

              {/* Quick Time Presets */}
              <div>
                <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                  Quick Time Shortcuts:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setQuickTimeOffset(1)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 rounded-lg text-[11px] font-semibold transition"
                  >
                    +1 Hour
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTimeOffset(2)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 rounded-lg text-[11px] font-semibold transition"
                  >
                    +2 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTimeOffset(4)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 rounded-lg text-[11px] font-semibold transition"
                  >
                    +4 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setNeededTime("10:00")}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 rounded-lg text-[11px] font-semibold transition"
                  >
                    Morning (10:00 AM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNeededTime("14:30")}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 rounded-lg text-[11px] font-semibold transition"
                  >
                    Afternoon (02:30 PM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNeededTime("18:00")}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 rounded-lg text-[11px] font-semibold transition"
                  >
                    Evening (06:00 PM)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Live Calculated Schedule Badge */}
          <div className="p-3.5 rounded-2xl bg-white border border-red-200 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-gray-500">
                  Calculated Needed Schedule
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-red-950">
                  {scheduleDetails.displayBadge}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-red-50 text-red-800 border border-red-200">
              {scheduleDetails.dayOfWeek}
            </span>
          </div>
        </div>

        {/* State & District Cascading Select */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="requestState"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
            >
              State (India) *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-red-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                id="requestState"
                name="state"
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition font-medium"
              >
                {INDIAN_STATES_AND_DISTRICTS.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="requestDistrict"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
            >
              District ({state}) *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-red-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                id="requestDistrict"
                name="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition font-medium"
              >
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Hospital */}
        <div>
          <label
            htmlFor="hospitalName"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
          >
            Hospital / Clinic Name *
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-red-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="hospitalName"
              name="hospital"
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="e.g. Aster Medcity, Kochi or Medical College Ward 3"
              required
              className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Units Needed & Clinical Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="unitsNeeded"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
            >
              Units Needed
            </label>
            <select
              id="unitsNeeded"
              name="unitsNeeded"
              value={unitsNeeded}
              onChange={(e) => setUnitsNeeded(Number(e.target.value))}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition font-medium"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} Unit{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="requestNotes"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
            >
              Special Instructions / Notes
            </label>
            <input
              id="requestNotes"
              name="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Scheduled elective surgery, please reach 30 mins before transfusion"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Live Reach Indicator */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            currentEligible.length > 0
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-amber-50/80 border-amber-200 text-amber-950"
          }`}
        >
          <div className="text-xs">
            <div className="flex items-center gap-2 font-bold">
              <Users
                className={`w-4 h-4 ${
                  currentEligible.length > 0
                    ? "text-emerald-700"
                    : "text-amber-700"
                }`}
              />
              <span>
                {currentEligible.length > 0
                  ? `${currentEligible.length} Verified ${bloodGroup} compatible donor${
                      currentEligible.length > 1 ? "s" : ""
                    } ready in ${district}`
                  : `0 direct donors currently in ${district}`}
              </span>
            </div>
            <p className="text-[11px] mt-0.5 opacity-85">
              {currentEligible.length > 0
                ? "Donors will receive real-time push alerts, emergency sound chime, and situational emails upon submission."
                : `Your request will be broadcasted to all active donors across ${state} and displayed on the emergency board.`}
            </p>
          </div>
          <span
            className={`text-xs font-black px-2.5 py-1.5 rounded-xl border flex-shrink-0 ${
              currentEligible.length > 0
                ? "bg-white text-emerald-800 border-emerald-200 shadow-xs"
                : "bg-white text-amber-800 border-amber-200 shadow-xs"
            }`}
          >
            {currentEligible.length} Donors Found
          </span>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold rounded-2xl text-sm sm:text-base transition shadow-lg shadow-red-200 flex items-center justify-center gap-2"
        >
          <span>Preview & Match Donors</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
