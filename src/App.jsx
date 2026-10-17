import { useEffect, useRef, useState } from 'react'
import Wheel from './components/Wheel'
import { SIZES, STAKES, START_COINS, STEP, randomIndex, nextRotation, prizeFor } from './lib/game'
import { confetti } from './lib/confetti'
import { tick, jingle, buzz } from './lib/sound'

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const DURATION = reduce ? 1 : 5.5
const KEY = 'wof-v2'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {} }
const ZERO = { spins: 0, wins: 0, streak: 0, best: 0, biggest: 0 }

export default function App() {
  const saved = useRef(load()).current
  const [n, setN] = useState(saved.n || 10)
  const [picks, setPicks] = useState([5])
  const [stake, setStake] = useState(50)
  const [coins, setCoins] = useState(saved.coins ?? START_COINS)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(saved.stats || ZERO)
  const [sound, setSound] = useState(saved.sound ?? true)
  const pending = useRef(null), gRef = useRef(null), soundRef = useRef(sound)
  soundRef.current = sound

  useEffect(() => save({ n, coins, stats, sound }), [n, coins, stats, sound])

  // tick sound each time a segment passes the pointer
  useEffect(() => {
    if (!spinning) return
    let raf, last = -1
    const loop = () => {
      const el = gRef.current
      if (el) {
        const m = new DOMMatrix(getComputedStyle(el).transform)
        const a = (((Math.atan2(m.b, m.a) * 180) / Math.PI) % 360 + 360) % 360
        const seg = Math.floor(a / STEP(n))
        if (last !== -1 && seg !== last && soundRef.current) tick()
        last = seg
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [spinning])

  const k = picks.length
  const prize = prizeFor(stake, n, k)
  const canStart = !spinning && stake <= coins && stake > 0

  function pick(num) {
    setPicks([num])
  }
  function resize(v) { setN(v); setPicks((p) => { const f = p.filter((x) => x <= v); return f.length ? f : [1] }); setResult(null) }

  function start() {
    if (!canStart) return
    const idx = randomIndex(n)
    pending.current = { landed: idx + 1, picks: [...picks], stake, prize }
    setCoins((c) => c - stake); setResult(null); setSpinning(true)
    setRotation((r) => nextRotation(r, idx, n))
    setTimeout(finish, DURATION * 1000 + 150)
  }

  function finish() {
    const { landed, picks: ps, stake: s, prize: pz } = pending.current
    const won = ps.includes(landed)
    if (won) { setCoins((c) => c + pz); confetti() }
    if (soundRef.current) won ? jingle() : buzz()
    setStats((t) => {
      const streak = won ? t.streak + 1 : 0
      return { spins: t.spins + 1, wins: t.wins + (won ? 1 : 0), streak, best: Math.max(t.best, streak), biggest: won ? Math.max(t.biggest, pz - s) : t.biggest }
    })
    setResult({ landed, picks: ps, won, net: won ? pz - s : s })
    setHistory((h) => [{ landed, won, id: Date.now() }, ...h].slice(0, 14))
    setSpinning(false)
  }

  const refill = coins < STAKES[0] && !spinning
  return (
    <div className="app">
      <header className="hud">
        <h1>Wheel of Fortune</h1>
        <div className="badges">
          <span className="badge" title="Win streak">🔥 {stats.streak}</span>
          <span className="badge coins"><i className="coin" />{coins}</span>
          <button className="badge snd" aria-pressed={sound} onClick={() => setSound(!sound)} aria-label="Sound">{sound ? '🔊' : '🔇'}</button>
        </div>
      </header>

      <div className="play-area">
        <div className="left-stack">
          <Wheel n={n} rotation={rotation} duration={DURATION} spinning={spinning} picks={picks} landed={result?.landed}
            gRef={gRef} onStart={start} canStart={canStart} />
        </div>

        <div className="cards">
          <section className="card">
            <h2>Your number</h2>
            <div className="nums" role="group" aria-label="Your numbers">
              {Array.from({ length: n }, (_, i) => (
                <button key={i} className="nb" aria-pressed={picks.includes(i + 1)} disabled={spinning} onClick={() => pick(i + 1)}>{i + 1}</button>
              ))}
            </div>
            <h2>Wheel size <small>more numbers, bigger prize</small></h2>
            <div className="row">
              {SIZES.map((v) => <button key={v} className="chip" aria-pressed={n === v} disabled={spinning} onClick={() => resize(v)}>{v}</button>)}
            </div>
          </section>

          <section className="card">
            <h2>Your bid</h2>
            <div className="row">
              {STAKES.map((v) => <button key={v} className="chip" aria-pressed={stake === v} disabled={spinning || v > coins} onClick={() => setStake(v)}>{v}</button>)}
              <button className="chip" aria-pressed={stake === coins && !STAKES.includes(coins)} disabled={spinning || coins < 1} onClick={() => setStake(coins)}>All in</button>
            </div>
            <p className="prize">Win pays <b>×{(n / k).toFixed(n % k ? 1 : 0)}</b> = <b>{prize}</b> coins</p>
            <p className="hint">Chance to win: {k} in {n} ({Math.round((k / n) * 100)}%). Play coins only, no real money.</p>
            {refill
              ? <button className="go" onClick={() => { setCoins(START_COINS); setStake(50) }}>Out of coins. Refill {START_COINS}</button>
              : <button className="go" disabled={!canStart} onClick={start}>{spinning ? 'Spinning…' : 'Start'}</button>}
            <div className="stats">
              <div><b>{stats.spins}</b><small>spins</small></div>
              <div><b>{stats.spins ? Math.round((stats.wins / stats.spins) * 100) : 0}%</b><small>win rate</small></div>
              <div><b>{stats.best}</b><small>best streak</small></div>
              <div><b>{stats.biggest}</b><small>biggest win</small></div>
            </div>
          </section>
        </div>
      </div>

      {result && (
        <div className="result-overlay">
          <section className={'result-popup ' + (result.won ? 'win' : 'loss')} role="dialog" aria-modal="true" aria-labelledby="result-title" aria-live="assertive">
            <div className="result-icon" aria-hidden="true">{result.won ? '🏆' : '🎲'}</div>
            <p className="result-kicker">{result.won ? 'LUCKY SPIN!' : 'NEXT TIME!'}</p>
            <h2 id="result-title">{result.won ? 'YOU WIN!' : 'YOU LOSE'}</h2>
            <p className="result-landed">The wheel landed on <b>{result.landed}</b></p>
            <p className="result-coins">{result.won ? `+${result.net}` : `−${result.net}`} <span>coins</span></p>
            <button className="result-continue" onClick={() => setResult(null)}>Continue</button>
          </section>
        </div>
      )}

      {history.length > 0 && (
        <div className="hist" aria-label="Recent results">
          {history.map((h) => <span key={h.id} className={h.won ? 'w' : ''}>{h.landed}</span>)}
        </div>
      )}
    </div>
  )
}
