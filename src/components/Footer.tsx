import {
  Heart,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Scale,
  Cookie,
  FileText,
  HeartHandshake,
  AlertTriangle,
  Building2,
  Lock,
} from "lucide-react"
import type { View } from "../types"

interface Props {
  setView: (v: View) => void
  onOpenCookieSettings: () => void
}

export default function Footer({ setView, onOpenCookieSettings }: Props) {
  return (
    <footer
      className="w-full bg-stone-950 text-stone-300 pt-12 pb-8 border-t border-red-950/80 mt-12 text-xs"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Emergency Disclaimer Strip */}
        <div className="p-4 rounded-2xl bg-red-950/50 border border-red-800/40 text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <p className="text-xs leading-relaxed text-red-100">
              <strong className="text-white">Emergency Disclaimer:</strong> In
              life-threatening emergencies, do not wait for volunteer responses.
              Immediately dial <strong className="text-white">108 / 112</strong>{" "}
              (India) or <strong className="text-white">911</strong> (US/Intl).
            </p>
          </div>
          <a
            href="tel:108"
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs whitespace-nowrap transition flex-shrink-0 self-end sm:self-auto"
          >
            Emergency 108
          </a>
        </div>

        {/* 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Organization Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span
                className="text-lg font-bold text-white tracking-tight"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                B-Link
              </span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              B-Link Community Health Foundation is a registered non-profit
              health initiative facilitating district-level peer-to-peer
              volunteer blood matching with complete donor privacy.
            </p>
            <div className="pt-1 text-[11px] text-stone-400 space-y-0.5">
              <p>
                Non-Profit Reg No: <strong>KL/2024/0488219</strong>
              </p>
              <p>Zero-Fee Public Healthcare Service</p>
            </div>
          </div>

          {/* Col 2: Legal & Compliance Links */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-red-400" /> Legal & Governance
            </h3>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => {
                    setView("privacy-policy")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="hover:text-white transition flex items-center gap-1.5 text-left"
                >
                  <Lock className="w-3 h-3 text-emerald-400" /> Privacy Policy &
                  Data Protection
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView("terms-conditions")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="hover:text-white transition flex items-center gap-1.5 text-left"
                >
                  <FileText className="w-3 h-3 text-yellow-400" /> Terms &
                  Medical Disclaimers
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView("cookie-policy")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="hover:text-white transition flex items-center gap-1.5 text-left"
                >
                  <Cookie className="w-3 h-3 text-amber-400" /> Cookie & Local
                  Storage Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView("refund-policy")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="hover:text-white transition flex items-center gap-1.5 text-left"
                >
                  <HeartHandshake className="w-3 h-3 text-rose-400" /> Refund &
                  100% Free Service Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCookieSettings}
                  className="text-stone-300 hover:text-white font-semibold underline transition text-left"
                >
                  ⚙️ Manage Cookie Preferences
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-red-400" /> Community Tools
            </h3>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => {
                    setView("home")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="hover:text-white transition"
                >
                  Donor Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView("request-blood")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="hover:text-white transition"
                >
                  Request Emergency Blood
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView("eligibility-quiz")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="hover:text-white transition"
                >
                  Donor Eligibility Screener
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView("compatibility")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="hover:text-white transition"
                >
                  ABO/Rh Transfusion Matrix
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView("blood-banks")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="hover:text-white transition"
                >
                  District Blood Banks Directory
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Registered Business & Grievance Contact */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Business
              & Grievance Contact
            </h3>
            <div className="space-y-2 text-stone-400 text-[11px]">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  B-Link Foundation, 4th Floor, Tech Hub Tower, MG Road,
                  Ernakulam, Kerala 682016
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <a
                  href="mailto:support@blink-blood.org"
                  className="hover:text-white underline"
                >
                  support@blink-blood.org
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <a
                  href="mailto:grievance@blink-blood.org"
                  className="hover:text-white underline"
                >
                  grievance@blink-blood.org (DPO)
                </a>
              </div>
              <div className="pt-1 border-t border-stone-800 text-stone-400">
                <p>Commercial sale of blood is strictly prohibited by law.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Attribution Bar */}
        <div className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400">
          <p>
            © {new Date().getFullYear()} B-Link Community Health Foundation. All
            rights reserved. Open-source typography via Google Fonts (DM Serif
            Display & Outfit). Icons by Lucide (MIT).
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setView("privacy-policy")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="hover:text-stone-200 transition"
            >
              Privacy
            </button>
            <button
              onClick={() => {
                setView("terms-conditions")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="hover:text-stone-200 transition"
            >
              Terms
            </button>
            <button
              onClick={() => {
                setView("cookie-policy")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="hover:text-stone-200 transition"
            >
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
