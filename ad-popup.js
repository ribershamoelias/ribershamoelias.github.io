
document.addEventListener("DOMContentLoaded", () => {
  // Select all elements that should trigger the promo popup
  const ads = document.querySelectorAll(".promo-trigger, .promo-ad");
  if (!ads.length) return;

  const modal = document.createElement("div");
  modal.className = "discount-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="discount-dialog" role="dialog" aria-modal="true" aria-labelledby="discount-title">
      <button class="discount-close" type="button" aria-label="Close">×</button>
      <span class="discount-kicker">Powerwing Offer</span>
      <h2 id="discount-title">Copy your discount code</h2>
      <p>Use this code at checkout before opening the offer.</p>
      <button class="discount-code" type="button">NOEXCUSE10</button>
      <div class="discount-actions">
        <button class="discount-copy" type="button">Copy Code</button>
        <a class="discount-continue" href="https://powerwing.co/rsenoexcuse" target="_blank" rel="noopener">Continue</a>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = modal.querySelector(".discount-close");
  const codeButton = modal.querySelector(".discount-code");
  const copy = modal.querySelector(".discount-copy");
  const continueLink = modal.querySelector(".discount-continue");
  let activeCode = "NOEXCUSE10";

  const writeClipboard = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      copy.textContent = "Copied";
      codeButton.textContent = activeCode;
    } catch {
      copy.textContent = "Select Code";
    }
  };

  const openModal = (url, code) => {
    activeCode = code || "NOEXCUSE10";
    codeButton.textContent = activeCode;
    copy.textContent = "Copy Code";
    continueLink.href = url;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  };

  ads.forEach((ad) => {
    ad.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(ad.dataset.adUrl, ad.dataset.discountCode);
    });
  });

  codeButton.addEventListener("click", writeClipboard);
  copy.addEventListener("click", writeClipboard);
  close.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
});
