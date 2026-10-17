import { STEP } from '../lib/game'

const FILL = ['#ef4444', '#fde047', '#ffffff', '#38bdf8']
const TEXT = ['#fff', '#0b2a4a', '#0b2a4a', '#0b2a4a']
const P = (deg, r) => [200 + r * Math.sin((deg * Math.PI) / 180), 200 - r * Math.cos((deg * Math.PI) / 180)]

export default function Wheel({ n, rotation, duration, spinning, picks, landed, gRef, onStart, canStart }) {
  const s = STEP(n), size = n <= 6 ? 56 : n <= 8 ? 50 : n <= 10 ? 44 : 38
  return (
    <div className="wheelbox">
      <svg className={'wheel' + (spinning ? ' spinning' : '')} viewBox="-12 -34 424 446" role="img" aria-label={`Wheel with numbers 1 to ${n}`}>
        <circle cx="200" cy="200" r="198" className="rim" />
        {Array.from({ length: 24 }, (_, i) => {
          const [x, y] = P(i * 15, 190)
          return <circle key={i} cx={x} cy={y} r="4.5" className={'bulb b' + (i % 2)} />
        })}
        <g ref={gRef} style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '200px 200px', transition: `transform ${duration}s cubic-bezier(.1,.6,.08,1)` }}>
          {Array.from({ length: n }, (_, i) => {
            const [x0, y0] = P(i * s, 172), [x1, y1] = P((i + 1) * s, 172), num = i + 1
            return (
              <g key={i}>
                <path d={`M200 200L${x0} ${y0}A172 172 0 0 1 ${x1} ${y1}Z`} fill={FILL[i % 4]}
                  className={'wedge' + (picks.includes(num) ? ' bid' : '') + (!spinning && num === landed ? ' hit' : '')} />
                <text x="200" y={n <= 8 ? 92 : 88} transform={`rotate(${(i + 0.5) * s} 200 200)`} textAnchor="middle"
                  className="num" style={{ fontSize: size, fill: TEXT[i % 4] }}>{num}</text>
              </g>
            )
          })}
        </g>
        <path d="M200 26L182 -10Q200 -24 218 -10Z" className="pointer" />
      </svg>
      <button className="hubbtn" disabled={!canStart} onClick={onStart} aria-label="Start the wheel">{spinning ? '' : 'START'}</button>
    </div>
  )
}
