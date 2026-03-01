// Riber Shamo Elias - Personal Website
// Interactive features

console.log("🚀 Welcome to Riber's personal website");
console.log("Structure. Change. Discipline.");

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href !== '#0') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

// Active navigation highlighting
window.addEventListener('scroll', () => {
  const navLinks = document.querySelectorAll('.nav-menu a');
  
  navLinks.forEach(link => {
    const sectionId = link.getAttribute('href').substring(1);
    const section = document.getElementById(sectionId);
    
    if (section) {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(l => l.style.color = '#b0b0b0');
        link.style.color = '#667eea';
      }
    }
  });
});

// analytics functionality removed

// Deprecated tracking functions have been removed.

// Load animation on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ Personal website loaded successfully');
  
  // Add fade-in animation to cards
  const cards = document.querySelectorAll('.project-card, .value-card, .contact-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.animation = `fadeIn 0.6s ease forwards`;
    card.style.animationDelay = `${index * 0.1}s`;
  });
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// Mobile menu toggle (if navbar menu needs it in future)
function toggleMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  if (navMenu) {
    navMenu.classList.toggle('active');
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Quick navigation with Alt + key
  if (e.altKey) {
    const shortcuts = {
      'a': '#about',
      'p': '#projects',
      's': '#skills',
      'c': '#contact'
    };
    
    if (shortcuts[e.key]) {
      const target = document.querySelector(shortcuts[e.key]);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
});

// Print current year in footer (if needed)
function updateYear() {
  const year = new Date().getFullYear();
  const footerText = document.querySelector('.footer p');
  if (footerText && footerText.textContent.includes('2026')) {
    footerText.textContent = footerText.textContent.replace('2026', year.toString());
  }
}

updateYear();

// Service Worker registration (optional)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {
    // Service worker registration failed
  });
}

console.log('💪 Ready to make an impact!');
