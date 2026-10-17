export const SIZES = [6, 8, 10, 12]   // numbers on the wheel
export const STAKES = [10, 50, 100, 250]
export const START_COINS = 1000
export const STEP = (n) => 360 / n

// unbiased random index using the browser's crypto source
export function randomIndex(n) {
  const a = new Uint32Array(1), limit = Math.floor(2 ** 32 / n) * n
  do crypto.getRandomValues(a); while (a[0] >= limit)
  return a[0] % n
}

// New wheel rotation (deg) so that segment `idx` ends under the pointer at the top.
export function nextRotation(cur, idx, n) {
  const s = STEP(n), jitter = (Math.random() - 0.5) * s * 0.7
  const target = -((idx + 0.5) * s) + jitter
  const delta = (((target - cur) % 360) + 360) % 360
  return cur + delta + 360 * (5 + Math.floor(Math.random() * 3))
}

// Fair payout: choosing k of n numbers pays n / k times the bid
export const prizeFor = (stake, n, k) => Math.floor((stake * n) / k)

export const numberAt = (rot, n) => Math.floor((((-rot % 360) + 360) % 360) / STEP(n)) + 1
