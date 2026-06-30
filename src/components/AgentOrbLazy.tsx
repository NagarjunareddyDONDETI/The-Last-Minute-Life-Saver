import { Suspense, lazy } from 'react'

// The 3D orb pulls in three.js / @react-three (~900KB). Lazy-load it so it
// becomes its own chunk fetched on demand, and show a lightweight CSS orb
// of identical footprint while it streams in (no layout shift).
const OrbCanvas = lazy(() => import('./OrbCanvas'))

export interface OrbProps {
  thinking?: boolean
  panic?: boolean
  size?: number
}

function OrbFallback({ panic = false, size = 120 }: OrbProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className="pointer-events-none grid select-none place-items-center"
      aria-hidden
    >
      <div
        className="rounded-full blur-[2px]"
        style={{
          width: size * 0.62,
          height: size * 0.62,
          background: panic
            ? 'radial-gradient(circle at 35% 30%, #f97316, #ef4444 70%)'
            : 'radial-gradient(circle at 35% 30%, #a78bfa, #3b82f6 70%)',
          animation: 'pulseGlow 2s ease-in-out infinite',
        }}
      />
    </div>
  )
}

export default function AgentOrbLazy(props: OrbProps) {
  return (
    <Suspense fallback={<OrbFallback {...props} />}>
      <OrbCanvas thinking={props.thinking ?? false} panic={props.panic ?? false} />
    </Suspense>
  )
}
