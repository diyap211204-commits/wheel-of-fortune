# Wheel of Fortune (React + Vite)

Pick up to 3 numbers, place a bid in play coins and tap START on the wheel. If it stops on one of your numbers you win.

- **Fair odds:** picking k of n numbers pays n/k times your bid. The winning number comes from the browser's crypto random generator, then the wheel animates to land on it.
- **Wheel sizes:** 6, 8, 10 or 12 numbers.
- **Extras:** tick, win and lose sounds (mute button), win streak, best streak, biggest win, last 14 results, "All in" bid, refill when out of coins. Coins and stats are saved in the browser. Play coins only, no real money.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

Structure: `src/lib/game.js` (odds, random, rotation), `src/lib/sound.js`, `src/lib/confetti.js`, `src/components/Wheel.jsx` (SVG wheel with START hub), `src/App.jsx`, `src/styles.css`.
