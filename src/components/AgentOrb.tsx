import { lazy, Suspense } from 'react'

// The Three.js scene is a heavy dependency (three + react-three). Loading it
// lazily keeps it out of the initial bundle — it streams in after first paint.
const OrbCanvas = lazy(() => import('./OrbCanvas'))

/** Lightweight CSS orb shown while the 3D scene loads (and as a no-WebGL fallback). */
function OrbFallback({ panic }: { panic: boolean }) {
  return (
    <div
      className="h-full w-full rounded-full"
      style={{
        background: panic
          ? 'radial-gradient(circle at 35% 30%, #f97316, #ef4444 70%)'
          : 'radial-gradient(circle at 35% 30%, #a78bfa, #3b82f6 70%)',
        boxShadow: panic ? '0 0 24px rgba(239,68,68,0.5)' : '0 0 24px rgba(139,92,246,0.5)',
        animation: 'pulseGlow 2.4s ease-in-out infinite',
      }}
    />
  )
}

/**
 * Floating 3D agent avatar. Pulses faster while the agent is "thinking",
 * shifts to red urgency colors in panic mode. The actual WebGL scene is
 * code-split and loaded on demand.
 */
export default function AgentOrb({
  thinking = false,
  panic = false,
  size = 120,
}: {
  thinking?: boolean
  panic?: boolean
  size?: number
}) {
  return (
    <div style={{ width: size, height: size }} className="pointer-events-none select-none">
      <Suspense fallback={<OrbFallback panic={panic} />}>
        <OrbCanvas thinking={thinking} panic={panic} />
      </Suspense>
    </div>
  )
}
