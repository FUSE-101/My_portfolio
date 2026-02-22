const faders = document.querySelectorAll(".fade-in");

const appearOnScroll = new IntersectionObserver(
  function (entries, observer) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.1 },
);

faders.forEach((fader) => {
  appearOnScroll.observe(fader);
});


///////////////////////////////////////////////////////////
// Make mobile navigation work

const btnNavEl = document.querySelector(".btn-mobile-nav");
const headerEl = document.querySelector("header");

btnNavEl.addEventListener("click", function () {
  headerEl.classList.toggle("nav-open");
});



// const allLinks = document.querySelectorAll("a:link");

allLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const href = link.getAttribute("href");

    // Close mobile naviagtion
    if (link.classList.contains("main-nav-link"))
      headerEl.classList.toggle("nav-open");
  });
});