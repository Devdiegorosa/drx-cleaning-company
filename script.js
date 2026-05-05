/* ── Scroll reveal ── */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("in");
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

/* ── Navbar scroll effect ── */
window.addEventListener("scroll", () => {
  document.getElementById("mainNav").style.boxShadow =
    window.scrollY > 60 ? "0 4px 30px rgba(0,0,0,0.35)" : "none";
});

/* ── Smooth active link highlight ── */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("#navMenu .nav-link");
window.addEventListener("scroll", () => {
  let cur = "";
  sections.forEach((s) => {
    if (window.scrollY >= s.offsetTop - 120) cur = s.getAttribute("id");
  });
  navLinks.forEach((l) => {
    l.classList.toggle("active", l.getAttribute("href") === "#" + cur);
  });
});

/* ── Form submit handler ── */
document.getElementById("quoteForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const btn = document.getElementById("submitBtn");
  btn.innerHTML =
    '<i class="bi bi-check-circle-fill me-2"></i> Quote Requested — We\'ll Call You Shortly!';
  btn.style.background = "linear-gradient(135deg,#1a7a45,#22a05a)";
  btn.disabled = true;
});

