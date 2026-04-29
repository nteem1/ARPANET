# ARPANET 90s Museum Website

A retro 90s-themed website about the beginning and evolution of ARPANET, with interactive history modules and mini tools.

## Project Structure

- `index.html` - Main contest-style ARPANET experience
- `styles.css` - Shared retro 90s styling
- `script.js` - Interactive behavior for timeline, simulator, quiz, poll, guestbook, and more
- `deep-dive.html` - Secondary page for expanded content and audio features

## Features

- Expanded ARPANET timeline (1962-1990)
- Timeline filter buttons, slider scrub, and autoplay
- Packet switching simulator with node routing log
- Quiz engine and protocol matcher
- Retro console command interface
- Random fact generator
- Glossary hover definitions and FAQ
- Visitor counter with local persistence
- Community poll with local persistence
- Guestbook with local persistence
- Konami-code easter egg (`↑ ↑ ↓ ↓ ← → ← → B A`)

## Run Locally

This is a static frontend project.

1. Open `index.html` directly in a browser, or
2. Serve the folder with any static server.

Example:

```bash
python3 -m http.server 8000
```

Then visit:

- `http://localhost:8000/index.html`
- `http://localhost:8000/deep-dive.html`

## Notes

- Data for poll, guestbook, and counter is stored in browser `localStorage`.
- Hard refresh (`Cmd+Shift+R` on macOS) if cached assets prevent updates from appearing.
