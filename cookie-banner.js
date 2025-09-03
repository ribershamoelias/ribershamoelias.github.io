
  const banner = document.getElementById("cookie-banner");

  // Check ob User schon gewählt hat
  if (localStorage.getItem("cookieConsent")) {
    banner.style.display = "none";
    if (localStorage.getItem("cookieConsent") === "accepted") {
      loadAnalytics();
    }
  }

  function acceptCookies() {
    localStorage.setItem("cookieConsent", "accepted");
    banner.style.display = "none";
    loadAnalytics();
  }

  function declineCookies() {
    localStorage.setItem("cookieConsent", "declined");
    banner.style.display = "none";
  }

  // Analytics nur laden wenn akzeptiert
  function loadAnalytics() {
    const scriptTag = document.createElement("script");
    scriptTag.async = true;
    scriptTag.src = "https://www.googletagmanager.com/gtag/js?id=G-WFZJ9JDJBT";
    document.head.appendChild(scriptTag);

    scriptTag.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag("js", new Date());
      gtag("config", "G-WFZJ9JDJBT", { anonymize_ip: true });
    };
  }
