import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVibeVoice } from '../hooks/useVibeVoice'
import { processVibeVoiceCommand } from '../lib/gemini'
import { executeVibeActions } from '../lib/vibeActions'
import { useStore } from '../store/useStore'
import { Icon } from './ui'

export default function VibeVoiceButton() {
  const { isListening, isSpeaking, transcript, startListening, stopListening, speak, stopSpeaking, isSupported } = useVibeVoice()
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastProcessed, setLastProcessed] = useState('')
  const { tasks, settings } = useStore()
  const isConversingRef = useRef(false)

  useEffect(() => {
    if (!isListening && transcript.trim() && transcript !== lastProcessed && !isProcessing) {
      setLastProcessed(transcript)
      processTranscript(transcript)
    }
  }, [isListening, transcript, lastProcessed, isProcessing])

  const processTranscript = async (text: string) => {
    setIsProcessing(true)
    try {
      const result = await processVibeVoiceCommand(text, tasks, settings)
      
      let shouldStop = false
      if (result.actions.length > 0) {
        shouldStop = await executeVibeActions(result.actions)
      }
      
      if (shouldStop) {
        isConversingRef.current = false
        speak(result.spokenResponse)
      } else {
        speak(result.spokenResponse, () => {
          if (isConversingRef.current) {
            setLastProcessed('')
            startListening()
          }
        })
      }
    } catch (error) {
      console.error("VibeAI Processing Error", error)
      isConversingRef.current = false
      speak("Sorry, I had trouble processing that command.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isSupported) return null

  const handleToggle = () => {
    const isActive = isListening || isProcessing || isSpeaking
    if (isActive) {
      isConversingRef.current = false
      stopListening()
      stopSpeaking()
    } else {
      isConversingRef.current = true
      setLastProcessed('')
      startListening()
    }
  }

  return (
    <div className="fixed bottom-24 right-24 z-50 flex items-center justify-center md:bottom-8 md:right-28">
      <AnimatePresence>
        {(isListening || isProcessing || isSpeaking) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="absolute right-16 rounded-2xl border border-white/10 bg-background/80 p-3 backdrop-blur-xl w-64 shadow-2xl"
          >
            <p className="text-sm font-medium text-white/90">
              {isListening ? (transcript || 'Listening...') : isProcessing ? 'Thinking...' : 'VibeAI is speaking...'}
            </p>
            {isListening && (
              <div className="mt-2 flex h-1 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div 
                  className="h-full bg-indigo-500"
                  animate={{ 
                    width: ['0%', '100%', '0%'],
                    x: ['-100%', '100%', '100%']
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5,
                    ease: "linear" 
                  }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg md:h-16 md:w-16 ${
          (isListening || isProcessing || isSpeaking)
            ? 'bg-red-500 text-white shadow-red-500/50' 
            : 'bg-white/10 text-white backdrop-blur-md hover:bg-white/20 border border-white/10'
        }`}
      >
        <Icon name={(isListening || isProcessing || isSpeaking) ? 'stop' : 'mic'} className="text-[24px] md:text-[28px]" fill={isListening} />
        
        {/* Glow effect when active */}
        {(isListening || isProcessing || isSpeaking) && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{
              backgroundColor: isListening ? '#ef4444' : '#6366f1'
            }}
          />
        )}
      </motion.button>
    </div>
  )
}

