document.addEventListener("DOMContentLoaded", () => {
  /* DRX Cleaning Company — Safe front-end interactions + backend quote form */

  // Lazy load reCAPTCHA only when user interacts with the form
  let recaptchaLoaded = false;

  function loadRecaptcha() {
    if (recaptchaLoaded) return;

    recaptchaLoaded = true;

    const script = document.createElement("script");
    script.src =
      "https://www.google.com/recaptcha/api.js?onload=onRecaptchaApiLoad&render=explicit";
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);
  }

  (() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
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
        { threshold: 0.12 }
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
        { passive: true }
      );
    }

    const quoteForm = document.getElementById("quoteForm");

    if (quoteForm) {
      quoteForm.addEventListener("focusin", loadRecaptcha, {
        once: true,
      });

      quoteForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        loadRecaptcha();

        const btn = document.getElementById("submitBtn");
        if (!btn) return;

        if (!quoteForm.checkValidity()) {
          quoteForm.reportValidity();
          return;
        }

        const originalHtml = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> Sending...';

        try {
          let recaptchaToken = "";

          if (
            window.grecaptcha &&
            typeof grecaptcha.execute === "function" &&
            window.RECAPTCHA_WIDGET_ID !== undefined
          ) {
            grecaptcha.reset(window.RECAPTCHA_WIDGET_ID);

            recaptchaToken = await new Promise((resolve, reject) => {
              try {
                window.__recaptchaResolve = resolve;
                window.__recaptchaReject = reject;
                grecaptcha.execute(window.RECAPTCHA_WIDGET_ID);
              } catch (err) {
                reject(err);
              }
            });
          }

          const formData = new FormData(quoteForm);
          const payload = Object.fromEntries(formData.entries());

          payload.page = window.location.href;
          payload.recaptchaToken = recaptchaToken;

          const response = await fetch(
            "https://drx-cleaning-backend.vercel.app/api/quote",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          );

          const result = await response.json().catch(() => ({}));

          console.log("Quote API response:", result);

          if (!response.ok) {
            throw new Error(result.error || "Quote request failed");
          }

          btn.classList.add("sent");
          btn.innerHTML =
            '<i class="bi bi-check-circle-fill me-2"></i> Sent! We\'ll contact you shortly.';
          btn.style.background = "linear-gradient(135deg,#1a7a45,#22a05a)";

          quoteForm.reset();

          if (window.grecaptcha && window.RECAPTCHA_WIDGET_ID !== undefined) {
            grecaptcha.reset(window.RECAPTCHA_WIDGET_ID);
          }
        } catch (error) {
          console.error("Quote form error:", error);

          btn.disabled = false;
          btn.innerHTML = originalHtml;

          alert("Something went wrong. Please call or text (321) 315-8595.");
        }
      });
    }
  })();

  // reCAPTCHA Invisible v2 — render + callback wiring
  window.onRecaptchaApiLoad = function () {
    const container = document.getElementById("recaptchaContainer");
    if (!container || !window.grecaptcha) return;

    if (window.RECAPTCHA_WIDGET_ID !== undefined) return;

    window.RECAPTCHA_WIDGET_ID = grecaptcha.render("recaptchaContainer", {
      sitekey: "6Lel5bQrAAAAAMGh1WhrRVG2pEQE1twUsfFdb_pF",
      size: "invisible",
      badge: "inline",
      callback: function (token) {
        if (window.__recaptchaResolve) {
          window.__recaptchaResolve(token);
          window.__recaptchaResolve = null;
        }
      },
      "error-callback": function () {
        if (window.__recaptchaReject) {
          window.__recaptchaReject(new Error("reCAPTCHA failed to verify"));
          window.__recaptchaReject = null;
        }
      },
    });
  };

  // LOADER
  const loader = document.querySelector(".page-loader");

  window.addEventListener("load", () => {
    if (!loader) return;

    setTimeout(() => {
      loader.classList.add("hide-loader");
    }, 200);
  });

  // HERO VIDEO — desktop/tablet only
  window.addEventListener("load", () => {
    const heroVideo = document.querySelector(".hero-video");
    if (!heroVideo) return;

    if (window.innerWidth < 768) {
      return;
    }

    if (heroVideo.dataset.loaded === "true") {
      return;
    }

    heroVideo.dataset.loaded = "true";

    const source = document.createElement("source");

    if (window.innerWidth <= 992) {
      source.src = "videos/cleaning-hero-tablet.webm";
    } else {
      source.src = "videos/cleaning-hero.webm";
    }

    source.type = "video/webm";

    heroVideo.appendChild(source);
    heroVideo.preload = "auto";
    heroVideo.autoplay = true;

    heroVideo.load();
    heroVideo.play().catch(() => {});
  });
});