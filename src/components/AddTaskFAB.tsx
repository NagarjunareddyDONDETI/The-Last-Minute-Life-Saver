import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Icon } from './ui'
import { fmtDateTimeLocal } from '../lib/time'
import { useVoice } from '../hooks/useVoice'

const IMPORTANCES = ['low', 'medium', 'high'] as const

export default function AddTaskFAB() {
  const addTask = useStore((s) => s.addTask)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [importance, setImportance] = useState<'low' | 'medium' | 'high'>('high')
  const [est, setEst] = useState(30)
  const [deadline, setDeadline] = useState(() => fmtDateTimeLocal(Date.now() + 2 * 3600_000))
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { supported, listening, start, transcript } = useVoice()

  useEffect(() => {
    if (transcript) setTitle(transcript)
  }, [transcript])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250)
  }, [open])

  async function submit() {
    if (!title.trim()) return
    setSaving(true)
    await addTask({
      title,
      importance,
      estMinutes: est,
      deadline: new Date(deadline).getTime(),
      tags: [],
    })
    setTitle('')
    setSaving(false)
    setOpen(false)
  }

  return (
    <div className="fixed bottom-24 right-5 z-40 md:bottom-8 md:right-8">
      <AnimatePresence mode="popLayout">
        {open ? (
          <motion.div
            key="form"
            layoutId="fab"
            initial={{ borderRadius: 999 }}
            animate={{ borderRadius: 24 }}
            className="glass-strong w-[88vw] max-w-sm rounded-3xl p-4 shadow-glow"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display font-semibold text-white">Capture a task</span>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white">
                <Icon name="close" />
              </button>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="e.g. Email professor about extension"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-3 pr-11 text-sm text-white placeholder-white/30 outline-none focus:border-neon-violet/60"
              />
              {supported && (
                <button
                  onClick={start}
                  aria-label="Voice capture"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full ${
                    listening ? 'bg-red-500/30 text-red-300 animate-pulse' : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <Icon name="mic" className="text-[18px]" fill={listening} />
                </button>
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {IMPORTANCES.map((imp) => (
                <button
                  key={imp}
                  onClick={() => setImportance(imp)}
                  className={`rounded-lg border py-1.5 text-xs font-medium capitalize transition ${
                    importance === imp
                      ? 'border-neon-violet/60 bg-neon-violet/20 text-white'
                      : 'border-white/10 bg-white/[0.02] text-white/50'
                  }`}
                >
                  {imp}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-[11px] text-white/50">
                Deadline
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-white outline-none focus:border-neon-violet/60 [color-scheme:dark]"
                />
              </label>
              <label className="text-[11px] text-white/50">
                Effort: {est}m
                <input
                  type="range"
                  min={5}
                  max={240}
                  step={5}
                  value={est}
                  onChange={(e) => setEst(Number(e.target.value))}
                  className="mt-2 w-full accent-neon-violet"
                />
              </label>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={submit}
              disabled={saving || !title.trim()}
              className="shimmer-pill mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white shadow-glow disabled:opacity-50"
            >
              <Icon name="auto_awesome" />
              {saving ? 'Agent planning…' : 'Add & let the agent plan'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            key="fab"
            layoutId="fab"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(true)}
            className="shimmer-pill grid h-16 w-16 place-items-center rounded-full text-white shadow-glow-magenta"
          >
            <Icon name="add" className="text-[30px]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
