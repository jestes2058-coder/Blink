import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react"

import type { ToastMessage } from "../types"

interface Props {
  toasts: ToastMessage[]

  onDismiss: (id: string) => void
}

export default function ToastContainer({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success"

        const isWarning = toast.type === "warning"

        const isError = toast.type === "error"

        const bgClass = isSuccess
          ? "bg-emerald-900/95 border-emerald-500 text-white"
          : isWarning
            ? "bg-amber-950/95 border-amber-500 text-white"
            : isError
              ? "bg-red-950/95 border-red-500 text-white"
              : "bg-gray-900/95 border-gray-600 text-white"

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-[opacity,transform] duration-200 transform translate-y-0 opacity-100 ${bgClass}`}
            role="alert"
          >
            <div className="flex-shrink-0 mt-0.5">
              {isSuccess && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
              {isWarning && (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              {isError && <XCircle className="w-5 h-5 text-red-400" />}
              {!isSuccess && !isWarning && !isError && (
                <Info className="w-5 h-5 text-blue-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                {toast.title}
              </p>
              <p className="text-sm font-medium mt-0.5 text-gray-100 leading-snug">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
