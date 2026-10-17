export function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const cv = document.getElementById('fx'), ctx = cv.getContext('2d')
  cv.width = innerWidth; cv.height = innerHeight
  const cols = ['#ff5d73', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff', '#fff']
  const ps = Array.from({ length: 140 }, () => ({ x: innerWidth / 2 + (Math.random() - 0.5) * 160, y: innerHeight * 0.45,
    vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 15 - 4, r: Math.random() * 5 + 3, a: Math.random() * 6, c: cols[(Math.random() * 6) | 0] }))
  const t0 = performance.now()
  ;(function f(t) {
    ctx.clearRect(0, 0, cv.width, cv.height)
    ps.forEach((p) => { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.a += 0.2
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore() })
    if (t - t0 < 2600) requestAnimationFrame(f); else ctx.clearRect(0, 0, cv.width, cv.height)
  })(t0)
}
