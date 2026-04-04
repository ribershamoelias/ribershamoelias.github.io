/* Nav scroll */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* Mobile menu */
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('active');
}

/* Typing animation */
const words = [
  "a form of discipline.",
  "the ultimate sophistication.",
  "how it works.",
  "saying no to a thousand things.",
  "an act of care.",
  "structured clarity."
];

let wordIndex = 0;
let charIndex = 0;
const typing = document.getElementById('typing');

function type() {
  if (charIndex < words[wordIndex].length) {
    typing.textContent += words[wordIndex].charAt(charIndex++);
    setTimeout(type, 40);
  } else {
    setTimeout(erase, 1800);
  }
}

function erase() {
  if (charIndex > 0) {
    typing.textContent = words[wordIndex].substring(0, --charIndex);
    setTimeout(erase, 25);
  } else {
    wordIndex = (wordIndex + 1) % words.length;
    setTimeout(type, 400);
  }
}

type();
