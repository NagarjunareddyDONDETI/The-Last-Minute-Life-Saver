import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Icon({ name, className = '', fill = false }: { name: string; className?: string; fill?: boolean }) {
  return (
    <span className={`material-symbols-rounded ${fill ? 'icon-fill' : ''} ${className}`}>{name}</span>
  )
}

/** Primary action: glowing gradient pill with animated shimmer. */
export function PrimaryPill({
  children,
  onClick,
  icon,
  disabled,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  icon?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className={`shimmer-pill relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-white shadow-glow disabled:opacity-50 ${className}`}
    >
      {icon && <Icon name={icon} className="text-[20px]" />}
      <span>{children}</span>
    </motion.button>
  )
}

/** Secondary: ghost / outline button. */
export function GhostButton({
  children,
  onClick,
  icon,
  active,
  className = '',
}: {
  children?: ReactNode
  onClick?: () => void
  icon?: string
  active?: boolean
  className?: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-neon-violet/60 bg-neon-violet/15 text-white shadow-glow'
          : 'border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:border-white/25'
      } ${className}`}
    >
      {icon && <Icon name={icon} className="text-[18px]" />}
      {children && <span>{children}</span>}
    </motion.button>
  )
}

/** Icon-only round button. */
export function IconButton({
  name,
  onClick,
  label,
  className = '',
  fill = false,
}: {
  name: string
  onClick?: () => void
  label?: string
  className?: string
  fill?: boolean
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.12, rotate: 2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/75 hover:text-white hover:border-white/25 ${className}`}
    >
      <Icon name={name} fill={fill} className="text-[20px]" />
    </motion.button>
  )
}

export function Chip({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'high' | 'medium' | 'low' | 'red' }) {
  const tones: Record<string, string> = {
    default: 'border-white/15 bg-white/5 text-white/70',
    high: 'border-neon-magenta/40 bg-neon-magenta/10 text-neon-pink',
    medium: 'border-neon-violet/40 bg-neon-violet/10 text-violet-300',
    low: 'border-white/15 bg-white/5 text-white/50',
    red: 'border-red-500/50 bg-red-500/15 text-red-300',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function SectionTitle({ icon, children, sub }: { icon: string; children: ReactNode; sub?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-neon-violet">
        <Icon name={icon} className="text-[22px]" />
      </div>
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight text-white">{children}</h2>
        {sub && <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/40">{sub}</p>}
      </div>
    </div>
  )
}

/**
 * Scroll-triggered reveal. Children fade + lift + rotate in 3D as they enter
 * the viewport (once). Respects reduced-motion via the global store setting.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotateX: -14 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24, delay }}
      style={{ transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Segmented control — a distinct, non-button-row interaction with a sliding indicator. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            {active && (
              <motion.span
                layoutId="seg-indicator"
                className="absolute inset-0 rounded-lg bg-neon-gradient opacity-90 shadow-glow"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            {o.icon && <Icon name={o.icon} className={`relative z-10 text-[16px] ${active ? 'text-white' : 'text-white/55'}`} />}
            <span className={`relative z-10 ${active ? 'text-white' : 'text-white/55'}`}>{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
