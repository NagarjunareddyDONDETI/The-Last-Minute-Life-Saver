import { useState, useEffect, useCallback, useRef } from 'react'

// Define types for SpeechRecognition since TypeScript might not have them natively
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
      isFinal: boolean
    }
    length: number
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: any) => void
  onend: () => void
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition
    }
    webkitSpeechRecognition: {
      new (): SpeechRecognition
    }
  }
}

export function useVibeVoice() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        let currentTranscript = ''
        let isFinal = false
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript
          if (event.results[i].isFinal) isFinal = true
        }
        setTranscript(currentTranscript)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event)
        setError(event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    } else {
      console.warn('Speech recognition not supported in this browser.')
    }
  }, [])

  const startListening = useCallback(() => {
    setError(null)
    setTranscript('')
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        // Stop speaking if starting to listen
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      } catch (err) {
        console.error('Could not start listening', err)
      }
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [isListening])

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd()
      return
    }

    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    // Try to find a good English voice, preferably female to match "VibeAI"
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google'))
    )
    if (preferredVoice) utterance.voice = preferredVoice

    utterance.rate = 1.05 // slightly upbeat
    utterance.pitch = 1.1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      if (onEnd) onEnd()
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      if (onEnd) onEnd()
    }

    window.speechSynthesis.speak(utterance)
  }, [])

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  return {
    isListening,
    transcript,
    error,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  }
}
