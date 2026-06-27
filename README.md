# CyberFlap 🚀

A modern, customizable Flappy Bird game built with vanilla HTML, CSS, and JavaScript. No frameworks, no dependencies — just open `index.html` and play.

![Theme](https://img.shields.io/badge/theme-dark_neon-ff007f)
![Built With](https://img.shields.io/badge/built_with-vanilla_JS-f7df1e)

## 🎮 Play

Open `index.html` in any browser. No server needed.

```
Controls:
  Space / Click / Tap     → Flap / Jump
  P                       → Pause / Resume
```

## ✨ Features

- **3 Visual Themes** — Cyberpunk Neon, Retro 8-Bit, Forest Zen
- **4 Bird Skins** — Neon Orb, Retro Bird, Rocket Ship, Vampire Bat
- **Custom Physics** — Adjust gravity, jump strength, pipe speed, and gap in real-time
- **Web Audio Synthesis** — All sounds generated programmatically (no audio files needed)
- **Parallax Backgrounds** — Multi-layer scrolling environments per theme
- **Particle Systems** — Trail effects, explosion debris, score sparkles
- **Achievement System** — Unlock badges as you play (persisted via localStorage)
- **Stats & Telemetry** — Track total games, pipes cleared, jumps, high scores
- **Responsive Canvas** — Scales to fit your screen

## 🛠 How It Was Built

| Layer | Technology |
|-------|-----------|
| **Architecture** | Designed by **Jarvis** (Hermes AI agent) — task orchestration, bug fixing, code review |
| **Code Generation** | Built by **Antigravity CLI** (Gemini 3.5 Flash) — HTML structure, CSS theming, JS game engine, audio synthesis |
| **Review** | Reviewed by **Jarvis** — fixed Canvas CSS variable bug that broke the game loop |
| **Stack** | Pure HTML5 + CSS3 + JavaScript Canvas 2D — zero dependencies, zero frameworks |

### The Stack

- **HTML5** — Semantic structure with game overlays, sidebar panels, and responsive layout
- **CSS3** — Custom properties for theming, glassmorphism cards, CSS grid/flexbox layout
- **JavaScript Canvas 2D** — Game loop via `requestAnimationFrame`, collision detection, particle physics
- **Web Audio API** — Procedural sound synthesis (oscillators, gain envelopes, frequency sweeps)

No build tools, no package managers, no external libraries. One folder, three files, ready to play.

## 📁 Files

| File | Lines | Size | Purpose |
|------|-------|------|---------|
| `index.html` | 314 | 14 KB | Structure: sidebar config, canvas container, overlays, stats panel |
| `styles.css` | 954 | 20 KB | Theming: 3 themes, responsive layout, glassmorphism, animations |
| `app.js` | 1228 | 36 KB | Engine: game loop, physics, rendering, audio, achievements, telemetry |

## 🚀 Run It

```bash
# Direct open
open index.html

# Or serve locally
python3 -m http.server 8080
# → http://localhost:8080
```

## 📸 Preview

CyberFlap features a dark neon aesthetic with real-time physics customization, parallax scrolling backgrounds, and a full achievement system — all in a single HTML file.

---

*Built by agy (Gemini 3.5 Flash) + Jarvis (Hermes AI) — June 2026*
