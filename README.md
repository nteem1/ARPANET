# ARPANET Interactive Research Platform

A large, modern, static web application about the beginning and evolution of ARPANET, built with a modular UI system and data-driven JavaScript features.

## Project Structure

- `index.html` - Main application shell and sections
- `styles.css` - Design tokens, component styles, and responsive layout rules
- `script.js` - Data models, state management, rendering pipelines, and interactive modules
- `deepdive.html` - Secondary deep-dive page with additional content and audio tools

## Features

- Data-driven timeline engine (year/category/text filtering + autoplay + slider)
- Dashboard metrics and milestone category canvas chart
- Packet routing simulation with per-hop live logs
- Node explorer with structured metadata
- Adaptive quiz and protocol matcher modules
- Fact generation + pinned fact list
- Glossary/FAQ renderer from structured data
- Poll, guestbook, and visitor counter persistence via `localStorage`
- Command palette (`Cmd/Ctrl + K`) with quick actions
- Theme toggling (dark/light runtime tokens)
- Real-time audio visualizer using the Web Audio API

## Run Locally

This is a static frontend project.

1. Open `index.html` directly in a browser, or
2. Serve the folder with any static server.

Example:

```bash
python3 -m http.server 8000
```

Then visit:

- `http://localhost:8000/archive`
- `http://localhost:8000/archive/deepdive`

## Notes

- Data for poll, guestbook, visitor counter, and theme mode is stored in browser `localStorage`.
- Hard refresh (`Cmd+Shift+R` on macOS) if cached assets prevent updates from appearing.
