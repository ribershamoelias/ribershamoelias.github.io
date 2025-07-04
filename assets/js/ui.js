// ScrollReveal (optional mit CDN oder manuell inkludieren)
window.addEventListener('DOMContentLoaded', () => {
  // ScrollReveal aktivieren (falls verfügbar)
  if (typeof ScrollReveal !== "undefined") {
    ScrollReveal().reveal('.reveal', {
      distance: '40px',
      duration: 1000,
      easing: 'ease-out',
      origin: 'bottom',
      reset: false
    });
  }

  // Sterne animieren (dynamisch erzeugen)
  const stars = document.getElementById('stars');
  if (stars) {
    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.style.top = Math.random() * 100 + 'vh';
      star.style.left = Math.random() * 100 + 'vw';
      star.style.animationDelay = (Math.random() * 3) + 's';
      stars.appendChild(star);
    }
  }

  // Dark Mode Umschaltung (optional)
  const toggle = document.getElementById('darkmode-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark');
    }
  }

  // Easter Egg sichtbar machen
  const egg = document.querySelector('.easter-egg');
  if (egg) {
    egg.addEventListener('click', () => {
      alert('🪐 Du hast den versteckten Stern gefunden!');
    });
  }
});
