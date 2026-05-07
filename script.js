/* DRX Cleaning Company — Safe front-end interactions */
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
    quoteForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const btn = document.getElementById("submitBtn");
      if (!btn) return;
      btn.innerHTML =
        '<i class="bi bi-check-circle-fill me-2"></i> Quote Requested — We\'ll Call You Shortly!';
      btn.style.background = "linear-gradient(135deg,#1a7a45,#22a05a)";
      btn.disabled = true;
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
