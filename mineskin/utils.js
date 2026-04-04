// utils.js — shared helpers

// ===== Minecraft Bitmap Font (5×7 per glyph, scale 1 = 1px per bit) =====
const MC_FONT = {
  // Each char: array of 7 rows, each row is a 5-bit number (MSB = left)
  ' ': [0,0,0,0,0,0,0],
  '!': [0b00100,0b00100,0b00100,0b00100,0b00000,0b00100,0b00000],
  '"': [0b01010,0b01010,0b01010,0b00000,0b00000,0b00000,0b00000],
  '#': [0b01010,0b11111,0b01010,0b01010,0b11111,0b01010,0b00000],
  '$': [0b00100,0b01111,0b10100,0b01110,0b00101,0b11110,0b00100],
  '%': [0b11000,0b11001,0b00010,0b00100,0b01000,0b10011,0b00011],
  '&': [0b01100,0b10010,0b10100,0b01000,0b10101,0b10010,0b01101],
  "'": [0b00100,0b00100,0b00100,0b00000,0b00000,0b00000,0b00000],
  '(': [0b00010,0b00100,0b01000,0b01000,0b01000,0b00100,0b00010],
  ')': [0b01000,0b00100,0b00010,0b00010,0b00010,0b00100,0b01000],
  '*': [0b00000,0b00100,0b10101,0b01110,0b10101,0b00100,0b00000],
  '+': [0b00000,0b00100,0b00100,0b11111,0b00100,0b00100,0b00000],
  ',': [0b00000,0b00000,0b00000,0b00000,0b00110,0b00100,0b01000],
  '-': [0b00000,0b00000,0b00000,0b11111,0b00000,0b00000,0b00000],
  '.': [0b00000,0b00000,0b00000,0b00000,0b00000,0b00110,0b00110],
  '/': [0b00001,0b00010,0b00100,0b01000,0b10000,0b00000,0b00000],
  '0': [0b01110,0b10001,0b10011,0b10101,0b11001,0b10001,0b01110],
  '1': [0b00100,0b01100,0b00100,0b00100,0b00100,0b00100,0b01110],
  '2': [0b01110,0b10001,0b00001,0b00110,0b01000,0b10000,0b11111],
  '3': [0b11111,0b00010,0b00100,0b00010,0b00001,0b10001,0b01110],
  '4': [0b00010,0b00110,0b01010,0b10010,0b11111,0b00010,0b00010],
  '5': [0b11111,0b10000,0b11110,0b00001,0b00001,0b10001,0b01110],
  '6': [0b00110,0b01000,0b10000,0b11110,0b10001,0b10001,0b01110],
  '7': [0b11111,0b00001,0b00010,0b00100,0b01000,0b01000,0b01000],
  '8': [0b01110,0b10001,0b10001,0b01110,0b10001,0b10001,0b01110],
  '9': [0b01110,0b10001,0b10001,0b01111,0b00001,0b00010,0b01100],
  ':': [0b00000,0b00110,0b00110,0b00000,0b00110,0b00110,0b00000],
  ';': [0b00000,0b00110,0b00110,0b00000,0b00110,0b00100,0b01000],
  '<': [0b00010,0b00100,0b01000,0b10000,0b01000,0b00100,0b00010],
  '=': [0b00000,0b00000,0b11111,0b00000,0b11111,0b00000,0b00000],
  '>': [0b01000,0b00100,0b00010,0b00001,0b00010,0b00100,0b01000],
  '?': [0b01110,0b10001,0b00001,0b00110,0b00100,0b00000,0b00100],
  '@': [0b01110,0b10001,0b10111,0b10101,0b10110,0b10000,0b01110],
  'A': [0b01110,0b10001,0b10001,0b11111,0b10001,0b10001,0b10001],
  'B': [0b11110,0b10001,0b10001,0b11110,0b10001,0b10001,0b11110],
  'C': [0b01110,0b10001,0b10000,0b10000,0b10000,0b10001,0b01110],
  'D': [0b11100,0b10010,0b10001,0b10001,0b10001,0b10010,0b11100],
  'E': [0b11111,0b10000,0b10000,0b11110,0b10000,0b10000,0b11111],
  'F': [0b11111,0b10000,0b10000,0b11110,0b10000,0b10000,0b10000],
  'G': [0b01110,0b10001,0b10000,0b10111,0b10001,0b10001,0b01111],
  'H': [0b10001,0b10001,0b10001,0b11111,0b10001,0b10001,0b10001],
  'I': [0b01110,0b00100,0b00100,0b00100,0b00100,0b00100,0b01110],
  'J': [0b00111,0b00010,0b00010,0b00010,0b00010,0b10010,0b01100],
  'K': [0b10001,0b10010,0b10100,0b11000,0b10100,0b10010,0b10001],
  'L': [0b10000,0b10000,0b10000,0b10000,0b10000,0b10000,0b11111],
  'M': [0b10001,0b11011,0b10101,0b10001,0b10001,0b10001,0b10001],
  'N': [0b10001,0b11001,0b10101,0b10011,0b10001,0b10001,0b10001],
  'O': [0b01110,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110],
  'P': [0b11110,0b10001,0b10001,0b11110,0b10000,0b10000,0b10000],
  'Q': [0b01110,0b10001,0b10001,0b10001,0b10101,0b10010,0b01101],
  'R': [0b11110,0b10001,0b10001,0b11110,0b10100,0b10010,0b10001],
  'S': [0b01111,0b10000,0b10000,0b01110,0b00001,0b00001,0b11110],
  'T': [0b11111,0b00100,0b00100,0b00100,0b00100,0b00100,0b00100],
  'U': [0b10001,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110],
  'V': [0b10001,0b10001,0b10001,0b10001,0b10001,0b01010,0b00100],
  'W': [0b10001,0b10001,0b10001,0b10101,0b10101,0b11011,0b10001],
  'X': [0b10001,0b10001,0b01010,0b00100,0b01010,0b10001,0b10001],
  'Y': [0b10001,0b10001,0b01010,0b00100,0b00100,0b00100,0b00100],
  'Z': [0b11111,0b00001,0b00010,0b00100,0b01000,0b10000,0b11111],
  '[': [0b01110,0b01000,0b01000,0b01000,0b01000,0b01000,0b01110],
  '\\': [0b10000,0b01000,0b00100,0b00010,0b00001,0b00000,0b00000],
  ']': [0b01110,0b00010,0b00010,0b00010,0b00010,0b00010,0b01110],
  '^': [0b00100,0b01010,0b10001,0b00000,0b00000,0b00000,0b00000],
  '_': [0b00000,0b00000,0b00000,0b00000,0b00000,0b00000,0b11111],
  '`': [0b01000,0b00100,0b00000,0b00000,0b00000,0b00000,0b00000],
  'a': [0b00000,0b00000,0b01110,0b00001,0b01111,0b10001,0b01111],
  'b': [0b10000,0b10000,0b11110,0b10001,0b10001,0b10001,0b11110],
  'c': [0b00000,0b00000,0b01110,0b10000,0b10000,0b10001,0b01110],
  'd': [0b00001,0b00001,0b01111,0b10001,0b10001,0b10001,0b01111],
  'e': [0b00000,0b00000,0b01110,0b10001,0b11111,0b10000,0b01110],
  'f': [0b00110,0b01001,0b01000,0b11100,0b01000,0b01000,0b01000],
  'g': [0b00000,0b01111,0b10001,0b10001,0b01111,0b00001,0b01110],
  'h': [0b10000,0b10000,0b11110,0b10001,0b10001,0b10001,0b10001],
  'i': [0b00100,0b00000,0b01100,0b00100,0b00100,0b00100,0b01110],
  'j': [0b00010,0b00000,0b00110,0b00010,0b00010,0b10010,0b01100],
  'k': [0b10000,0b10000,0b10010,0b10100,0b11000,0b10100,0b10010],
  'l': [0b01100,0b00100,0b00100,0b00100,0b00100,0b00100,0b01110],
  'm': [0b00000,0b00000,0b11010,0b10101,0b10101,0b10001,0b10001],
  'n': [0b00000,0b00000,0b11110,0b10001,0b10001,0b10001,0b10001],
  'o': [0b00000,0b00000,0b01110,0b10001,0b10001,0b10001,0b01110],
  'p': [0b00000,0b11110,0b10001,0b10001,0b11110,0b10000,0b10000],
  'q': [0b00000,0b01111,0b10001,0b10001,0b01111,0b00001,0b00001],
  'r': [0b00000,0b00000,0b10110,0b11001,0b10000,0b10000,0b10000],
  's': [0b00000,0b00000,0b01111,0b10000,0b01110,0b00001,0b11110],
  't': [0b01000,0b01000,0b11100,0b01000,0b01000,0b01001,0b00110],
  'u': [0b00000,0b00000,0b10001,0b10001,0b10001,0b10011,0b01101],
  'v': [0b00000,0b00000,0b10001,0b10001,0b10001,0b01010,0b00100],
  'w': [0b00000,0b00000,0b10001,0b10001,0b10101,0b10101,0b01010],
  'x': [0b00000,0b00000,0b10001,0b01010,0b00100,0b01010,0b10001],
  'y': [0b00000,0b10001,0b10001,0b01111,0b00001,0b10001,0b01110],
  'z': [0b00000,0b00000,0b11111,0b00010,0b00100,0b01000,0b11111],
};

// Renders text into an ImageData at pixel scale `scale`.
// outline=true adds a 1-scale-px black border around each lit pixel.
// Returns { imageData, width, height } or null.
function mcRenderText(text, r, g, b, scale, outline) {
  scale = Math.max(1, Math.round(scale));
  const GLYPH_W = 5, GLYPH_H = 7, GAP = 1;
  const chars = text.split('').filter(c => MC_FONT[c] || MC_FONT[c.toUpperCase()]);
  if (!chars.length) return null;

  const pad   = outline ? scale : 0;  // extra border padding
  const cellW = (GLYPH_W + GAP) * scale;
  const innerW = chars.length * cellW - GAP * scale;
  const innerH = GLYPH_H * scale;
  const w = innerW + pad * 2;
  const h = innerH + pad * 2;

  const data = new Uint8ClampedArray(w * h * 4);

  function setpx(px, py, cr, cg, cb) {
    if (px < 0 || px >= w || py < 0 || py >= h) return;
    const i = (py * w + px) * 4;
    data[i] = cr; data[i+1] = cg; data[i+2] = cb; data[i+3] = 255;
  }

  // Collect all lit pixel positions first (in inner coords)
  const litPixels = [];
  chars.forEach((ch, ci) => {
    const rows = MC_FONT[ch] || MC_FONT[ch.toUpperCase()] || MC_FONT[' '];
    const ox = ci * cellW;
    rows.forEach((row, ry) => {
      for (let bx = 0; bx < GLYPH_W; bx++) {
        if (row & (1 << (GLYPH_W - 1 - bx))) {
          for (let sy = 0; sy < scale; sy++)
            for (let sx = 0; sx < scale; sx++)
              litPixels.push([ox + bx * scale + sx, ry * scale + sy]);
        }
      }
    });
  });

  // Draw outline first (black, 4-directional, 1px in screen space)
  if (outline) {
    const offsets = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [lx, ly] of litPixels)
      for (const [dx, dy] of offsets)
        setpx(lx + pad + dx, ly + pad + dy, 0, 0, 0);
  }

  // Draw main text on top
  for (const [lx, ly] of litPixels)
    setpx(lx + pad, ly + pad, r, g, b);

  return { imageData: new ImageData(data, w, h), width: w, height: h };
}

// Returns the recommended scale for `text` at `resolution`.
function mcAutoScale(text, resolution) {
  const base = resolution === 128 ? 6 : 3;
  if (text.length <= 3) return base;
  if (text.length <= 5) return Math.max(1, base - 1);
  return Math.max(1, base - 2);
}

// Returns the max allowed scale so text fits within `resolution`.
function mcMaxScale(text, resolution) {
  if (!text.length) return resolution === 128 ? 6 : 3;
  const GLYPH_W = 5, GAP = 1;
  // largest scale where text width <= resolution
  for (let s = resolution === 128 ? 6 : 3; s >= 1; s--) {
    const w = text.length * (GLYPH_W + GAP) * s - GAP * s;
    if (w <= resolution) return s;
  }
  return 1;
}

const Utils = {
  hexToRgba(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: 255 };
  },

  rgbaToHex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  },

  rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0, s = max === 0 ? 0 : d / max, v = max;
    if (d !== 0) {
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return { h: h * 360, s, v };
  },

  hsvToRgb(h, s, v) {
    h /= 360;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    let r, g, b;
    switch (i % 6) {
      case 0: r=v; g=t; b=p; break;
      case 1: r=q; g=v; b=p; break;
      case 2: r=p; g=v; b=t; break;
      case 3: r=p; g=q; b=v; break;
      case 4: r=t; g=p; b=v; break;
      case 5: r=v; g=p; b=q; break;
    }
    return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255) };
  },

  clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },

  showToast(msg, duration = 2000) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), duration);
  }
};
