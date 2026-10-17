let ac
function tone(f, d, type = 'square', v = 0.08, t0 = 0) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)()
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + t0
    o.type = type; o.frequency.value = f
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d)
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d)
  } catch (e) {}
}
export const tick = () => tone(900, 0.04, 'square', 0.05)
export const jingle = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.12, i * 0.12))
export const buzz = () => tone(160, 0.35, 'sawtooth', 0.1)
