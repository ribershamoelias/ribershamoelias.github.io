# MineSkin Editor

A fully functional, modern Minecraft Skin Editor that runs entirely in the browser — no backend required.

## 🚀 Live Demo
Deploy to GitHub Pages by pushing this repo and enabling Pages on the `main` branch (root folder).

## ✨ Features

| Feature | Details |
|---|---|
| Pixel Editor | 64×64 canvas, click+drag painting, zoom 2x–24x |
| Tools | Brush, Eraser, Eyedropper, Fill (flood), Rectangle |
| Layers | Base + Outer layer, toggle visibility |
| 3D Preview | Three.js Steve/Alex model, drag to rotate, scroll to zoom |
| Color Picker | HSV gradient, hue/alpha sliders, HEX input |
| Palette | 64 Minecraft-friendly colors + recent colors |
| Mirror Mode | Left/right symmetry drawing |
| Body Parts | Restrict editing to head, body, arms, legs |
| Import/Export | PNG import (drag & drop), PNG export |
| Undo/Redo | 50-step history |
| Auto-save | localStorage persistence |

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `B` | Brush tool |
| `E` | Eraser tool |
| `I` | Eyedropper |
| `F` | Fill tool |
| `R` | Rectangle tool |
| `M` | Toggle mirror |
| `G` | Toggle grid |
| `+` / `-` | Zoom in/out |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |

## 🗂 File Structure

```
index.html   — Layout and markup
style.css    — Dark theme, responsive design
utils.js     — Shared color math helpers
canvas.js    — Pixel editor engine
preview.js   — Three.js 3D character preview
app.js       — Application controller
```

## 🛠 Tech Stack
- Vanilla HTML5 / CSS3 / JavaScript
- Three.js r128 (CDN) for 3D preview
- No build step, no dependencies to install
