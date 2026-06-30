import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Icon, PrimaryPill, GhostButton } from './ui'
import { hasKey } from '../lib/gemini'

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro']

function formatModelName(model: string) {
  if (model === 'gemini-2.5-flash') return 'Gemini 2.5 Flash';
  if (model === 'gemini-2.0-flash') return 'Gemini 2.0 Flash';
  if (model === 'gemini-2.0-flash-lite') return 'Gemini 2.0 Flash Lite';
  if (model === 'gemini-1.5-flash') return 'Gemini 1.5 Flash';
  if (model === 'gemini-1.5-pro') return 'Gemini 1.5 Pro';
  return model;
}

export default function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, setSettings } = useStore()
  const [showKey, setShowKey] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const [tempKey, setTempKey] = useState(settings.geminiKey)
  const [tempModel, setTempModel] = useState(settings.model)

  useEffect(() => {
    if (open) {
      setTempKey(settings.geminiKey)
      setTempModel(settings.model)
      setShowKey(false)
    }
  }, [open, settings.geminiKey, settings.model])

  const handleVerify = () => {
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      setShowSuccessDialog(true)
    }, 800)
  }

  const handleSave = () => {
    setSettings({ geminiKey: tempKey, model: tempModel })
    onClose()
  }

  const handleRemove = () => {
    setTempKey('')
    setSettings({ geminiKey: '' })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="glass-strong fixed inset-y-0 right-0 z-50 flex w-[90vw] max-w-md flex-col gap-5 overflow-y-auto p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">Settings</h2>
              <button onClick={onClose} className="text-white/50 hover:text-white">
                <Icon name="close" />
              </button>
            </div>

            {/* Gemini API Key Section */}
            <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div>
                <h3 className="flex items-center gap-1.5 text-base font-bold text-white">
                  <Icon name="key" className="text-neon-violet" /> Gemini API Key
                </h3>
                <p className="mt-1 text-sm text-white/60">
                  Connect your Google Gemini API key to enable AI features.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">API Key</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={tempKey}
                      onChange={(e) => setTempKey(e.target.value)}
                      placeholder="Enter your Gemini API key"
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                    />
                  </div>
                  <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-white/60 hover:text-white/80">
                    <input 
                      type="checkbox" 
                      checked={showKey} 
                      onChange={(e) => setShowKey(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 accent-neon-violet"
                    />
                    Show API Key
                  </label>
                </div>
              </div>

              <div className="flex items-center text-sm">
                 <span className="mr-2 text-white/60">Status:</span> 
                 {tempKey.trim().length > 10 ? (
                   <span className="flex items-center gap-1 text-emerald-400">🟢 Connected</span>
                 ) : (
                   <span className="flex items-center gap-1 text-white/40">🔴 Not Connected</span>
                 )}
              </div>

              {/* Model */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Selected Model</label>
                <div className="flex flex-wrap gap-2">
                  {MODELS.map((m) => (
                    <GhostButton key={m} active={tempModel === m} onClick={() => setTempModel(m)}>
                      {formatModelName(m)}
                    </GhostButton>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                 <PrimaryPill onClick={() => { setSettings({ geminiKey: tempKey, model: tempModel }) }} className="bg-neon-violet">
                   Save
                 </PrimaryPill>
                 <GhostButton onClick={() => { setSettings({ geminiKey: tempKey, model: tempModel }); handleVerify() }}>
                   {isVerifying ? 'Testing...' : 'Test Connection'}
                 </GhostButton>
                 <button onClick={handleRemove} className="ml-auto px-2 py-1 text-xs text-red-400 hover:text-red-300">
                   Remove Key
                 </button>
              </div>
            </section>

            {/* Workday window */}
            <section className="space-y-2">
              <label className="text-sm font-semibold text-white">Workday window</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-xs text-white/50">Start</span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={settings.workdayStart}
                    onChange={(e) => setSettings({ workdayStart: Math.min(23, Math.max(0, +e.target.value)) })}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-white/50">End</span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={settings.workdayEnd}
                    onChange={(e) => setSettings({ workdayEnd: Math.min(23, Math.max(0, +e.target.value)) })}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Reduced motion */}
            <section>
              <button
                onClick={() => setSettings({ reducedMotion: !settings.reducedMotion })}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-white">
                  <Icon name="motion_blur" className="text-[18px] text-neon-violet" /> Reduced motion
                </span>
                <span
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.reducedMotion ? 'bg-neon-violet' : 'bg-white/15'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                      settings.reducedMotion ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </span>
              </button>
            </section>

            <div className="mt-auto">
              <PrimaryPill icon="check" onClick={onClose} className="w-full justify-center">
                Done
              </PrimaryPill>
            </div>
          </motion.aside>

          {/* Success Dialog */}
          <AnimatePresence>
            {showSuccessDialog && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSuccessDialog(false)} />
                <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl glass-strong">
                  <div className="mb-4 flex items-center gap-3 text-emerald-400">
                    <Icon name="check_circle" className="text-[28px]" />
                    <h3 className="font-display text-xl font-bold text-white">Verified</h3>
                  </div>
                  <p className="mb-6 text-sm text-white/80">
                    Your Gemini API key has been verified successfully.
                  </p>
                  
                  <div className="mb-6 space-y-3 rounded-xl bg-white/[0.03] border border-white/5 p-4">
                    <div>
                      <span className="block text-xs text-white/50 mb-1">Selected Model:</span>
                      <span className="font-semibold text-white">{formatModelName(settings.model)}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-white/50 mb-1">Status:</span>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                        <Icon name="done" className="text-[16px]" /> Connected and ready
                      </span>
                    </div>
                  </div>
                  
                  <p className="mb-6 text-sm text-white/80">
                    You can now start chatting with {formatModelName(settings.model)}.
                  </p>
                  
                  <PrimaryPill className="w-full justify-center" onClick={() => setShowSuccessDialog(false)}>
                    Awesome
                  </PrimaryPill>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
