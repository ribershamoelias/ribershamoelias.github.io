# ribershamoelias.com

Personal website of **Riber Shamo Elias** — Mathematics & Computer Science student at the University of Trier, software engineer, and builder of the LAMA Open Ecosystem.

**Live:** [ribershamoelias.com](https://ribershamoelias.com)

---

## Structure

```
/
├── index.html          # Personal homepage
├── style.css           # Homepage styles
├── script.js           # Typing animation, nav scroll
├── robots.txt
├── sitemap.xml
├── CNAME               # mineskin.ribershamoelias.com
│
├── my-links/           # Link page (ribershamoelias.com/my-links/)
│   ├── index.html
│   ├── style.css
│   ├── background.js
│   ├── links.json
│   └── script.js
│
└── mineskin/           # MineSkin editor (mineskin.ribershamoelias.com)
    ├── index.html      # Landing page
    ├── editor.html     # Pixel editor
    ├── landing.css
    ├── style.css
    ├── app.js
    ├── canvas.js
    ├── preview.js
    ├── utils.js
    ├── steve.png
    ├── alex.png
    ├── robots.txt
    └── sitemap.xml
```

---

## Pages

| URL | Description |
|-----|-------------|
| `ribershamoelias.com` | Personal homepage — About, LAMA, Projects, Experience |
| `ribershamoelias.com/my-links/` | Link page — GitHub, LinkedIn, Instagram, Spotify |
| `mineskin.ribershamoelias.com` | MineSkin landing page |
| `mineskin.ribershamoelias.com/editor.html` | MineSkin pixel editor |

---

## Projects

| Project | Stack | Repo |
|---------|-------|------|
| [MineSkin](https://ribershamoelias.com/mineskin/index.html) | TypeScript, Three.js | this repo `/mineskin` |
| [Lama-S](https://github.com/ribershamoelias/Lama-S) | Swift, SwiftUI | public |
| [Forge](https://github.com/ribershamoelias/Forge) | TypeScript | public |
| [FuzzDus](https://github.com/ribershamoelias/FuzzDus) | TypeScript | public |
| Lumen | C++, Ladybird | private |
| ByteStruct | Python | private |
| [RSE Systems](https://rse-systems.com) | — | — |

---

## LAMA Open Ecosystem

All public work is licensed under the **LAMA Open Ecosystem License (LOEL v1.0)**.

> Build freely. Credit honestly. Respect the ecosystem.

Three principles:
- **Freedom to Build** — use, fork, and build commercially
- **Radical Transparency** — mandatory contributor attribution
- **Permanent Attribution** — authorship is legally protected and cannot be stripped

---

## Deployment

Hosted on **GitHub Pages**.

- Personal site (`ribershamoelias.com`) → main repo `ribershamoelias/ribershamoelias.github.io`
- MineSkin (`mineskin.ribershamoelias.com`) → `ribershamoelias/MineSkin` with CNAME

### DNS

```
ribershamoelias.com          CNAME  ribershamoelias.github.io
ribershamoelias.com/mineskin/index.html
```

### Local preview

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

---

## License

LAMA Open Ecosystem License (LOEL v1.0)
Copyright © 2026 Riber Shamo Elias

Original Creator: **Riber Shamo Elias**

You are free to use, modify, and commercially use this software.
You **must** credit the original creator and preserve contributor transparency.
You **may not** remove attribution or misrepresent authorship.
