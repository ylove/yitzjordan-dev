import type { ReactNode } from 'react'
import { DrawPath } from '@/components/motion/DrawPath'

/*
 * Drawings for Agent Roundtable's four stages (ported from vouchnetworks.org). The text for each
 * stage comes from the project's steps in the CMS; these are the pictures, in step order.
 * Agent Roundtable: the table, the debate, the frozen contract, then heads-down
 * parallel workers with budgets and a watchdog. Each stage draws in order (900ms each, staggered)
 * when it scrolls into view; the server HTML and reduced motion show every stroke in place.
 * The drawings are decorative: each stage's title and text carry the meaning.
 */

const STROKE = 'var(--ink-subtle)'
const INK = 'var(--ink)'

const seats = (cx: number, cy: number, r: number, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
  })

const circlePath = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`

const TABLE = seats(100, 80, 52, 5)

function Seats({ highlight }: { highlight?: number }) {
  return (
    <>
      {TABLE.map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={s.y} r="11" fill="var(--surface-raised)" stroke={i === highlight ? INK : STROKE} strokeWidth="1.75" />
          <circle cx={s.x} cy={s.y} r="3" fill={i === highlight ? INK : STROKE} />
        </g>
      ))}
    </>
  )
}

function TableArt({ delay }: { delay: number }) {
  return (
    <>
      <DrawPath d={circlePath(100, 80, 34)} stroke={STROKE} strokeWidth="1.75" delay={delay} />
      <Seats />
    </>
  )
}

function DebateArt({ delay }: { delay: number }) {
  const p = TABLE[0]!
  return (
    <>
      <circle cx="100" cy="80" r="34" fill="none" stroke="var(--line)" strokeWidth="1.5" />
      {TABLE.slice(1).map((s, i) => (
        <DrawPath
          key={i}
          d={`M${p.x} ${p.y + 11} Q 100 80 ${s.x} ${s.y}`}
          stroke={STROKE}
          strokeWidth="1.5"
          delay={delay + i * 0.12}
        />
      ))}
      <Seats highlight={0} />
    </>
  )
}

function ContractArt({ delay }: { delay: number }) {
  return (
    <>
      <DrawPath d="M64 26 H124 L138 40 V136 H64 Z" stroke={INK} strokeWidth="1.75" strokeLinejoin="round" delay={delay} />
      <DrawPath d="M124 26 V40 H138" stroke={INK} strokeWidth="1.75" strokeLinejoin="round" delay={delay + 0.2} />
      {[56, 70, 84].map((y, i) => (
        <DrawPath key={y} d={`M76 ${y} H${i === 2 ? 108 : 126}`} stroke={STROKE} strokeWidth="1.75" strokeLinecap="round" delay={delay + 0.3 + i * 0.1} />
      ))}
      {[104, 118].map((y, i) => (
        <g key={y}>
          <DrawPath d={`M76 ${y} l4 4 l7 -8`} stroke={INK} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" delay={delay + 0.6 + i * 0.1} />
          <DrawPath d={`M94 ${y} H120`} stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" delay={delay + 0.65 + i * 0.1} />
        </g>
      ))}
      {/* The seal: the one accent mark */}
      <circle cx="138" cy="132" r="9" fill="var(--accent)" />
      <path d="M134.5 132 h7 M138 128.5 v7" stroke="var(--surface)" strokeWidth="1.5" strokeLinecap="round" />
    </>
  )
}

function WorkersArt({ delay }: { delay: number }) {
  const lanes = [44, 80, 116]
  const budgets = [0.55, 0.8, 0.35]
  return (
    <>
      {lanes.map((y, i) => (
        <g key={y}>
          <DrawPath d={`M30 ${y} H150`} stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" delay={delay + i * 0.12} />
          <circle cx={30 + 120 * budgets[i]!} cy={y} r="7" fill="var(--surface-raised)" stroke={INK} strokeWidth="1.75" />
          {/* budget meter */}
          <rect x="30" y={y + 10} width="60" height="3" rx="1.5" fill="var(--line)" />
          <rect x="30" y={y + 10} width={60 * budgets[i]!} height="3" rx="1.5" fill={STROKE} />
        </g>
      ))}
      {/* watchdog */}
      <circle cx="176" cy="80" r="11" fill="none" stroke={INK} strokeWidth="1.75" />
      <circle cx="176" cy="80" r="3.5" fill={INK} />
      {lanes.map((y, i) => (
        <DrawPath key={y} d={`M165 ${80 + (y - 80) * 0.18} L152 ${y}`} stroke={STROKE} strokeWidth="1.25" strokeOpacity="0.7" delay={delay + 0.4 + i * 0.1} />
      ))}
    </>
  )
}


/** One drawing per step, in order: the table, the debate, the frozen contract, heads-down. */
export const ROUNDTABLE_ARTS: Array<(delay: number) => ReactNode> = [
  (d) => <TableArt delay={d} />,
  (d) => <DebateArt delay={d} />,
  (d) => <ContractArt delay={d} />,
  (d) => <WorkersArt delay={d} />,
]
