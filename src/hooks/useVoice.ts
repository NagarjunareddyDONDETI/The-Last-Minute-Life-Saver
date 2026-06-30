import { useEffect, useRef, useState } from 'react'

// Minimal typing for the Web Speech API (not in TS lib by default).
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((e: any) => void) | null
  onend: (() => void) | null
  onerror: ((e: any) => void) | null
  start: () => void
  stop: () => void
}

function getRecognition(): SpeechRecognitionLike | null {
  const w = window as any
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
  if (!Ctor) return null
  return new Ctor()
}

/** Web Speech API hook for hands-free task capture. */
export function useVoice() {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    const rec = getRecognition()
    setSupported(!!rec)
    recRef.current = rec
    if (rec) {
      rec.lang = 'en-US'
      rec.interimResults = true
      rec.continuous = false
      rec.onresult = (e: any) => {
        const text = Array.from(e.results)
          .map((r: any) => r[0].transcript)
          .join('')
        setTranscript(text)
      }
      rec.onend = () => setListening(false)
      rec.onerror = () => setListening(false)
    }
    return () => rec?.stop()
  }, [])

  function start() {
    const rec = recRef.current
    if (!rec) return
    try {
      setTranscript('')
      setListening(true)
      rec.start()
    } catch {
      setListening(false)
    }
  }

  function stop() {
    recRef.current?.stop()
    setListening(false)
  }

  return { supported, listening, transcript, start, stop }
}
