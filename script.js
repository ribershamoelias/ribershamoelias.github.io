function toggleLang() {
  var next = document.documentElement.lang === 'de' ? 'en' : 'de';
  document.documentElement.lang = next;
  localStorage.setItem('noexcuse-lang', next);
  document.querySelectorAll('.lang-toggle').forEach(function(btn) {
    btn.textContent = next === 'de' ? 'EN' : 'DE';
  });
}

document.addEventListener("DOMContentLoaded", () => {
  var savedLang = localStorage.getItem('noexcuse-lang') || 'de';
  var isGerman = () => document.documentElement.lang !== 'en';
  document.querySelectorAll('.lang-toggle').forEach(function(btn) {
    btn.textContent = savedLang === 'de' ? 'EN' : 'DE';
  });
  const glow = document.getElementById("mouse-glow");
  const bg = document.getElementById("bg-parallax");
  const nav = document.querySelector(".site-nav-shell");

  if (glow && bg && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.addEventListener("mousemove", (event) => {
      const x = event.clientX;
      const y = event.clientY;
      glow.style.left = `${x - window.innerWidth * 0.3}px`;
      glow.style.top = `${y - window.innerWidth * 0.3}px`;
      bg.style.transform = `scale(1.05) translate(${(x - window.innerWidth / 2) * 0.01}px, ${(y - window.innerHeight / 2) * 0.01}px)`;
    });
  }

  if (nav) {
    const updateNav = () => {
      nav.classList.toggle("scrolled", window.scrollY > 50);
    };
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
  }

  const revealItems = document.querySelectorAll(".card, .recipe-card, .feature, .gallery-item, .challenge-card, .stat-card, .legal-box, .guide-panel, .info-tile, .partner-callout, .quick-guide, .tool-card");
  revealItems.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(30px)";
    item.style.transition = "opacity 0.7s ease, transform 0.7s ease, border-color 0.35s ease, background 0.35s ease";
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealItems.forEach((item) => observer.observe(item));

  document.querySelectorAll("[data-transition]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || link.target === "_blank") return;
      event.preventDefault();
      document.body.style.transition = "opacity 0.35s ease";
      document.body.style.opacity = "0";
      window.setTimeout(() => {
        window.location.href = href;
      }, 220);
    });
  });

  document.querySelectorAll("[data-modal-target]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const modal = document.getElementById(trigger.dataset.modalTarget);
      if (!modal) return;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  const closeModals = () => {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    });
    document.body.style.overflow = "";
  };

  document.querySelectorAll("[data-modal-close]").forEach((trigger) => {
    trigger.addEventListener("click", closeModals);
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModals();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModals();
  });

  const numberValue = (id) => {
    const el = document.getElementById(id);
    return el ? Number(el.value) : 0;
  };

  const selectValue = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : "";
  };

  const recommendationBlock = (text, links) => {
    const title = isGerman() ? "Passende Empfehlung" : "Recommended Next Step";
    return `<div class="tool-recommendation"><b>${title}</b><span>${text}</span>${links.map((link) => `<a href="${link.href}">${link.label}</a>`).join("")}</div>`;
  };

  const result = (id, headline, details) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = `<strong>${headline}</strong><div class="tool-result-details">${details}</div>`;
  };

  const round = (value) => Math.round(value);

  const updateCalories = () => {
    if (!document.getElementById("cal-result")) return;
    const sex = selectValue("cal-sex");
    const goal = selectValue("cal-goal");
    const weight = numberValue("cal-weight");
    const height = numberValue("cal-height");
    const age = numberValue("cal-age");
    const activity = Number(selectValue("cal-activity"));
    if (!weight || !height || !age || !activity) return;

    const bmr = 10 * weight + 6.25 * height - 5 * age + (sex === "male" ? 5 : -161);
    const maintenance = bmr * activity;
    const target = goal === "cut" ? maintenance - 400 : goal === "bulk" ? maintenance + 300 : maintenance;
    const protein = round(weight * (goal === "cut" ? 2.1 : 1.9));
    const fat = round(weight * 0.8);
    const carbs = Math.max(0, round((target - protein * 4 - fat * 9) / 4));
    const label = isGerman() ? "Ziel" : "Target";
    const details = isGerman()
      ? `Erhalt: ${round(maintenance)} kcal · Protein: ${protein}g · Fett: ${fat}g · Carbs: ${carbs}g`
      : `Maintenance: ${round(maintenance)} kcal · Protein: ${protein}g · Fat: ${fat}g · Carbs: ${carbs}g`;
    const recText = goal === "cut"
      ? (isGerman() ? "Für dieses Ziel passen ein moderates Defizit, Krafttraining und der Cutting Plan." : "For this goal, a moderate deficit, strength training and the cutting plan fit well.")
      : goal === "bulk"
        ? (isGerman() ? "Für dieses Ziel passen ein kleiner Überschuss, Progression und der Bulking Plan." : "For this goal, a small surplus, progression and the bulking plan fit well.")
        : (isGerman() ? "Für Erhalt passen stabile Mahlzeiten und ein wiederholbarer Trainingsplan." : "For maintenance, stable meals and a repeatable training plan fit well.");
    const recLinks = goal === "cut"
      ? [{ href: "../nutrition/cutting-plan.html", label: isGerman() ? "Cutting Plan" : "Cutting Plan" }, { href: "../training/calisthenics-beginner.html", label: "Clean Start" }]
      : goal === "bulk"
        ? [{ href: "../nutrition/bulking-plan.html", label: isGerman() ? "Bulking Plan" : "Bulking Plan" }, { href: "../training/evolution-peak.html", label: "Evolution Peak" }]
        : [{ href: "../nutrition/", label: "Nutrition" }, { href: "../training/calisthenics-skill-plan.html", label: "Skill Engine" }];
    result("cal-result", `${label}: ${round(target)} kcal`, details + recommendationBlock(recText, recLinks));
  };

  const updateBmi = () => {
    if (!document.getElementById("bmi-result")) return;
    const weight = numberValue("bmi-weight");
    const height = numberValue("bmi-height") / 100;
    if (!weight || !height) return;
    const bmi = weight / (height * height);
    const categoryDe = bmi < 18.5 ? "unter dem Normalbereich" : bmi < 25 ? "im Normalbereich" : bmi < 30 ? "im Übergewichtsbereich" : "im Adipositasbereich";
    const categoryEn = bmi < 18.5 ? "below the normal range" : bmi < 25 ? "in the normal range" : bmi < 30 ? "in the overweight range" : "in the obesity range";
    const recText = bmi < 18.5
      ? (isGerman() ? "Wenn du zunehmen willst, starte ruhig mit mehr Essen, Krafttraining und Geduld. Bitte achte besonders auf dein Wohlbefinden." : "If you want to gain weight, start calmly with more food, strength training and patience. Please pay special attention to wellbeing.")
      : bmi < 25
        ? (isGerman() ? "Ein guter Fokus kann Leistung, Kraft, Skills und Körpergefühl sein statt nur Gewicht." : "A good focus can be performance, strength, skills and body feeling instead of only weight.")
        : (isGerman() ? "Wenn du Fett verlieren willst, wähle ein moderates Defizit und einen Plan, der dich stärker macht." : "If you want to lose fat, choose a moderate deficit and a plan that makes you stronger.");
    const recLinks = bmi < 18.5
      ? [{ href: "../nutrition/bulking-plan.html", label: isGerman() ? "Bulking Plan" : "Bulking Plan" }, { href: "../training/calisthenics-beginner.html", label: "Clean Start" }]
      : bmi < 25
        ? [{ href: "../training/calisthenics-skill-plan.html", label: "Skill Engine" }, { href: "../nutrition/", label: "Nutrition" }]
        : [{ href: "../nutrition/cutting-plan.html", label: isGerman() ? "Cutting Plan" : "Cutting Plan" }, { href: "../training/calisthenics-beginner.html", label: "Clean Start" }];
    result("bmi-result", `BMI: ${bmi.toFixed(1)}`, (isGerman() ? `Ein grober Orientierungswert: ${categoryDe}.` : `A rough orientation value: ${categoryEn}.`) + recommendationBlock(recText, recLinks));
  };

  const updateProtein = () => {
    if (!document.getElementById("protein-result")) return;
    const weight = numberValue("protein-weight");
    const goal = selectValue("protein-goal");
    if (!weight) return;
    const factor = goal === "cut" ? 2.1 : goal === "bulk" ? 1.8 : 1.9;
    const protein = round(weight * factor);
    const waterLow = (weight * 0.03).toFixed(1);
    const waterHigh = (weight * 0.04).toFixed(1);
    const details = isGerman()
      ? `Wasser: ca. ${waterLow}-${waterHigh} Liter pro Tag. Bei Hitze oder viel Schwitzen mehr.`
      : `Water: about ${waterLow}-${waterHigh} litres per day. More with heat or heavy sweating.`;
    const recText = goal === "cut"
      ? (isGerman() ? "Protein hilft beim Sattwerden und Muskelerhalt. Kombiniere es mit dem Cutting Plan." : "Protein helps with satiety and muscle retention. Combine it with the cutting plan.")
      : goal === "bulk"
        ? (isGerman() ? "Für Masseaufbau zählen Protein, genug Kalorien und progressive Einheiten." : "For mass gain, protein, enough calories and progressive sessions matter.")
        : (isGerman() ? "Für Fitness und Alltag reichen einfache, wiederholbare proteinreiche Mahlzeiten." : "For fitness and daily life, simple repeatable high-protein meals work well.");
    const recLinks = goal === "cut"
      ? [{ href: "../nutrition/cutting-plan.html", label: "Cutting Plan" }, { href: "../nutrition/greek-yogurt-stack.html", label: "Greek Yogurt" }]
      : goal === "bulk"
        ? [{ href: "../nutrition/bulking-plan.html", label: "Bulking Plan" }, { href: "../nutrition/chicken-rice-bowl.html", label: "Chicken Bowl" }]
        : [{ href: "../nutrition/", label: "Nutrition" }, { href: "../training/", label: "Training" }];
    result("protein-result", `${protein}g Protein`, details + recommendationBlock(recText, recLinks));
  };

  const updatePace = () => {
    if (!document.getElementById("pace-result")) return;
    const distance = numberValue("pace-distance");
    const minutes = numberValue("pace-minutes");
    if (!distance || !minutes) return;
    const pace = minutes / distance;
    const paceMin = Math.floor(pace);
    const paceSec = Math.round((pace - paceMin) * 60).toString().padStart(2, "0");
    const speed = distance / (minutes / 60);
    const details = isGerman()
      ? `Durchschnittsgeschwindigkeit: ${speed.toFixed(1)} km/h.`
      : `Average speed: ${speed.toFixed(1)} km/h.`;
    const recText = pace > 7
      ? (isGerman() ? "Baue erst eine ruhige Basis auf. Krafttraining und lockere Läufe helfen mehr als ständiges Vollgas." : "Build a calm base first. Strength training and easy runs help more than constant all-out efforts.")
      : pace > 5
        ? (isGerman() ? "Solide Pace. Für Challenges helfen Core, Beine und kontrolliertes Pacing." : "Solid pace. For challenges, core, legs and controlled pacing help.")
        : (isGerman() ? "Starke Pace. Achte darauf, Regeneration und Mobility nicht zu vernachlässigen." : "Strong pace. Make sure recovery and mobility do not get neglected.");
    const recLinks = pace > 7
      ? [{ href: "../training/calisthenics-beginner.html", label: "Clean Start" }, { href: "../nutrition/post-run-shake.html", label: "Post-Run Shake" }]
      : pace > 5
        ? [{ href: "../challenges/", label: "Challenges" }, { href: "../training/evolution-peak.html", label: "Evolution Peak" }]
        : [{ href: "../training/calisthenics-skill-plan.html", label: "Skill Engine" }, { href: "../challenges/no-excuse-7k-challenge.html", label: "7K Mission" }];
    result("pace-result", `${paceMin}:${paceSec} min/km`, details + recommendationBlock(recText, recLinks));
  };

  const updateTools = () => {
    updateCalories();
    updateBmi();
    updateProtein();
    updatePace();
  };

  document.querySelectorAll(".tool-card input, .tool-card select").forEach((field) => {
    field.addEventListener("input", updateTools);
    field.addEventListener("change", updateTools);
  });
  document.querySelectorAll(".lang-toggle").forEach((btn) => {
    btn.addEventListener("click", () => window.setTimeout(updateTools, 0));
  });
  updateTools();
});
