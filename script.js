/* DRX Cleaning Company — Safe front-end interactions + backend quote form */
(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("in"));
  }

  const mainNav = document.getElementById("mainNav");
  if (mainNav) {
    window.addEventListener(
      "scroll",
      () => {
        mainNav.style.boxShadow =
          window.scrollY > 60 ? "0 4px 30px rgba(0,0,0,0.35)" : "none";
      },
      { passive: true },
    );
  }

  const quoteForm = document.getElementById("quoteForm");
  if (quoteForm) {
    quoteForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const btn = document.getElementById("submitBtn");
      if (!btn) return;

      if (!quoteForm.checkValidity()) {
        quoteForm.reportValidity();
        return;
      }

      const originalHtml = btn.innerHTML;
      const formData = new FormData(quoteForm);
      const payload = Object.fromEntries(formData.entries());

      // Helps you identify which page generated the lead.
      payload.page = window.location.href;

      btn.disabled = true;
      btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> Sending...';

      try {
        const response = await fetch(
          "https://drx-cleaning-backend.vercel.app/api/quote",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              phone,
              email,
              service,
              message,
            }),
          },
        );
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Quote request failed");
        }

        btn.classList.add("sent");
        btn.innerHTML =
          '<i class="bi bi-check-circle-fill me-2"></i> Sent! We\'ll contact you shortly.';
        btn.style.background = "linear-gradient(135deg,#1a7a45,#22a05a)";
        quoteForm.reset();
      } catch (error) {
        console.error("Quote form error:", error);
        btn.disabled = false;
        btn.innerHTML = originalHtml;
        alert("Something went wrong. Please call or text (321) 315-8595.");
      }
    });
  }
})();

// LOADER
const loader = document.querySelector(".page-loader");

window.addEventListener("load", () => {
  if (!loader) return;

  setTimeout(() => {
    loader.classList.add("hide-loader");
  }, 900);
});
