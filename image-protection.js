(() => {
  const protectedSelector = [
    "img",
    "picture",
    "figure",
    ".project-image",
    ".project-hero",
    ".rolling-image-media",
    ".about-portrait",
    ".about-work-tile",
    ".home-floating-image",
    ".hero-media",
    ".work-image",
    ".gallery-image",
  ].join(",");

  const style = document.createElement("style");
  style.textContent = `
    img,
    picture,
    figure,
    .project-image,
    .project-hero,
    .rolling-image-media,
    .about-portrait,
    .about-work-tile,
    .home-floating-image,
    .hero-media,
    .work-image,
    .gallery-image {
      -webkit-touch-callout: none;
      -webkit-user-drag: none;
      user-select: none;
    }
  `;
  document.head.appendChild(style);

  function getProtectedTarget(target) {
    return target instanceof Element ? target.closest(protectedSelector) : null;
  }

  function protectImage(image) {
    image.draggable = false;
    image.setAttribute("draggable", "false");
    image.setAttribute("oncontextmenu", "return false");
  }

  function protectImages(root = document) {
    root.querySelectorAll?.("img").forEach(protectImage);
  }

  document.addEventListener(
    "contextmenu",
    (event) => {
      if (getProtectedTarget(event.target)) {
        event.preventDefault();
      }
    },
    true,
  );

  document.addEventListener(
    "dragstart",
    (event) => {
      if (getProtectedTarget(event.target)) {
        event.preventDefault();
      }
    },
    true,
  );

  document.addEventListener(
    "selectstart",
    (event) => {
      if (getProtectedTarget(event.target)) {
        event.preventDefault();
      }
    },
    true,
  );

  document.addEventListener(
    "keydown",
    (event) => {
      const isSaveShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s";

      if (isSaveShortcut) {
        event.preventDefault();
      }
    },
    true,
  );

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) {
          return;
        }

        if (node.matches("img")) {
          protectImage(node);
        }

        protectImages(node);
      });
    });
  });

  function startObserver() {
    const observeTarget = document.documentElement || document.body;

    protectImages();

    if (observeTarget) {
      observer.observe(observeTarget, { childList: true, subtree: true });
    }
  }

  if (document.documentElement || document.body) {
    startObserver();
  } else {
    document.addEventListener("DOMContentLoaded", startObserver, { once: true });
  }
})();
