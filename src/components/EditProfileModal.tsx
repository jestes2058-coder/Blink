import { useState, useRef } from "react"
import {
  X,
  Camera,
  Upload,
  User,
  Phone,
  Mail,
  MapPin,
  Droplet,
  Heart,
  CheckCircle2,
  Trash2,
  ShieldCheck,
} from "lucide-react"
import type { BloodGroup, CurrentUser, Donor } from "../types"
import { BLOOD_GROUPS, store } from "../store"
import {
  INDIAN_STATES_AND_DISTRICTS,
  getDistrictsForState,
  DEFAULT_STATE,
} from "../data/indianLocations"
import UserAvatar from "./UserAvatar"

interface Props {
  user: CurrentUser
  donorProfile?: Donor | null
  onClose: () => void
  onSaved: (updatedUser: CurrentUser) => void
  onToast: (
    type: "success" | "info" | "warning" | "error",
    title: string,
    message: string,
  ) => void
}

export default function EditProfileModal({
  user,
  donorProfile,
  onClose,
  onSaved,
  onToast,
}: Props) {
  const [name, setName] = useState(user.name || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [email, setEmail] = useState(user.email || "")
  const [avatar, setAvatar] = useState<string | undefined>(
    user.avatar || donorProfile?.avatar,
  )
  const [state, setState] = useState(
    user.state || donorProfile?.state || DEFAULT_STATE,
  )
  const [district, setDistrict] = useState(
    user.district || donorProfile?.district || "Ernakulam",
  )
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(
    user.bloodGroup || donorProfile?.bloodGroup || "O+",
  )
  const [isDonor, setIsDonor] = useState(Boolean(donorProfile || user.isDonor))
  const [available, setAvailable] = useState(donorProfile?.available ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const availableDistricts = getDistrictsForState(state)

  function handleStateChange(newState: string) {
    setState(newState)
    const dists = getDistrictsForState(newState)
    if (!dists.includes(district)) {
      setDistrict(dists[0] || "")
    }
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo size exceeds 5MB. Please choose a smaller image.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        // Compress image using canvas
        const canvas = document.createElement("canvas")
        const MAX_DIM = 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width)
            width = MAX_DIM
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height)
            height = MAX_DIM
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85)
          setAvatar(compressedDataUrl)
          setError("")
        }
      }
      img.src = (event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError("Please enter your full name.")
    if (!phone.trim())
      return setError("Please enter your verified phone number.")

    setError("")
    setIsSaving(true)

    try {
      // 1. Update Current User
      const updatedUser: CurrentUser = {
        ...user,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        avatar: avatar || undefined,
        state,
        district,
        bloodGroup,
        isDonor,
      }

      await store.saveUserProfile(updatedUser, isDonor, available)
      onSaved(updatedUser)
      onToast(
        "success",
        "Profile Updated",
        "Your profile details and photo have been saved successfully.",
      )
      onClose()
    } catch (err) {
      setError("Failed to save profile changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-red-700 via-red-800 to-rose-700 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-red-200" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                Edit Profile & Photo
              </h3>
              <p className="text-[11px] text-red-100">
                Update your name, photo, location & donor settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSave}
          className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
              {error}
            </div>
          )}

          {/* Profile Photo Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative group">
              <UserAvatar
                src={avatar}
                name={name || "User"}
                size="xl"
                bloodGroup={bloodGroup}
                showBadge
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile photo"
                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <p className="text-xs font-bold text-gray-800">Profile Photo</p>
              <p className="text-[11px] text-gray-500">
                Visible to blood recipients and emergency donors during
                matching.
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar(undefined)}
                    className="px-3 py-1.5 bg-white border border-gray-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-50 flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                id="editProfilePhotoFileInput"
                name="photoFile"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="editProfileName"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  id="editProfileName"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="editProfilePhone"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  id="editProfilePhone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="editProfileEmail"
              className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                id="editProfileEmail"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Indian State & District Cascading Select */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="editProfileState"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                State (India) *
              </label>
              <select
                id="editProfileState"
                name="state"
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-none font-medium"
              >
                {INDIAN_STATES_AND_DISTRICTS.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="editProfileDistrict"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                District ({state}) *
              </label>
              <select
                id="editProfileDistrict"
                name="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-none font-medium"
              >
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Blood Group Selection */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Blood Group *
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {BLOOD_GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setBloodGroup(g)}
                  className={`py-2 rounded-xl text-xs font-black border-2 transition ${
                    bloodGroup === g
                      ? "bg-red-700 border-red-700 text-white shadow-md"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:border-red-300"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Volunteer Donor Options */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="editIsDonor"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Volunteer Blood Donor
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Listed in district directory for emergency requests
                  </p>
                </div>
              </label>
              <input
                id="editIsDonor"
                name="isDonor"
                type="checkbox"
                checked={isDonor}
                onChange={(e) => setIsDonor(e.target.checked)}
                className="w-5 h-5 accent-red-700 rounded-lg cursor-pointer"
              />
            </div>

            {isDonor && (
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <label
                  htmlFor="editIsAvailable"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Currently Available to Donate
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Uncheck if temporarily traveling or unwell
                    </p>
                  </div>
                </label>
                <input
                  id="editIsAvailable"
                  name="available"
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-red-200 transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSaving ? "Saving Changes..." : "Save Profile Details"}
                </span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 border border-gray-200 text-gray-700 font-bold text-xs rounded-2xl hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (
                  window.confirm(
                    "Are you sure you want to completely clear all database records, donors, and requests?",
                  )
                ) {
                  await store.clearAllData()
                  onToast(
                    "info",
                    "Database Cleared",
                    "All local and Supabase records have been wiped clean.",
                  )
                  window.location.reload()
                }
              }}
              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" /> Clear All Database
              & Records
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
