document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".link-button").forEach((link, index) => {
    window.setTimeout(() => {
      link.classList.add("is-visible");
    }, 80 * index);
  });
});
