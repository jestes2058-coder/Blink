import { Monitor, Smartphone, Download, Sparkles, Database } from 'lucide-react'
import { isSupabaseConfigured } from '../supabase'

interface Props {
  deviceMode: 'web' | 'mobile'
  onToggleMode: (mode: 'web' | 'mobile') => void
  onInstallClick: () => void
  onOpenDBModal: () => void
  canInstall: boolean
}

export default function DeviceModeBar({
  deviceMode,
  onToggleMode,
  onInstallClick,
  onOpenDBModal,
  canInstall,
}: Props) {
  return (
    <div className="bg-gray-900 text-white border-b border-gray-800 px-4 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-gray-300">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> View As:
          </span>

          <div className="inline-flex rounded-xl bg-gray-800 p-0.5 border border-gray-700">
            <button
              onClick={() => onToggleMode('web')}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                deviceMode === 'web'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Full Website</span>
            </button>

            <button
              onClick={() => onToggleMode('mobile')}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                deviceMode === 'mobile'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App Simulator</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Cloud Database Setup Button */}
          <button
            onClick={onOpenDBModal}
            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition border border-gray-700"
          >
            <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-emerald-400' : 'text-blue-400'}`} />
            <span>{isSupabaseConfigured ? 'Cloud Database: Connected' : 'Setup Cloud Database'}</span>
          </button>

          {canInstall && (
            <button
              onClick={onInstallClick}
              className="px-2.5 py-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
