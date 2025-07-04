// main.js – für statische Sprachseitenstruktur

// Cookie-Banner anzeigen (nur beim ersten Besuch)
if (!localStorage.getItem("cookiesAccepted")) {
  document.getElementById("cookie-banner").style.display = "block";
}

// Cookie-Banner akzeptieren
function acceptCookies() {
  localStorage.setItem("cookiesAccepted", "true");
  document.getElementById("cookie-banner").style.display = "none";
  location.reload();
}

// Lade Header & Footer basierend auf Sprache (z. B. /en/, /de/, /fr/)
function loadHeaderFooter() {
  const path = window.location.pathname;
  const lang = path.includes("/en/") ? "en" : path.includes("/fr/") ? "fr" : "de";

  fetch(`/components/${lang}/header.html`)
    .then(res => res.text())
    .then(data => {
      const header = document.getElementById("header");
      if (header) header.innerHTML = data;
    })
    .catch(err => console.error("Header konnte nicht geladen werden:", err));

  fetch(`/components/${lang}/footer.html`)
    .then(res => res.text())
    .then(data => {
      const footer = document.getElementById("footer");
      if (footer) footer.innerHTML = data;
    })
    .catch(err => console.error("Footer konnte nicht geladen werden:", err));
}

// Sternenhimmel generieren (optional)
function createStars() {
  const starsContainer = document.getElementById("stars");
  if (!starsContainer) return;

  for (let i = 0; i < 120; i++) {
    const star = document.createElement("div");
    star.style.top = Math.random() * 100 + "vh";
    star.style.left = Math.random() * 100 + "vw";
    star.style.animationDelay = (Math.random() * 3) + "s";
    starsContainer.appendChild(star);
  }
}

// Initialisierung
document.addEventListener("DOMContentLoaded", () => {
  loadHeaderFooter();
  createStars();
});