const body = document.body;
const loaderTick = document.getElementById("loader-tick");
const scrollPercent = document.getElementById("scroll-percent");
const splitLinks = Array.from(document.querySelectorAll(".split-link"));
const kineticRows = Array.from(document.querySelectorAll("[data-kinetic]"));
const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
const revealRows = Array.from(document.querySelectorAll(".reveal-row"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

splitLinks.forEach((link) => {
  const text = link.dataset.split || link.textContent.trim();
  link.dataset.spaced = text.split("").join(" ");
});

kineticRows.forEach((row, rowIndex) => {
  const text = row.textContent || "";
  row.textContent = "";

  text.split("").forEach((char, index) => {
    const span = document.createElement("span");
    const direction = index % 2 === 0 ? 1 : -1;

    span.textContent = char === " " ? "\u00a0" : char;
    span.style.setProperty("--float", `${direction * (16 + ((index + rowIndex) % 5) * 7)}px`);
    span.style.setProperty("--rotate", `${direction * (2 + ((index + rowIndex) % 4) * 1.35)}deg`);
    row.append(span);
  });
});

let loaderValue = 0;
const loaderTimer = window.setInterval(() => {
  loaderValue = Math.min(100, loaderValue + Math.ceil(4 + Math.random() * 9));
  loaderTick.textContent = `${loaderValue}%`;

  if (loaderValue >= 100) {
    window.clearInterval(loaderTimer);
    window.setTimeout(() => {
      body.classList.remove("is-loading");
      body.classList.add("is-ready");
    }, 260);
  }
}, prefersReducedMotion ? 10 : 52);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { rootMargin: "0px 0px -15% 0px", threshold: 0.12 },
);

revealRows.forEach((row) => revealObserver.observe(row));

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function updateScrollEffects() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = clamp(window.scrollY / max, 0, 1);

  document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
  scrollPercent.textContent = `${Math.round(progress * 100)}%`;

  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.parallax || 0.1);
    const rect = item.getBoundingClientRect();
    const local = (window.innerHeight / 2 - rect.top - rect.height / 2) * speed;
    item.style.setProperty("--parallax-y", `${clamp(local, -90, 90).toFixed(2)}px`);
  });

  kineticRows.forEach((row) => {
    const rect = row.getBoundingClientRect();
    const active = clamp(1 - Math.abs(rect.top + rect.height * 0.5 - window.innerHeight * 0.52) / 430, 0, 1);
    row.querySelectorAll("span").forEach((span, index) => {
      const stagger = clamp(active - (index % 8) * 0.025, 0, 1);
      span.style.setProperty("--active", stagger.toFixed(3));
    });
  });
}

let rafId = 0;
function requestScrollEffects() {
  if (rafId) {
    return;
  }

  rafId = window.requestAnimationFrame(() => {
    rafId = 0;
    updateScrollEffects();
  });
}

window.addEventListener("scroll", requestScrollEffects, { passive: true });
window.addEventListener("resize", requestScrollEffects);
updateScrollEffects();

if (!prefersReducedMotion) {
  let targetScroll = window.scrollY;
  let currentScroll = window.scrollY;
  let smoothFrame = 0;

  function smoothTick() {
    currentScroll += (targetScroll - currentScroll) * 0.14;

    if (Math.abs(targetScroll - currentScroll) > 0.35) {
      window.scrollTo(0, currentScroll);
      smoothFrame = window.requestAnimationFrame(smoothTick);
      return;
    }

    window.scrollTo(0, targetScroll);
    smoothFrame = 0;
  }

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
        return;
      }

      event.preventDefault();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetScroll = clamp(targetScroll + event.deltaY, 0, max);

      if (!smoothFrame) {
        currentScroll = window.scrollY;
        smoothFrame = window.requestAnimationFrame(smoothTick);
      }
    },
    { passive: false },
  );

  window.addEventListener(
    "scroll",
    () => {
      if (!smoothFrame) {
        targetScroll = window.scrollY;
        currentScroll = window.scrollY;
      }
    },
    { passive: true },
  );
}
