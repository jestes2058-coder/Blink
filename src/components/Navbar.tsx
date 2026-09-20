import { useState } from "react"
import {
  Heart,
  Droplet,
  Search,
  Bell,
  Users,
  GitCompare,
  CheckCircle,
  Building2,
  LogOut,
  Menu,
  X,
  Award,
  User,
  Edit3,
} from "lucide-react"
import type { CurrentUser, View } from "../types"
import { store } from "../store"
import UserAvatar from "./UserAvatar"

interface Props {
  user: CurrentUser
  currentView: View
  setView: (v: View) => void
  onLogout: () => void
  onOpenSOS: () => void
  onOpenEditProfile: () => void
  pendingAlertsCount: number
}

export default function Navbar({
  user,
  currentView,
  setView,
  onLogout,
  onOpenSOS,
  onOpenEditProfile,
  pendingAlertsCount,
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const donors = store.getDonors()
  const myProfile = donors.find(
    (d) =>
      d.phone === user.phone ||
      d.id === user.id ||
      (user.email && d.email === user.email),
  )

  const navLinks: { view: View; label: string; icon: any; badge?: number }[] = [
    { view: "home", label: "Dashboard", icon: Heart },
    { view: "request-blood", label: "Request Blood", icon: Droplet },
    { view: "my-requests", label: "My Requests", icon: Search },
    {
      view: "notifications",
      label: "Alerts",
      icon: Bell,
      badge: pendingAlertsCount,
    },
    { view: "donors-directory", label: "Find Donors", icon: Users },
    { view: "compatibility", label: "Blood Matrix", icon: GitCompare },
    { view: "eligibility-quiz", label: "Check Eligibility", icon: CheckCircle },
    { view: "blood-banks", label: "Blood Banks", icon: Building2 },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-red-100 shadow-sm w-full">
      {/* Main Navbar */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => {
                setView("home")
                setMobileMenuOpen(false)
              }}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-red-700 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-200 group-hover:scale-105 transition-transform flex-shrink-0">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-lg sm:text-xl font-bold text-red-900 tracking-tight leading-none"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  B-Link
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-red-600 tracking-wider uppercase leading-tight mt-0.5">
                  Community Match
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav
              className="hidden lg:flex items-center gap-1 ml-2"
              aria-label="Primary Navigation"
            >
              {navLinks.slice(0, 6).map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.view
                return (
                  <button
                    key={item.view}
                    onClick={() => setView(item.view)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 relative focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none ${
                      isActive
                        ? "bg-red-50 text-red-700 font-extrabold"
                        : "text-gray-600 hover:text-red-700 hover:bg-red-50/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                )
              })}

              <button
                onClick={() => setView("eligibility-quiz")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none ${
                  currentView === "eligibility-quiz"
                    ? "bg-red-50 text-red-700"
                    : "text-gray-600 hover:text-red-700"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Eligibility</span>
              </button>
              <button
                onClick={() => setView("blood-banks")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none ${
                  currentView === "blood-banks"
                    ? "bg-red-50 text-red-700"
                    : "text-gray-600 hover:text-red-700"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Blood Banks</span>
              </button>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* SOS Emergency Button */}
            <button
              onClick={onOpenSOS}
              aria-label="Trigger Emergency SOS Blood Broadcast"
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-[11px] sm:text-xs font-extrabold rounded-xl shadow-md shadow-red-200 flex items-center gap-1 transition active:scale-95 animate-pulse focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
            >
              <Droplet className="w-3.5 h-3.5 fill-white" />
              <span>SOS</span>
            </button>

            {/* Desktop Active User Profile Badge */}
            <button
              onClick={onOpenEditProfile}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-xs transition text-left group focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
              title="Click to edit profile & photo"
              aria-label={`Open profile settings for ${user.name}`}
            >
              <UserAvatar
                src={user.avatar || myProfile?.avatar}
                name={user.name}
                size="sm"
                bloodGroup={user.bloodGroup || myProfile?.bloodGroup}
              />
              <div className="max-w-[110px] truncate">
                <span className="font-bold text-gray-800 group-hover:text-red-700 block leading-tight truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Edit3 className="w-2.5 h-2.5 text-gray-400" />
                  {myProfile ? `${myProfile.bloodGroup} Donor` : "Edit Profile"}
                </span>
              </div>
            </button>

            {/* Sign Out Button (desktop) */}
            <button
              onClick={onLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="hidden sm:flex p-2 rounded-xl text-gray-600 hover:text-red-700 hover:bg-red-50 transition items-center gap-1 text-xs font-bold focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-red-700 hover:bg-red-50 transition relative focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu-drawer"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
              {pendingAlertsCount > 0 && !mobileMenuOpen && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-drawer"
          className="border-t border-red-100 bg-white/98 px-3.5 pt-3 pb-5 space-y-2.5 shadow-xl animate-in slide-in-from-top duration-200"
        >
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenEditProfile()
              }}
              className="flex items-center gap-2.5 min-w-0 text-left"
            >
              <UserAvatar
                src={user.avatar || myProfile?.avatar}
                name={user.name}
                size="md"
                bloodGroup={user.bloodGroup || myProfile?.bloodGroup}
              />
              <div className="min-w-0">
                <p className="font-bold text-xs text-gray-900 truncate flex items-center gap-1">
                  {user.name} <Edit3 className="w-3 h-3 text-red-600" />
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {user.email || "No email set"}
                </p>
                <p className="text-[10px] font-semibold text-red-700 truncate">
                  📞 {user.phone || "No phone set"}
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onLogout()
              }}
              className="px-2.5 py-1 text-red-700 hover:bg-red-50 font-bold text-xs rounded-lg flex-shrink-0"
            >
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.view
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    setView(item.view)
                    setMobileMenuOpen(false)
                  }}
                  className={`p-2.5 rounded-2xl text-left flex items-center gap-2 transition text-xs font-bold ${
                    isActive
                      ? "bg-red-700 text-white shadow-md shadow-red-200"
                      : "bg-gray-50 hover:bg-red-50 text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto px-1.5 py-0.2 rounded-full bg-white text-red-700 text-[9px] font-black">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="pt-1.5 border-t border-gray-100 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenEditProfile()
              }}
              className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-800 text-xs font-bold text-center border border-red-200 hover:bg-red-100 flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-red-700" />
              <span>Edit Profile & Photo</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
