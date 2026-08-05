"use strict";

/* Enable JS-only reveal styles (content stays visible without JS) */
document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/* ---------------- tiny helpers ---------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   Scroll progress bar
   ============================================================ */
const progressBar = $("#scroll-progress");

function updateProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  progressBar.style.width = `${max > 0 ? (doc.scrollTop / max) * 100 : 0}%`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

/* ============================================================
   Header shadow + back-to-top visibility
   ============================================================ */
const header = $("#header");
const backToTop = $("#back-to-top");

function updateScrollUI() {
  header.classList.toggle("scrolled", window.scrollY > 10);
  backToTop.classList.toggle("visible", window.scrollY > 500);
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

backToTop.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" }),
);

/* ============================================================
   Theme toggle (light / dark)
   ============================================================ */
const themeToggle = $("#theme-toggle");
const rootEl = document.documentElement;
const themeMeta = document.querySelector('meta[name="theme-color"]');

const THEME_META_COLORS = { light: "#f4f6fb", dark: "#060a13" };

const syncThemeUI = () => {
  if (!themeToggle) return;
  const isDark = rootEl.getAttribute("data-theme") === "dark";
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme",
  );
};

syncThemeUI();

themeToggle?.addEventListener("click", () => {
  const isDark = rootEl.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  rootEl.setAttribute("data-theme", next);

  try {
    localStorage.setItem("theme", next);
  } catch (e) {
    /* private mode / file:// — the in-memory switch still works */
  }

  if (themeMeta) themeMeta.setAttribute("content", THEME_META_COLORS[next]);
  syncThemeUI();
});

/* ============================================================
   Reveal on scroll
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);

$$(".fade-in").forEach((el) => revealObserver.observe(el));

/* ============================================================
   Animated counters
   ============================================================ */
const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || "";

      if (prefersReducedMotion) {
        el.textContent = target + suffix;
      } else {
        const duration = 1400;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          el.textContent = Math.round(target * eased) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      }

      observer.unobserve(el);
    });
  },
  { threshold: 0.6 },
);

$$(".counter").forEach((el) => counterObserver.observe(el));

/* ============================================================
   Typed hero roles
   ============================================================ */
const typedEl = $("#typed");
const roles = [
  "Full-Stack Developer",
  "Cybersecurity Enthusiast",
  "Web Security Learner",
];

if (typedEl) {
  if (prefersReducedMotion) {
    typedEl.textContent = roles[0];
  } else {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const typeTick = () => {
      const word = roles[roleIndex];

      if (!deleting) {
        charIndex += 1;
        typedEl.textContent = word.slice(0, charIndex);
        if (charIndex === word.length) {
          deleting = true;
          setTimeout(typeTick, 2200);
        } else {
          setTimeout(typeTick, 70);
        }
        return;
      }

      charIndex -= 1;
      typedEl.textContent = word.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typeTick, 450);
      } else {
        setTimeout(typeTick, 35);
      }
    };

    typeTick();
  }
}

/* ============================================================
   Mobile navigation
   ============================================================ */
const navBtn = $(".btn-mobile-nav");

navBtn.addEventListener("click", () => header.classList.toggle("nav-open"));

$$(".main-nav-link").forEach((link) =>
  link.addEventListener("click", () => header.classList.remove("nav-open")),
);

/* ============================================================
   Scrollspy — highlight active nav link
   (runs only on pages where nav links are same-page anchors)
   ============================================================ */
const navLinks = $$(".main-nav-link");

if (navLinks.some((link) => link.getAttribute("href").startsWith("#"))) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) =>
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`,
          ),
        );
      });
    },
    { rootMargin: "-40% 0px -55% 0px" },
  );

  $$("main section[id]").forEach((section) => sectionObserver.observe(section));
}

/* ============================================================
   Animated pentest terminal (Security section)
   ============================================================ */
const term = $("#cyber-term");

if (term && !prefersReducedMotion) {
  const termLines = $$(".term-line", term);
  let lineIndex = 0;

  const typeLine = () => {
    if (lineIndex >= termLines.length) return;

    const line = termLines[lineIndex];
    // Output lines carry data-text on the <p> itself; prompt lines
    // carry it on a nested .term-out span. Target whichever exists.
    const target = line.querySelector(".term-out") || line;
    const text = target.dataset.text || "";

    if (!text) {
      lineIndex += 1;
      typeLine();
      return;
    }

    target.textContent = "";
    let charIndex = 0;

    const step = () => {
      charIndex += 1;
      target.textContent = text.slice(0, charIndex);
      if (charIndex < text.length) {
        setTimeout(step, 13);
      } else {
        lineIndex += 1;
        setTimeout(typeLine, 190);
      }
    };

    step();
  };

  const termObserver = new IntersectionObserver(
    (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(term);
      setTimeout(typeLine, 400);
    },
    { threshold: 0.3 },
  );

  termObserver.observe(term);
} else if (term) {
  // Reduced motion: show the final text immediately
  $$(".term-line", term).forEach((line) => {
    const target = line.querySelector(".term-out") || line;
    if (target.dataset.text) target.textContent = target.dataset.text;
  });
}

/* ============================================================
   Booking page — package picker + email-composing form
   ============================================================ */
const bookingForm = $("#booking-form-el");

if (bookingForm) {
  const BOOKING_EMAIL = "emmantey64@gmail.com";
  const packageSelect = $("#b-package");
  const PACKAGE_LABELS = {
    starter: "Starter Landing Page — $99",
    business: "Business Multi-Page Site — $249",
    custom: "Custom Web App (React) — $499",
    audit: "Security Audit — $149",
    other: "Custom / Other — let's discuss",
  };
  const pricingCards = $$(".pricing-card");
  const statusEl = $("#form-status");

  const highlightPackage = (value) => {
    pricingCards.forEach((card) => {
      const match = card.dataset.package === value;
      card.classList.toggle("selected", match);
      const btn = card.querySelector(".btn-book");
      if (!btn) return;
      if (match) {
        // remember the original label once, then mark the card as selected
        if (!btn.dataset.originalLabel) btn.dataset.originalLabel = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Selected — scroll down';
      } else if (btn.dataset.originalLabel) {
        // restore the label when the package is no longer selected
        btn.innerHTML = btn.dataset.originalLabel;
        delete btn.dataset.originalLabel;
      }
    });
  };

  // clicking a card's “Book” button selects the package & scrolls to the form
  pricingCards.forEach((card) => {
    card.querySelector(".btn-book").addEventListener("click", () => {
      packageSelect.value = card.dataset.package;
      highlightPackage(card.dataset.package);
      statusEl.textContent = "";
      document.querySelector("#booking-form").scrollIntoView({ behavior: "smooth" });
    });
  });

  // changing the select manually re-syncs the card highlight
  packageSelect.addEventListener("change", () => {
    highlightPackage(packageSelect.value);
  });

  // mark missing required fields
  const markInvalid = (field) => {
    field.classList.add("invalid");
    field.addEventListener("input", () => field.classList.remove("invalid"), {
      once: true,
    });
  };

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("#b-name");
    const email = $("#b-email");
    const details = $("#b-details");

    let firstInvalid = null;
    [name, email, details].forEach((field) => {
      if (!field.value.trim()) {
        markInvalid(field);
        if (!firstInvalid) firstInvalid = field;
      } else if (field === email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field.value.trim())) {
        markInvalid(field);
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      statusEl.textContent = "Please fill in the highlighted fields before sending.";
      statusEl.classList.add("error");
      return;
    }

    statusEl.classList.remove("error");

    const packageLabel =
      PACKAGE_LABELS[packageSelect.value] ||
      packageSelect.selectedOptions[0]?.textContent ||
      packageSelect.value;

    const subject =
      `[Booking] ${packageLabel} — ${name.value.trim()}`;
    const body =
      `Hi Emmanuel,\n\n` +
      `I'd like to book you for a project. Here are my details:\n\n` +
      `• Name: ${name.value.trim()}\n` +
      `• Email: ${email.value.trim()}\n` +
      `• Package: ${packageLabel}\n` +
      `• Budget: ${$("#b-budget").value}\n` +
      `• Timeline: ${$("#b-timeline").value}\n\n` +
      `Project details:\n${details.value.trim()}\n\n` +
      `Looking forward to hearing from you!`;

    const mailto =
      `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

    statusEl.textContent =
      "✔ Your email draft should have opened — just hit send. If it didn't, email me directly at " +
      BOOKING_EMAIL +
      ". I'll reply within 24 hours.";
  });
}
