// Lade Header & Footer
function loadComponents() {
  fetch("../components/header.html")
    .then(res => res.text())
    .then(data => document.getElementById("header").innerHTML = data)
    .then(() => bindLanguageButtons())
    .catch(err => console.error("Header konnte nicht geladen werden:", err));

  fetch("../components/footer.html")
    .then(res => res.text())
    .then(data => document.getElementById("footer").innerHTML = data)
    .catch(err => console.error("Footer konnte nicht geladen werden:", err));
}

// Sprache automatisch erkennen
function detectLanguage() {
  const stored = localStorage.getItem("lang");
  if (stored) return stored;

  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  if (browserLang === "fr") return "fr";
  if (["de", "at", "ch"].includes(browserLang)) return "de";
  return "en";
}

// Sprache setzen
function setLanguage(lang) {
  localStorage.setItem("lang", lang);
  applyTranslations(lang);
}

// Übersetzungen anwenden
function applyTranslations(lang) {
  const t = translations[lang];

  if (!t) return;

  const idMap = {
    title: "title",
    desc: "desc",
    thanks: "thanks",
    "contact-headline": "contactHeadline",
    "contact-desc": "contactDesc",
    "services-title": "servicesTitle",
    "services-desc": "servicesDesc"
  };

  for (const id in idMap) {
    const el = document.getElementById(id);
    if (el && t[idMap[id]]) el.innerText = t[idMap[id]];
  }

  const reasonsList = document.getElementById("reasons");
  if (reasonsList && Array.isArray(t.reasons)) {
    reasonsList.innerHTML = "";
    t.reasons.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      reasonsList.appendChild(li);
    });
  }

  const servicesList = document.getElementById("features-list");
  if (servicesList && Array.isArray(t.servicesList)) {
    servicesList.innerHTML = "";
    t.servicesList.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      servicesList.appendChild(li);
    });
  }
}

// Sprachwahl über Buttons
function setLanguage(lang) {
  localStorage.setItem("lang", lang);
  applyTranslations(lang);
}

// Sprache automatisch erkennen (Geo/IP oder Browser)
function detectLanguage() {
  const saved = localStorage.getItem("lang");
  if (saved) return saved;

  const userLang = navigator.language || navigator.userLanguage;
  if (userLang.startsWith("fr")) return "fr";
  if (userLang.startsWith("de")) return "de";
  return "en"; // Fallback
}

// Initialisierung
document.addEventListener("DOMContentLoaded", () => {
  const lang = detectLanguage();
  applyTranslations(lang);
});


// Cookie-Banner
function initCookieBanner() {
  const banner = document.getElementById("cookie-banner");
  if (!localStorage.getItem("cookiesAccepted")) {
    banner.style.display = "block";
  }
}

function acceptCookies() {
  localStorage.setItem("cookiesAccepted", "true");
  document.getElementById("cookie-banner").style.display = "none";
  location.reload();
}

// Sternenhimmel generieren
function generateStars() {
  const stars = document.getElementById("stars");
  if (!stars) return;
  for (let i = 0; i < 120; i++) {
    const star = document.createElement("div");
    star.style.top = Math.random() * 100 + 'vh';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.animationDelay = (Math.random() * 3) + 's';
    stars.appendChild(star);
  }
}

// Initialisierung
document.addEventListener("DOMContentLoaded", () => {
  loadComponents();
  generateStars();
  initCookieBanner();
  const lang = detectLanguage();
  applyTranslations(lang);
});
