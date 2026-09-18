import React from "react"
import {
  Flame,
  Droplet,
  MapPin,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  X,
  Phone,
  AlertTriangle,
} from "lucide-react"
import type { BloodRequest, BloodGroup } from "../types"
import { formatRequestSchedule } from "../utils/dateSchedule"
import BloodBadge from "./BloodBadge"
import UrgencyBadge from "./UrgencyBadge"
import UserAvatar from "./UserAvatar"

interface Props {
  request: BloodRequest
  onAccept: (req: BloodRequest) => void
  onDismiss: () => void
}

export default function IncomingRequestAlertModal({
  request,
  onAccept,
  onDismiss,
}: Props) {
  const isCritical = request.urgency === "critical"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-red-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border-2 ${
          isCritical
            ? "border-red-600 ring-4 ring-red-500/30"
            : "border-amber-500 ring-4 ring-amber-500/20"
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 sm:p-6 text-white relative ${
            isCritical
              ? "bg-gradient-to-r from-red-800 via-red-700 to-rose-800"
              : "bg-gradient-to-r from-amber-700 via-red-700 to-rose-700"
          }`}
        >
          <button
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-white/20 text-yellow-300">
              {isCritical ? (
                <Flame className="w-5 h-5 animate-pulse" />
              ) : (
                <Droplet className="w-5 h-5 fill-yellow-300" />
              )}
            </span>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-red-100">
              {isCritical
                ? "🚨 Area Emergency Blood Alert"
                : "🩸 Blood Needed in Your District"}
            </span>
          </div>

          <h3
            className="text-xl sm:text-2xl font-black tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            {request.bloodGroup} Needed for {request.patientName}
          </h3>
          <p className="text-xs text-red-100 mt-1">
            Broadcasted by <strong>{request.requestorName}</strong> in{" "}
            <strong>
              {request.district}
              {request.state ? `, ${request.state}` : ""}
            </strong>
          </p>
        </div>

        {/* Content Details */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <UserAvatar
                src={request.requestorAvatar}
                name={request.patientName}
                size="md"
              />
              <div>
                <p className="text-xs font-bold text-gray-900">
                  {request.patientName}
                </p>
                <p className="text-[11px] text-gray-500">
                  {request.unitsNeeded || 1} Unit(s) Required
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BloodBadge group={request.bloodGroup} size="lg" />
              <UrgencyBadge urgency={request.urgency} size="sm" />
            </div>
          </div>

          {/* Location & Hospital */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-600 flex-shrink-0" />
              <div className="truncate">
                <span className="text-gray-500 text-[10px] block">
                  Hospital / Clinic
                </span>
                <span className="font-bold text-gray-800 truncate block">
                  {request.hospital}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
              <div className="truncate">
                <span className="text-gray-500 text-[10px] block">
                  Location Area
                </span>
                <span className="font-bold text-gray-800 truncate block">
                  {request.district}
                  {request.state ? `, ${request.state}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* When Blood is Needed Badge */}
          <div className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200 text-xs space-y-1">
            <div className="flex items-center gap-2 text-red-950 font-bold">
              <Calendar className="w-4 h-4 text-red-700 flex-shrink-0" />
              <span>When Blood is Needed:</span>
            </div>
            <p className="text-red-900 font-extrabold text-sm pl-6">
              {formatRequestSchedule(
                request.requiredBy,
                request.neededDate,
                request.neededTime,
                request.urgency,
              )}
            </p>
          </div>

          {request.notes && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
              <strong className="text-gray-800">Notes:</strong> {request.notes}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              onClick={() => onAccept(request)}
              className="w-full sm:flex-1 py-3.5 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-red-200 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Review & Respond to Request</span>
            </button>
            <button
              onClick={onDismiss}
              className="w-full sm:w-auto px-5 py-3.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm rounded-2xl transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
