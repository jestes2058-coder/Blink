import { useState } from "react"

import {
  Droplet,
  ArrowRight,
  ArrowLeft,
  Info,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react"

import type { BloodGroup } from "../types"

import {
  BLOOD_GROUPS,
  COMPATIBLE_DONORS,
  COMPATIBLE_RECIPIENTS,
} from "../store"

import BloodBadge from "./BloodBadge"

export default function CompatibilityMatrix() {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>("O+")

  const [activeTab, setActiveTab] = useState<"donate" | "receive">("donate")

  const recipients = COMPATIBLE_RECIPIENTS[selectedGroup] || []

  const donors = COMPATIBLE_DONORS[selectedGroup] || []

  const isUniversalDonor = selectedGroup === "O-"

  const isUniversalRecipient = selectedGroup === "AB+"

  return (
    <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-5 sm:p-7">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-red-100 text-red-700">
              <Droplet className="w-4 h-4 fill-red-600 text-red-600" />
            </span>
            <h2
              className="text-lg sm:text-xl font-bold text-gray-900"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Blood Group Compatibility Explorer
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Select any blood group to instantly check medical transfusion
            compatibility.
          </p>
        </div>
      </div>

      {/* Blood Group Selectors */}
      <div className="mb-6">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5 block">
          Choose Blood Group
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {BLOOD_GROUPS.map((group) => {
            const isSelected = selectedGroup === group

            return (
              <button
                key={group}
                type="button"
                onClick={() => setSelectedGroup(group)}
                className={`py-3 px-2 rounded-2xl font-black text-sm transition-colors transition-transform duration-150 flex flex-col items-center justify-center gap-1 border-2 ${
                  isSelected
                    ? "bg-red-700 border-red-700 text-white shadow-md shadow-red-200 ring-2 ring-red-400 ring-offset-2 scale-105"
                    : "bg-white border-gray-200 text-gray-800 hover:border-red-300"
                }`}
              >
                <span>{group}</span>
                <span
                  className={`text-[9px] font-normal leading-tight ${
                    isSelected ? "text-red-100" : "text-gray-600"
                  }`}
                >
                  {group === "O-"
                    ? "Univ. Donor"
                    : group === "AB+"
                      ? "Univ. Recipient"
                      : "Type"}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Special callout banner for O- and AB+ */}
      {isUniversalDonor && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-yellow-300 flex-shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Universal Red Cell Donor:</span> O-
            blood can be safely transfused to patients of ANY blood group!
            Crucial for emergency trauma surgeries.
          </div>
        </div>
      )}

      {isUniversalRecipient && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-md flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-yellow-300 flex-shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Universal Recipient:</span> AB+
            individuals can safely receive red blood cells from ANY blood group
            donor!
          </div>
        </div>
      )}

      {/* Tab switch for Can Give vs Can Receive */}
      <div className="flex border-b border-gray-100 mb-6">
        <button
          onClick={() => setActiveTab("donate")}
          className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${
            activeTab === "donate"
              ? "border-red-700 text-red-700"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          <ArrowRight className="w-4 h-4" /> If You Have {selectedGroup} (Can
          Give To)
        </button>
        <button
          onClick={() => setActiveTab("receive")}
          className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${
            activeTab === "receive"
              ? "border-red-700 text-red-700"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> If You Need {selectedGroup} (Can
          Receive From)
        </button>
      </div>

      {/* Matrix Result Card */}
      {activeTab === "donate" ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Compatible Recipient Groups ({recipients.length} of 8 groups)
            </p>
            <span className="text-xs text-gray-400">
              {recipients.length === 8
                ? "Universal Donor"
                : `${recipients.join(", ")}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BLOOD_GROUPS.map((target) => {
              const isCompatible = recipients.includes(target)

              return (
                <div
                  key={target}
                  className={`p-3.5 rounded-2xl border transition-colors flex items-center justify-between ${
                    isCompatible
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-sm"
                      : "bg-gray-50/60 border-gray-100 text-gray-400 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isCompatible
                          ? "bg-emerald-200 text-emerald-900"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {target}
                    </span>
                    <span className="text-xs font-semibold">{target}</span>
                  </div>
                  {isCompatible ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />{" "}
                      Match
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-gray-400 flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-gray-400" /> Incompatible
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Eligible Donor Groups ({donors.length} of 8 groups)
            </p>
            <span className="text-xs text-gray-400">
              {donors.length === 8
                ? "Universal Recipient"
                : `${donors.join(", ")}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BLOOD_GROUPS.map((target) => {
              const isCompatible = donors.includes(target)

              return (
                <div
                  key={target}
                  className={`p-3.5 rounded-2xl border transition-colors flex items-center justify-between ${
                    isCompatible
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-sm"
                      : "bg-gray-50/60 border-gray-100 text-gray-400 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isCompatible
                          ? "bg-emerald-200 text-emerald-900"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {target}
                    </span>
                    <span className="text-xs font-semibold">{target}</span>
                  </div>
                  {isCompatible ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />{" "}
                      Match
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-gray-400 flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-gray-400" /> Incompatible
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick advice note */}
      <div className="mt-5 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-2.5 text-xs text-gray-600">
        <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-gray-800">
            Hospital Protocol Note:
          </span>{" "}
          In urgent medical situations, exact group matching is prioritized, but
          universal compatibility rules enable emergency cross-group
          transfusions when local supply is scarce.
        </p>
      </div>
    </div>
  )
}
