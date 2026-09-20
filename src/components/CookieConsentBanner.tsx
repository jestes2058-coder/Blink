import { useState, useEffect } from "react"
import {
  Cookie,
  Shield,
  Check,
  X,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

export interface CookiePreferences {
  essential: boolean // always true
  functional: boolean
  analytics: boolean
  timestamp: number
}

const STORAGE_KEY = "blink_cookie_consent_v2"

export function getStoredCookieConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CookiePreferences
  } catch {
    return null
  }
}

export function saveStoredCookieConsent(prefs: CookiePreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // Storage quota or private browsing fallback
  }
}

interface Props {
  isOpenModal?: boolean
  onCloseModal?: () => void
  onOpenPrivacyPolicy?: () => void
  onOpenCookiePolicy?: () => void
}

export default function CookieConsentBanner({
  isOpenModal = false,
  onCloseModal,
  onOpenPrivacyPolicy,
  onOpenCookiePolicy,
}: Props) {
  const [hasDecided, setHasDecided] = useState(true)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: false,
    timestamp: Date.now(),
  })

  useEffect(() => {
    const stored = getStoredCookieConsent()
    if (!stored) {
      setHasDecided(false)
    } else {
      setPreferences(stored)
      setHasDecided(true)
    }
  }, [])

  useEffect(() => {
    if (isOpenModal) {
      setShowPreferencesModal(true)
    }
  }, [isOpenModal])

  function handleAcceptAll() {
    const allOn: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      timestamp: Date.now(),
    }
    setPreferences(allOn)
    saveStoredCookieConsent(allOn)
    setHasDecided(true)
    setShowPreferencesModal(false)
    if (onCloseModal) onCloseModal()
  }

  function handleRejectNonEssential() {
    const essentialOnly: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      timestamp: Date.now(),
    }
    setPreferences(essentialOnly)
    saveStoredCookieConsent(essentialOnly)
    setHasDecided(true)
    setShowPreferencesModal(false)
    if (onCloseModal) onCloseModal()
  }

  function handleSaveCustom() {
    const custom: CookiePreferences = {
      ...preferences,
      essential: true,
      timestamp: Date.now(),
    }
    saveStoredCookieConsent(custom)
    setHasDecided(true)
    setShowPreferencesModal(false)
    if (onCloseModal) onCloseModal()
  }

  // Banner at the bottom of the page
  const showBanner = !hasDecided && !showPreferencesModal

  return (
    <>
      {/* 1. Cookie Notice Banner */}
      {showBanner && (
        <aside
          role="region"
          aria-label="Cookie and Privacy Consent Banner"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-white/95 backdrop-blur-md border-t border-red-200 shadow-2xl animate-in slide-in-from-bottom duration-300"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-sm">
                  We respect your privacy & data choices
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  B-Link uses strictly necessary cookies to keep you signed in
                  and enable emergency transfusion alerts. We do not track you
                  across other websites or sell your data. You can customize
                  your preferences or read our{" "}
                  <button
                    onClick={onOpenCookiePolicy}
                    className="text-red-700 underline font-semibold hover:text-red-800"
                  >
                    Cookie Policy
                  </button>{" "}
                  and{" "}
                  <button
                    onClick={onOpenPrivacyPolicy}
                    className="text-red-700 underline font-semibold hover:text-red-800"
                  >
                    Privacy Policy
                  </button>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs transition flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
              >
                <Sliders className="w-3.5 h-3.5" /> Customize
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md shadow-red-200 transition focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
              >
                Accept All
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Granular Preference Management Modal */}
      {showPreferencesModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-red-100 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center flex-shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2
                    id="cookie-modal-title"
                    className="text-lg font-bold text-gray-900"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    Cookie & Storage Preferences
                  </h2>
                  <p className="text-xs text-gray-500">
                    Customize your data storage settings.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPreferencesModal(false)
                  if (onCloseModal) onCloseModal()
                }}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                aria-label="Close cookie preferences"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-gray-700">
              {/* Category 1: Strictly Necessary */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{" "}
                    Strictly Necessary
                  </span>
                  <p className="text-gray-600 leading-relaxed">
                    Essential for secure authentication, emergency broadcasts,
                    and offline request caching. Cannot be disabled.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  aria-label="Strictly Necessary Cookies (Always Active)"
                  className="mt-1 h-4 w-4 rounded text-red-600 cursor-not-allowed opacity-80"
                />
              </div>

              {/* Category 2: Functional */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-gray-900 block">
                    Functional & Geographic Preferences
                  </span>
                  <p className="text-gray-600 leading-relaxed">
                    Saves your chosen district search filters and audio alarm
                    preferences between visits.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        functional: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-700"></div>
                </label>
              </div>

              {/* Category 3: Analytics */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-gray-900 block">
                    Anonymous Performance Telemetry
                  </span>
                  <p className="text-gray-600 leading-relaxed">
                    Helps our non-profit volunteer engineers diagnose page
                    performance bottlenecks without identifying individuals.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        analytics: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-700"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="flex-1 py-3 px-3 rounded-2xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs transition"
              >
                Reject All Non-Essential
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="flex-1 py-3 px-3 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md transition"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
