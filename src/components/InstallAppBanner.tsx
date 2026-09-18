import { useState, useEffect } from 'react'
import { Download, Smartphone, X, CheckCircle2, Share, PlusSquare } from 'lucide-react'

interface Props {
  onInstall: () => void
  deferredPrompt: any
}

export default function InstallAppBanner({ onInstall, deferredPrompt }: Props) {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone)

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = sessionStorage.getItem('bd_pwa_dismissed')
    if (isDismissed) setDismissed(true)
  }, [])

  function handleDismiss() {
    setDismissed(true)
    sessionStorage.setItem('bd_pwa_dismissed', 'true')
  }

  if (dismissed || isStandalone) return null

  return (
    <>
      {/* Floating Bottom App Installation Bar */}
      <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-gradient-to-r from-red-900 to-rose-950 text-white rounded-3xl p-4 shadow-2xl border border-red-500/40 flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/20">
            <Smartphone className="w-6 h-6 text-red-200" />
          </div>
          <div>
            <p className="font-bold text-xs sm:text-sm text-white leading-tight">Install B-Link Mobile App</p>
            <p className="text-[11px] text-red-200 mt-0.5">Quick access & emergency alerts on your home screen</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {deferredPrompt ? (
            <button
              onClick={onInstall}
              className="px-3.5 py-2 bg-white text-red-900 font-bold text-xs rounded-xl shadow hover:bg-red-50 transition active:scale-95"
            >
              Install
            </button>
          ) : isIOS ? (
            <button
              onClick={() => setShowIOSPrompt(true)}
              className="px-3.5 py-2 bg-white text-red-900 font-bold text-xs rounded-xl shadow hover:bg-red-50 transition active:scale-95"
            >
              Get App
            </button>
          ) : (
            <button
              onClick={() => alert('To install on your phone: Tap your browser menu (⋮) and choose "Install App" or "Add to Home Screen".')}
              className="px-3.5 py-2 bg-white text-red-900 font-bold text-xs rounded-xl shadow hover:bg-red-50 transition active:scale-95"
            >
              Get App
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="p-1 text-white/60 hover:text-white rounded-lg"
            aria-label="Dismiss app banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-red-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Install on iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSPrompt(false)}
                aria-label="Close iOS install modal"
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Install B-Link directly to your iOS home screen for full offline capability and instant emergency alerts:
            </p>

            <div className="space-y-3 text-xs bg-red-50/60 p-4 rounded-2xl border border-red-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <span>Tap the Safari <strong>Share</strong> button <Share className="w-4 h-4 inline text-blue-600" /></span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-4 h-4 inline text-gray-700" /></span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <span>Tap <strong>Add</strong> in the top-right corner</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full py-3 bg-red-700 text-white font-bold text-xs rounded-2xl shadow hover:bg-red-800 transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
