// main.js

document.addEventListener("DOMContentLoaded", function () {
  const content = {
    de: {
      title: "RSE Systems – Webseite in Überarbeitung",
      desc: "Unsere Webseite wird derzeit überarbeitet, um Ihnen künftig einen besseren Service zu bieten.",
      reasons: [
        "Modernes und benutzerfreundliches Webdesign",
        "Lizenzverwaltung & Updates für unsere Kundensoftware",
        "Integration neuer Projekte und Softwarelösungen",
        "Einführung eines aktuellen News- & Info-Bereichs"
      ],
      thanks: "Wir sind bald wieder online – danke für Ihr Verständnis!"
    },
    en: {
      title: "RSE Systems – Website Under Maintenance",
      desc: "Our website is currently undergoing maintenance to serve you better.",
      reasons: [
        "Modern and user-friendly web design",
        "License management and updates for our client software",
        "Integration of new projects and software solutions",
        "Launch of a new news and information section"
      ],
      thanks: "We’ll be back soon – thank you for your patience!"
    },
    fr: {
      title: "RSE Systems – Site en maintenance",
      desc: "Notre site est en cours de maintenance pour mieux vous servir.",
      reasons: [
        "Conception Web moderne et conviviale",
        "Gestion des licences et mises à jour logicielles pour nos clients",
        "Intégration de nouveaux projets et solutions logicielles",
        "Lancement d'une nouvelle section d'actualités et d'informations"
      ],
      thanks: "Nous serons bientôt de retour – merci de votre compréhension !"
    }
  };

  window.setLanguage = function(lang) {
    const c = content[lang];
    document.getElementById('title').innerText = c.title;
    document.getElementById('desc').innerText = c.desc;
    const reasonsList = document.getElementById('reasons');
    reasonsList.innerHTML = '';
    c.reasons.forEach(reason => {
      const li = document.createElement('li');
      li.innerText = reason;
      reasonsList.appendChild(li);
    });
    document.getElementById('thanks').innerText = c.thanks;
  }

  // Generate stars background
  const stars = document.getElementById('stars');
  for (let i = 0; i < 120; i++) {
    const star = document.createElement('div');
    star.style.top = Math.random() * 100 + 'vh';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.animationDelay = (Math.random() * 3) + 's';
    stars.appendChild(star);
  }
});
