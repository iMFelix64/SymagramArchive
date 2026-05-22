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

  protectImages();
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
