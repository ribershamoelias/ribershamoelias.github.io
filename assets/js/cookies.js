document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("accept-cookies");
  const declineBtn = document.getElementById("decline-cookies");

  const consentGiven = localStorage.getItem("cookiesAccepted");
  if (!consentGiven) {
    banner.style.display = "block";
  } else if (consentGiven === "true") {
    loadAnalytics();
  }

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("cookiesAccepted", "true");
    banner.style.display = "none";
    loadAnalytics();
  });

  declineBtn.addEventListener("click", () => {
    localStorage.setItem("cookiesAccepted", "false");
    banner.style.display = "none";
  });

  function loadAnalytics() {
    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-WFZJ9JDJBT";
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-WFZJ9JDJBT', { anonymize_ip: true });
  }
});
