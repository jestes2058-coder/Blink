import { Cookie, CheckCircle2, Sliders, Shield, ArrowLeft } from "lucide-react"
import type { View } from "../types"

interface Props {
  setView: (v: View) => void
  onOpenCookieSettings?: () => void
}

export default function CookiePolicy({ setView, onOpenCookieSettings }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => setView("home")}
        className="inline-flex items-center gap-2 text-xs font-bold text-red-700 hover:text-red-800 transition focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-lg p-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-red-200 text-xs font-semibold backdrop-blur-md">
            <Cookie className="w-4 h-4 text-amber-300" />
            <span>ePrivacy & GDPR Cookie Transparency</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Cookie & Local Storage Policy
          </h1>
          <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
            Effective Date: September 19, 2026 · B-Link Community Health
            Foundation
          </p>
        </div>
      </div>

      {/* Main Cookie Content */}
      <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 sm:p-10 space-y-8 text-gray-800 text-sm leading-relaxed">
        {/* Quick Summary & Trigger */}
        <section
          aria-labelledby="cookie-intro"
          className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h2
              id="cookie-intro"
              className="font-bold text-amber-950 text-base mb-1"
            >
              Your Privacy Choices
            </h2>
            <p className="text-xs sm:text-sm text-amber-900">
              We do NOT use invasive cross-site advertising trackers. We only
              store essential session identifiers and your explicit preferences.
            </p>
          </div>
          {onOpenCookieSettings && (
            <button
              onClick={onOpenCookieSettings}
              className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 flex-shrink-0"
            >
              <Sliders className="w-4 h-4" /> Manage Cookie Settings
            </button>
          )}
        </section>

        {/* 1. What are Cookies and Local Storage? */}
        <section aria-labelledby="what-are-cookies" className="space-y-3">
          <h2 id="what-are-cookies" className="text-lg font-bold text-gray-900">
            1. What Are Cookies and Local Storage?
          </h2>
          <p>
            Cookies and browser LocalStorage are small text files or key-value
            records saved locally in your web browser. They enable web
            applications to maintain your login status, remember your selected
            district filter, and preserve user preferences across page reloads.
          </p>
        </section>

        {/* 2. Categories of Storage We Use */}
        <section aria-labelledby="categories-heading" className="space-y-4">
          <h2
            id="categories-heading"
            className="text-lg font-bold text-gray-900"
          >
            2. Categories of Storage Employed on B-Link
          </h2>

          <div className="space-y-3">
            {/* Essential */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strictly
                  Necessary Storage (Always Active)
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Required
                </span>
              </div>
              <p className="text-xs text-gray-600">
                These records are technically essential to operate the site
                safely. They keep you signed into your profile, record emergency
                requests locally during offline network disconnects, and save
                your cookie consent choice.
              </p>
              <div className="text-[11px] font-mono text-gray-500 bg-white p-2 rounded-lg border border-gray-200">
                Key Items: <code>blink_current_user</code>,{" "}
                <code>blink_cookie_consent</code>,{" "}
                <code>blink_audio_muted</code>
              </div>
            </div>

            {/* Functional */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" /> Functional
                  Preferences
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  User Configurable
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Remembers your last chosen Indian state/district filter in the
                Blood Banks directory and Donors Directory to avoid re-selecting
                on every session.
              </p>
            </div>

            {/* Analytics */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-600" /> Anonymous
                  Performance Telemetry
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Opt-In Only
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Disabled by default. If enabled, gathers aggregated page load
                speed and anonymous crash error telemetry to assist our
                volunteer engineering team. No personal or health data is ever
                transmitted.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Managing and Revoking Cookie Consent */}
        <section aria-labelledby="managing-cookies" className="space-y-3">
          <h2 id="managing-cookies" className="text-lg font-bold text-gray-900">
            3. How to Manage or Revoke Your Consent
          </h2>
          <p>
            You can change your consent choices at any time by clicking the{" "}
            <strong>"Cookie Settings"</strong> button in the footer of any page
            or by clearing your browser site data.
          </p>
          <p className="text-xs text-gray-600">
            Most modern web browsers (Chrome, Safari, Firefox, Edge) also
            provide native settings allowing you to block third-party cookies or
            delete stored LocalStorage records on tab close.
          </p>
        </section>

        {/* 4. Contact Us */}
        <section
          aria-labelledby="contact-cookies"
          className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2"
        >
          <h2
            id="contact-cookies"
            className="font-bold text-gray-900 text-base"
          >
            4. Cookie Queries
          </h2>
          <p className="text-xs text-gray-700">
            Questions regarding our storage practices may be directed to{" "}
            <a
              href="mailto:privacy@blink-blood.org"
              className="text-red-700 underline font-bold"
            >
              privacy@blink-blood.org
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
