import React from "react"
import { Wifi, Battery, Signal, Sparkles } from "lucide-react"

interface Props {
  children: React.ReactNode
  isMobileSimulator: boolean
}

export default function MobileSimulatorFrame({
  children,
  isMobileSimulator,
}: Props) {
  if (!isMobileSimulator) {
    return <>{children}</>
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="min-h-screen bg-gray-950 py-4 px-2 sm:px-6 flex flex-col items-center justify-center">
      {/* Title info above device */}
      <div className="mb-2.5 text-center text-xs text-gray-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-red-500" />
        <span>Mobile App Simulator Preview (iPhone 16 Canvas)</span>
      </div>

      {/* Device Body Container */}
      <div className="w-full max-w-[400px] h-[840px] max-h-[92vh] bg-black rounded-[48px] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.8)] border-4 border-gray-800 flex flex-col relative overflow-hidden">
        {/* Inner Screen */}
        <div className="w-full h-full bg-[#FFF8F8] rounded-[38px] overflow-hidden flex flex-col relative border border-gray-900/10">
          {/* iOS Top Status Bar & Dynamic Island */}
          <div className="h-10 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between z-50 flex-shrink-0 text-gray-900 border-b border-red-50">
            <span className="text-[12px] font-bold tracking-tight">
              {timeStr}
            </span>

            {/* Dynamic Island Pill */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto" />

            {/* Icons */}
            <div className="flex items-center gap-1.5 text-gray-800">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Scrollable App Screen Content */}
          <div className="flex-1 overflow-y-auto relative scroll-smooth flex flex-col">
            {children}
          </div>

          {/* iOS Bottom Home Indicator Bar */}
          <div className="h-4 bg-white/95 backdrop-blur-md flex items-center justify-center z-50 flex-shrink-0">
            <div className="w-28 h-1 bg-gray-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
