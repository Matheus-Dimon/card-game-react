# Cardgame (local dev)

This repository contains a single-file React game at `cardgame.jsx`. The project is not currently set up with a bundler — the files below provide a minimal Vite scaffold to run the app locally.

Quick start (PowerShell):

```powershell
# from repository root (c:\Users\Matheus Elias\Desktop\Nova pasta)
npm install
npm run dev
```

Default dev server URL will be printed by Vite (usually `http://localhost:5173`).

Notes:
- `cardgame.jsx` uses Tailwind-like class names but Tailwind is not configured; the UI will render but may look unstyled.
- The AI and animations use `document.querySelector` + `getBoundingClientRect()`; test in a real browser for full behavior.

If you'd like, I can add Tailwind, split `cardgame.jsx` into modules, or add unit tests for the reducer and AI.
