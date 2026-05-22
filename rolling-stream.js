const archiveData = window.TDG_ARCHIVE || { groups: [], projects: [] };

function createProjectEmbedSrc(projectId) {
  return `./projects/project-panel-mark-1/?project=${encodeURIComponent(projectId)}&embed=1`;
}

const projectCatalog = (archiveData.projects || [])
  .filter((project) => project && project.visible !== false)
  .map((project) => {
    const images = [...(project.images || [])];

    return {
      ...project,
      coverImage: project.coverImage || images[0] || "",
      images,
    };
  });
const visibleProjectIds = new Set(projectCatalog.map((project) => project.id));
const projectGroups = (archiveData.groups || [])
  .map((group) => ({
    ...group,
    projectIds: (group.projectIds || []).filter((projectId) => visibleProjectIds.has(projectId)),
  }))
  .filter((group) => group.projectIds.length > 0);

const projectById = new Map(projectCatalog.map((project) => [project.id, project]));
const projects = projectGroups.flatMap((group) => (
  group.projectIds
    .map((projectId) => projectById.get(projectId))
    .filter(Boolean)
));
const projectSegments = projectGroups;
const segmentById = new Map(projectSegments.map((segment) => [segment.id, segment]));
const segmentIdByProjectId = new Map(
  projectSegments.flatMap((segment) => segment.projectIds.map((projectId) => [projectId, segment.id])),
);

projects.forEach((project) => {
  const segmentId = segmentIdByProjectId.get(project.id) || projectSegments[0].id;
  const segment = segmentById.get(segmentId) || projectSegments[0];
  const segmentProjectIndex = Math.max(0, segment.projectIds.indexOf(project.id));

  project.segmentId = segment.id;
  project.segmentTitle = segment.title;
  project.displayNumber = String(segmentProjectIndex + 1).padStart(2, "0");
});

const isPanelEmbed = new URLSearchParams(window.location.search).get("panel") === "1";
const rollingCursorAsset = "./Assets/Icons/Arrow.svg";

document.documentElement.classList.toggle("is-panel-embed", isPanelEmbed);
document.body.classList.toggle("is-panel-embed", isPanelEmbed);

const projectsRoot = document.querySelector(".rolling-projects");
const rollingApp = document.querySelector(".rolling-app");
const focusBandElement = document.getElementById("rolling-focus-band");
const focusBandHandle = document.getElementById("rolling-focus-band-handle");
const debugToggle = document.getElementById("debug-toggle");
const labelToggle = document.getElementById("label-toggle");
const sizeControl = document.getElementById("rolling-size-control");
const parametersToggle = document.getElementById("rolling-parameters-toggle");
const sizeSlider = document.getElementById("rolling-size-slider");
const sizeValue = document.getElementById("rolling-size-value");
const detailMediaSlider = document.getElementById("rolling-detail-media-slider");
const detailMediaValue = document.getElementById("rolling-detail-media-value");
const detailCardSlider = document.getElementById("rolling-detail-card-slider");
const detailCardValue = document.getElementById("rolling-detail-card-value");
const detailCardWidthSlider = document.getElementById("rolling-detail-card-width-slider");
const detailCardWidthValue = document.getElementById("rolling-detail-card-width-value");
const followSlider = document.getElementById("rolling-follow-slider");
const followValue = document.getElementById("rolling-follow-value");
const wheelSlider = document.getElementById("rolling-wheel-slider");
const wheelValue = document.getElementById("rolling-wheel-value");
const delaySlider = document.getElementById("rolling-delay-slider");
const delayValue = document.getElementById("rolling-delay-value");
const returnScrollSlider = document.getElementById("rolling-return-scroll-slider");
const returnScrollValue = document.getElementById("rolling-return-scroll-value");
const FOCUS_BAND_STORAGE_KEY = "rolling-coverflow-center-top-ratio";
const EXPANDED_SIZE_STORAGE_KEY = "rolling-coverflow-expanded-height-v3";
const DETAIL_MEDIA_SCALE_STORAGE_KEY = "rolling-detail-media-scale-v4";
const DETAIL_CARD_HEIGHT_STORAGE_KEY = "rolling-detail-card-height-v2";
const DETAIL_CARD_WIDTH_STORAGE_KEY = "rolling-detail-card-width-v2";
const FOLLOW_STORAGE_KEY = "rolling-coverflow-follow-v6";
const WHEEL_SENSITIVITY_STORAGE_KEY = "rolling-coverflow-wheel-sensitivity-v2";
const DELAY_STORAGE_KEY = "rolling-coverflow-delay-ms-v3";
const RETURN_SCROLL_DURATION_STORAGE_KEY = "rolling-return-scroll-duration-ms-v2";
const PARAMETERS_OPEN_STORAGE_KEY = "rolling-parameters-open-v1";
const FOCUS_BAND_HEIGHT_RATIO = 0.12;
const DEFAULT_FOCUS_BAND_TOP_RATIO = 0.44;
const COVERFLOW_WHEEL_THRESHOLD = 60;
const COVERFLOW_WHEEL_DELTA_LIMIT = 220;
const COVERFLOW_IDLE_DECAY_DELAY_MS = 220;
const COVERFLOW_TUG_DECAY = 0.92;
const DEFAULT_FOLLOW = 0.045;
const MIN_FOLLOW = 0.035;
const MAX_FOLLOW = 0.12;
const DEFAULT_WHEEL_SENSITIVITY = 0.6;
const MIN_WHEEL_SENSITIVITY = 0.25;
const MAX_WHEEL_SENSITIVITY = 1;
const DEFAULT_SELECTED_DELAY_MS = 0;
const MIN_SELECTED_DELAY_MS = 0;
const MAX_SELECTED_DELAY_MS = 100;
const DEFAULT_RETURN_SCROLL_DURATION_MS = 520;
const MIN_RETURN_SCROLL_DURATION_MS = 0;
const MAX_RETURN_SCROLL_DURATION_MS = 1600;
const CARD_COLLAPSED_HEIGHT = 168;
const DEFAULT_CARD_EXPANDED_HEIGHT = 690;
const MIN_CARD_EXPANDED_HEIGHT = 480;
const MAX_CARD_EXPANDED_HEIGHT = 720;
const MIN_DETAIL_MEDIA_SCALE = 0;
const MAX_DETAIL_MEDIA_SCALE = 2;
const DEFAULT_DETAIL_MEDIA_SCALE = 1;
const DEFAULT_DETAIL_CARD_HEIGHT = 168;
const MIN_DETAIL_CARD_HEIGHT = CARD_COLLAPSED_HEIGHT;
const MAX_DETAIL_CARD_HEIGHT = 720;
const PROJECT_ROW_BOTTOM_PADDING = 0;
const CARD_COLLAPSED_WIDTH = 150;
const CARD_EXPANDED_WIDTH = 392;
const DEFAULT_DETAIL_CARD_WIDTH = 180;
const MIN_DETAIL_CARD_WIDTH = CARD_COLLAPSED_WIDTH;
const MAX_DETAIL_CARD_WIDTH = CARD_EXPANDED_WIDTH;
const EXPANDED_PROJECT_GAP = 15;
const PROJECT_COLUMN_GAP = 10;
const DETAIL_SIDE_WIDTH = 318;
const DETAIL_SIDE_GAP = 10;
const DETAIL_FRAME_VIEWPORT_OFFSET = 82;
const DETAIL_MEDIA_BOTTOM_GAP = 15;
const INDEX_SLIDE_FOLLOW = 0.09;
const SEGMENT_STICKY_TOP = 0;
const SEGMENT_DIVIDER_TOP_GAP = 15;
const SEGMENT_DIVIDER_BOTTOM_GAP = 15;
const SEGMENT_BOUNDARY_GAP = Math.max(
  0,
  SEGMENT_DIVIDER_TOP_GAP + SEGMENT_DIVIDER_BOTTOM_GAP + PROJECT_ROW_BOTTOM_PADDING - EXPANDED_PROJECT_GAP,
);
let focusBandTopRatio = DEFAULT_FOCUS_BAND_TOP_RATIO;
let focusBandDragOffset = 0;
let cardExpandedHeight = DEFAULT_CARD_EXPANDED_HEIGHT;
let detailMediaScale = DEFAULT_DETAIL_MEDIA_SCALE;
let detailCardHeight = DEFAULT_DETAIL_CARD_HEIGHT;
let detailCardWidth = DEFAULT_DETAIL_CARD_WIDTH;
let motionFollow = DEFAULT_FOLLOW;
let wheelSensitivity = DEFAULT_WHEEL_SENSITIVITY;
let selectedTransitionDelayMs = DEFAULT_SELECTED_DELAY_MS;
let returnScrollDurationMs = DEFAULT_RETURN_SCROLL_DURATION_MS;
let returnScrollProjectIndex = -1;
let parametersOpen = true;
let lastNotifiedActiveProjectId = "";
let rollingFrameCursor = null;
let rollingFrameCursorX = window.innerWidth / 2;
let rollingFrameCursorY = window.innerHeight / 2;
let rollingFrameCursorProject = null;
let rollingScrollCursor = null;
let rollingScrollCursorX = window.innerWidth / 2;
let rollingScrollCursorY = window.innerHeight / 2;
let rollingScrollCursorLayer = null;

function buildProjects() {
  const segmentRailMarkup = `
    <aside class="rolling-segment-rail" aria-label="project segments" data-debug-label="aside.rolling-segment-rail">
      ${projectSegments
        .map(
          (segment) => `
            <section class="rolling-segment-group" data-segment-group="${segment.id}" data-debug-label="section.rolling-segment-group[${segment.id}]">
              <p class="rolling-segment-label" data-segment="${segment.id}" data-debug-label="p.rolling-segment-label[${segment.id}]">
                ${segment.title}
              </p>
            </section>
          `,
        )
        .join("")}
    </aside>
  `;

  const segmentDividerMarkup = projectSegments
    .slice(1)
    .map(
      (segment) => `
        <div class="rolling-segment-divider" data-segment-divider="${segment.id}" data-debug-label="div.rolling-segment-divider[${segment.id}]" aria-hidden="true"></div>
      `,
    )
    .join("");

  const projectsMarkup = projects
    .map((project) => {
      const leadImage = project.images[0] || project.coverImage || "";
      const embedSrc = createProjectEmbedSrc(project.id);
      const mediaMarkup = project.placeholder
        ? `
          <figure class="rolling-image-media rolling-image-media--placeholder" role="button" tabindex="0" aria-label="打开 ${project.title}" data-debug-label="figure.rolling-image-media[${project.id}]">
            <div class="rolling-image-placeholder-copy">PLACEHOLDER ${project.displayNumber}</div>
          </figure>
        `
        : leadImage
          ? `
          <figure class="rolling-image-media rolling-image-media--embed" role="button" tabindex="0" aria-label="打开 ${project.title}" data-debug-label="figure.rolling-image-media[${project.id}]">
            <iframe
              class="rolling-image-embed-frame"
              src="${embedSrc}"
              title="${project.title} 项目页面"
              loading="eager"
            ></iframe>
            <div class="rolling-image-wheel-layer" aria-hidden="true"></div>
          </figure>
        `
          : `
          <figure class="rolling-image-media rolling-image-media--placeholder" role="button" tabindex="0" aria-label="打开 ${project.title}" data-debug-label="figure.rolling-image-media[${project.id}]">
            <div class="rolling-image-placeholder-copy">PLACEHOLDER ${project.displayNumber}</div>
          </figure>
        `;

      return `
        <article class="rolling-project" data-project="${project.id}" data-segment="${project.segmentId}" data-debug-label="article.rolling-project[${project.id}]">
          <aside class="rolling-project-card" aria-label="${project.title} 项目信息" data-debug-label="aside.rolling-project-card[${project.id}]">
            <p class="rolling-project-index">${project.displayNumber}.</p>
            <div class="rolling-project-copy">
              <h2 class="rolling-project-name">${project.title}</h2>
              <p class="rolling-project-description">${project.description}</p>
            </div>
            <div class="rolling-project-arrow" aria-hidden="true">→</div>
          </aside>

          <div class="rolling-project-stream" data-debug-label="div.rolling-project-stream[${project.id}]">
            <article class="rolling-image-card" data-image-card data-debug-label="article.rolling-image-card[${project.id}]">
              ${mediaMarkup}
            </article>
          </div>

          <aside class="rolling-detail-copy" aria-hidden="true" data-debug-label="aside.rolling-detail-copy[${project.id}]">
            <p class="rolling-detail-kicker">PROJECT ${project.displayNumber}</p>
            <h3 class="rolling-detail-title">${project.title}</h3>
            <p class="rolling-detail-description">${project.description}</p>
            <span class="rolling-detail-rule" aria-hidden="true"></span>
            <p class="rolling-detail-year">${project.year}</p>
            <span class="rolling-detail-rule" aria-hidden="true"></span>
            <div class="rolling-detail-spec">
              <p class="rolling-detail-label">方向</p>
              <p class="rolling-detail-value">${project.tagline}</p>
            </div>
          </aside>
        </article>
      `;
    })
    .join("");

  projectsRoot.innerHTML = segmentRailMarkup + segmentDividerMarkup + projectsMarkup;
}

buildProjects();

const projectsList = Array.from(document.querySelectorAll(".rolling-project"));
const segmentGroups = Array.from(document.querySelectorAll(".rolling-segment-group"));
const segmentLabels = Array.from(document.querySelectorAll(".rolling-segment-label"));
const segmentDividers = Array.from(document.querySelectorAll(".rolling-segment-divider"));
const segmentRanges = projectSegments
  .map((segment) => {
    const indexes = segment.projectIds
      .map((projectId) => projectsList.findIndex((project) => project.dataset.project === projectId))
      .filter((index) => index >= 0);

    if (!indexes.length) {
      return null;
    }

    return {
      ...segment,
      start: Math.min(...indexes),
      end: Math.max(...indexes),
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.start - b.start);
const projectStates = new Map(
  projectsList.map((project) => [
    project,
    {
      progress: 0,
      scale: 1,
      lift: 0,
      glow: 0.08,
      coverY: 0,
      coverScale: 0.88,
      opacity: 0,
      indexSlide: 0,
      detailProgress: 0,
    },
  ]),
);
let activeProjectIndex = 0;
let settledProjectIndex = 0;
let activeProjectSelectedAt = Number.NEGATIVE_INFINITY;
let expandedProjectIndex = -1;
let coverflowWheelProgress = 0;
let lastCoverflowWheelTime = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function syncDebugToggle() {
  if (!debugToggle) {
    return;
  }

  debugToggle.setAttribute(
    "aria-pressed",
    String(document.body.classList.contains("debug-outlines")),
  );
}

function syncLabelToggle() {
  if (!labelToggle) {
    return;
  }

  labelToggle.setAttribute(
    "aria-pressed",
    String(document.body.classList.contains("debug-labels")),
  );
}

function buildDebugLabel(element) {
  const tagName = element.tagName.toLowerCase();
  const idPart = element.id ? `#${element.id}` : "";
  const classList = Array.from(element.classList).filter((className) => !className.startsWith("is-"));
  const classPart = classList.length ? `.${classList[0]}` : "";
  const projectPart = element.dataset.project ? `[${element.dataset.project}]` : "";

  return `${tagName}${idPart}${classPart}${projectPart}`;
}

const DEBUG_LABEL_LAYER_ID = "debug-label-layer";
let debugLabelFrame = 0;

function getDebugLabelTargets() {
  return Array.from(document.querySelectorAll(
    "[data-debug-label], main, section, header, article, aside, div, figure, button",
  )).filter((element) => !element.closest(".debug-label-layer"));
}

function ensureDebugLabelLayer() {
  let layer = document.getElementById(DEBUG_LABEL_LAYER_ID);

  if (!layer) {
    layer = document.createElement("div");
    layer.id = DEBUG_LABEL_LAYER_ID;
    layer.className = "debug-label-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
  }

  return layer;
}

function clearDebugLabelOverlay() {
  const layer = document.getElementById(DEBUG_LABEL_LAYER_ID);

  if (debugLabelFrame) {
    window.cancelAnimationFrame(debugLabelFrame);
    debugLabelFrame = 0;
  }

  layer?.replaceChildren();
}

function isDebugLabelTargetVisible(element) {
  let current = element;

  while (current && current !== document.documentElement) {
    const style = window.getComputedStyle(current);
    const opacity = Number.parseFloat(style.opacity);

    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      (Number.isFinite(opacity) && opacity <= 0.03)
    ) {
      return false;
    }

    current = current.parentElement;
  }

  return true;
}

function renderDebugLabelOverlay() {
  debugLabelFrame = 0;

  if (!document.body.classList.contains("debug-labels")) {
    clearDebugLabelOverlay();
    return;
  }

  const layer = ensureDebugLabelLayer();
  const fragment = document.createDocumentFragment();
  const targets = getDebugLabelTargets();

  targets.forEach((element) => {
    if (!element.dataset.debugLabel) {
      return;
    }

    if (!isDebugLabelTargetVisible(element)) {
      return;
    }

    const rect = element.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0 ||
      rect.bottom < 0 ||
      rect.right < 0 ||
      rect.top > window.innerHeight ||
      rect.left > window.innerWidth
    ) {
      return;
    }

    const badge = document.createElement("span");
    badge.className = "debug-name-badge";
    badge.textContent = element.dataset.debugLabel;
    badge.style.transform = `translate3d(${Math.max(0, rect.left).toFixed(1)}px, ${Math.max(0, rect.top).toFixed(1)}px, 0)`;
    fragment.appendChild(badge);
  });

  layer.replaceChildren(fragment);
  debugLabelFrame = window.requestAnimationFrame(renderDebugLabelOverlay);
}

function syncDebugLabelOverlay() {
  if (document.body.classList.contains("debug-labels")) {
    if (!debugLabelFrame) {
      debugLabelFrame = window.requestAnimationFrame(renderDebugLabelOverlay);
    }
    return;
  }

  clearDebugLabelOverlay();
}

function applyDebugLabels() {
  const labelTargets = getDebugLabelTargets();

  labelTargets.forEach((element) => {
    if (!element.dataset.debugLabel) {
      if (!element.className && !element.id && !element.dataset.project) {
        return;
      }

      element.setAttribute("data-debug-label", buildDebugLabel(element));
    }
  });

  syncDebugLabelOverlay();
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function steepenProgress(progress) {
  const p = clamp(progress, 0, 1);

  return p * p * (3 - 2 * p);
}

function easeInOutCubic(progress) {
  const p = clamp(progress, 0, 1);

  return p < 0.5
    ? 4 * p * p * p
    : 1 - ((-2 * p + 2) ** 3) / 2;
}

function easeOutCubic(progress) {
  const p = clamp(progress, 0, 1);

  return 1 - (1 - p) ** 3;
}

function loadCardExpandedHeight() {
  const storedValue = Number.parseFloat(window.localStorage.getItem(EXPANDED_SIZE_STORAGE_KEY) || "");

  if (Number.isFinite(storedValue)) {
    cardExpandedHeight = clamp(storedValue, MIN_CARD_EXPANDED_HEIGHT, MAX_CARD_EXPANDED_HEIGHT);
  }
}

function syncSizeControl() {
  if (sizeSlider) {
    sizeSlider.value = String(Math.round(cardExpandedHeight));
  }

  if (sizeValue) {
    sizeValue.value = String(Math.round(cardExpandedHeight));
    sizeValue.textContent = String(Math.round(cardExpandedHeight));
  }

  if (sizeControl) {
    sizeControl.style.setProperty("--expanded-size", `${cardExpandedHeight}px`);
  }
}

function setCardExpandedHeight(nextHeight) {
  cardExpandedHeight = clamp(nextHeight, MIN_CARD_EXPANDED_HEIGHT, MAX_CARD_EXPANDED_HEIGHT);
  window.localStorage.setItem(EXPANDED_SIZE_STORAGE_KEY, String(cardExpandedHeight));
  syncSizeControl();
}

function loadDetailMediaScale() {
  const storedValue = Number.parseFloat(window.localStorage.getItem(DETAIL_MEDIA_SCALE_STORAGE_KEY) || "");

  if (Number.isFinite(storedValue)) {
    detailMediaScale = clamp(storedValue, MIN_DETAIL_MEDIA_SCALE, MAX_DETAIL_MEDIA_SCALE);
  }
}

function syncDetailMediaControl() {
  const sliderValue = Math.round(detailMediaScale * 100);

  if (detailMediaSlider) {
    detailMediaSlider.value = String(sliderValue);
  }

  if (detailMediaValue) {
    detailMediaValue.value = String(sliderValue);
    detailMediaValue.textContent = String(sliderValue);
  }
}

function setDetailMediaScale(nextScale) {
  detailMediaScale = clamp(nextScale, MIN_DETAIL_MEDIA_SCALE, MAX_DETAIL_MEDIA_SCALE);
  window.localStorage.setItem(DETAIL_MEDIA_SCALE_STORAGE_KEY, String(detailMediaScale));
  syncDetailMediaControl();
}

function loadDetailCardHeight() {
  const storedValue = Number.parseFloat(window.localStorage.getItem(DETAIL_CARD_HEIGHT_STORAGE_KEY) || "");

  if (Number.isFinite(storedValue)) {
    detailCardHeight = clamp(storedValue, MIN_DETAIL_CARD_HEIGHT, MAX_DETAIL_CARD_HEIGHT);
  }
}

function syncDetailCardControl() {
  if (detailCardSlider) {
    detailCardSlider.value = String(Math.round(detailCardHeight));
  }

  if (detailCardValue) {
    detailCardValue.value = String(Math.round(detailCardHeight));
    detailCardValue.textContent = String(Math.round(detailCardHeight));
  }
}

function setDetailCardHeight(nextHeight) {
  detailCardHeight = clamp(nextHeight, MIN_DETAIL_CARD_HEIGHT, MAX_DETAIL_CARD_HEIGHT);
  window.localStorage.setItem(DETAIL_CARD_HEIGHT_STORAGE_KEY, String(detailCardHeight));
  syncDetailCardControl();
}

function loadDetailCardWidth() {
  const storedValue = Number.parseFloat(window.localStorage.getItem(DETAIL_CARD_WIDTH_STORAGE_KEY) || "");

  if (Number.isFinite(storedValue)) {
    detailCardWidth = clamp(storedValue, MIN_DETAIL_CARD_WIDTH, MAX_DETAIL_CARD_WIDTH);
  }
}

function syncDetailCardWidthControl() {
  const roundedWidth = Math.round(detailCardWidth);

  if (detailCardWidthSlider) {
    detailCardWidthSlider.value = String(roundedWidth);
  }

  if (detailCardWidthValue) {
    detailCardWidthValue.value = String(roundedWidth);
    detailCardWidthValue.textContent = String(roundedWidth);
  }
}

function setDetailCardWidth(nextWidth) {
  detailCardWidth = clamp(nextWidth, MIN_DETAIL_CARD_WIDTH, MAX_DETAIL_CARD_WIDTH);
  window.localStorage.setItem(DETAIL_CARD_WIDTH_STORAGE_KEY, String(detailCardWidth));
  syncDetailCardWidthControl();
}

function loadMotionFollow() {
  const storedValue = Number.parseFloat(window.localStorage.getItem(FOLLOW_STORAGE_KEY) || "");

  if (Number.isFinite(storedValue)) {
    motionFollow = clamp(storedValue, MIN_FOLLOW, MAX_FOLLOW);
  }
}

function formatFollow(value) {
  return value.toFixed(3);
}

function syncFollowControl() {
  if (followSlider) {
    followSlider.value = formatFollow(motionFollow);
  }

  if (followValue) {
    const formattedValue = formatFollow(motionFollow);

    followValue.value = formattedValue;
    followValue.textContent = formattedValue;
  }
}

function setMotionFollow(nextFollow) {
  motionFollow = clamp(nextFollow, MIN_FOLLOW, MAX_FOLLOW);
  window.localStorage.setItem(FOLLOW_STORAGE_KEY, String(motionFollow));
  syncFollowControl();
}

function loadWheelSensitivity() {
  const storedValue = Number.parseFloat(window.localStorage.getItem(WHEEL_SENSITIVITY_STORAGE_KEY) || "");

  if (Number.isFinite(storedValue)) {
    wheelSensitivity = clamp(storedValue, MIN_WHEEL_SENSITIVITY, MAX_WHEEL_SENSITIVITY);
  }
}

function formatWheelSensitivity(value) {
  return value.toFixed(3);
}

function syncWheelControl() {
  if (wheelSlider) {
    wheelSlider.value = formatWheelSensitivity(wheelSensitivity);
  }

  if (wheelValue) {
    const formattedValue = formatWheelSensitivity(wheelSensitivity);

    wheelValue.value = formattedValue;
    wheelValue.textContent = formattedValue;
  }
}

function setWheelSensitivity(nextSensitivity) {
  wheelSensitivity = clamp(nextSensitivity, MIN_WHEEL_SENSITIVITY, MAX_WHEEL_SENSITIVITY);
  window.localStorage.setItem(WHEEL_SENSITIVITY_STORAGE_KEY, String(wheelSensitivity));
  syncWheelControl();
}

function loadSelectedTransitionDelay() {
  const storedValue = Number.parseFloat(window.localStorage.getItem(DELAY_STORAGE_KEY) || "");

  if (Number.isFinite(storedValue)) {
    selectedTransitionDelayMs = clamp(storedValue, MIN_SELECTED_DELAY_MS, MAX_SELECTED_DELAY_MS);
  }
}

function syncDelayControl() {
  const roundedDelay = Math.round(selectedTransitionDelayMs);

  if (delaySlider) {
    delaySlider.value = String(roundedDelay);
  }

  if (delayValue) {
    delayValue.value = String(roundedDelay);
    delayValue.textContent = String(roundedDelay);
  }
}

function setSelectedTransitionDelay(nextDelay) {
  selectedTransitionDelayMs = clamp(nextDelay, MIN_SELECTED_DELAY_MS, MAX_SELECTED_DELAY_MS);
  window.localStorage.setItem(DELAY_STORAGE_KEY, String(selectedTransitionDelayMs));
  syncDelayControl();
}

function loadReturnScrollDuration() {
  const storedValue = Number.parseFloat(window.localStorage.getItem(RETURN_SCROLL_DURATION_STORAGE_KEY) || "");

  if (Number.isFinite(storedValue)) {
    returnScrollDurationMs = clamp(
      storedValue,
      MIN_RETURN_SCROLL_DURATION_MS,
      MAX_RETURN_SCROLL_DURATION_MS,
    );
  }
}

function syncReturnScrollControl() {
  const roundedDuration = Math.round(returnScrollDurationMs);

  if (returnScrollSlider) {
    returnScrollSlider.value = String(roundedDuration);
  }

  if (returnScrollValue) {
    returnScrollValue.value = String(roundedDuration);
    returnScrollValue.textContent = String(roundedDuration);
  }
}

function setReturnScrollDuration(nextDuration) {
  returnScrollDurationMs = clamp(
    nextDuration,
    MIN_RETURN_SCROLL_DURATION_MS,
    MAX_RETURN_SCROLL_DURATION_MS,
  );
  window.localStorage.setItem(RETURN_SCROLL_DURATION_STORAGE_KEY, String(returnScrollDurationMs));
  syncReturnScrollControl();
}

function loadParametersOpen() {
  const storedValue = window.localStorage.getItem(PARAMETERS_OPEN_STORAGE_KEY);

  if (storedValue === "true" || storedValue === "false") {
    parametersOpen = storedValue === "true";
  }
}

function syncParametersToggle() {
  sizeControl?.classList.toggle("is-collapsed", !parametersOpen);
  parametersToggle?.setAttribute("aria-expanded", parametersOpen ? "true" : "false");
  parametersToggle?.setAttribute("aria-pressed", parametersOpen ? "true" : "false");
}

function setParametersOpen(nextOpen) {
  parametersOpen = Boolean(nextOpen);
  window.localStorage.setItem(PARAMETERS_OPEN_STORAGE_KEY, String(parametersOpen));
  syncParametersToggle();
}

function getParametersOpen() {
  return parametersOpen;
}

function buildRollingFrameCursor() {
  if (rollingFrameCursor) {
    return;
  }

  rollingFrameCursor = document.createElement("div");
  const cursorInner = document.createElement("div");
  const cursorArrowShell = document.createElement("div");
  const cursorArrow = document.createElement("img");

  rollingFrameCursor.className = "rolling-frame-cursor";
  rollingFrameCursor.setAttribute("aria-hidden", "true");
  cursorInner.className = "rolling-frame-cursor-inner";
  cursorArrowShell.className = "rolling-frame-cursor-arrow-shell";
  cursorArrow.className = "rolling-frame-cursor-arrow";
  cursorArrow.src = rollingCursorAsset;
  cursorArrow.alt = "";
  cursorArrow.decoding = "async";

  cursorArrowShell.append(cursorArrow);
  cursorInner.append(cursorArrowShell);
  rollingFrameCursor.append(cursorInner);
  document.body.append(rollingFrameCursor);
}

function syncRollingFrameCursorPosition() {
  if (!rollingFrameCursor) {
    return;
  }

  rollingFrameCursor.style.setProperty("--cursor-x", `${rollingFrameCursorX}px`);
  rollingFrameCursor.style.setProperty("--cursor-y", `${rollingFrameCursorY}px`);
}

function syncRollingFrameCursorProject(project) {
  if (rollingFrameCursorProject === project) {
    return;
  }

  rollingFrameCursorProject?.classList.remove("is-frame-cursor-hover");
  rollingFrameCursorProject = project;
  rollingFrameCursorProject?.classList.add("is-frame-cursor-hover");
}

function shouldShowRollingFrameCursor(target) {
  return (
    expandedProjectIndex < 0 &&
    target instanceof Element &&
    Boolean(target.closest(".rolling-image-media"))
  );
}

function showRollingFrameCursor(event) {
  if (!shouldShowRollingFrameCursor(event.target)) {
    hideRollingFrameCursor();
    return;
  }

  buildRollingFrameCursor();
  syncRollingFrameCursorProject(event.target.closest(".rolling-project"));

  rollingFrameCursorX = event.clientX;
  rollingFrameCursorY = event.clientY;
  syncRollingFrameCursorPosition();

  document.body.classList.add("is-rolling-frame-cursor-active");
  rollingFrameCursor.classList.remove("is-bouncing");
  void rollingFrameCursor.offsetWidth;
  rollingFrameCursor.classList.add("is-bouncing");
}

function moveRollingFrameCursor(event) {
  if (!shouldShowRollingFrameCursor(event.target)) {
    hideRollingFrameCursor();
    return;
  }

  syncRollingFrameCursorProject(event.target.closest(".rolling-project"));
  rollingFrameCursorX = event.clientX;
  rollingFrameCursorY = event.clientY;
  syncRollingFrameCursorPosition();
}

function hideRollingFrameCursor() {
  document.body.classList.remove("is-rolling-frame-cursor-active");
  rollingFrameCursor?.classList.remove("is-bouncing");
  syncRollingFrameCursorProject(null);
}

function buildRollingScrollCursor() {
  if (rollingScrollCursor) {
    return;
  }

  rollingScrollCursor = document.createElement("div");
  const cursorInner = document.createElement("div");
  const cursorArrowShell = document.createElement("div");
  const cursorArrow = document.createElement("img");

  rollingScrollCursor.className = "rolling-scroll-cursor";
  rollingScrollCursor.setAttribute("aria-hidden", "true");
  cursorInner.className = "rolling-scroll-cursor-inner";
  cursorArrowShell.className = "rolling-scroll-cursor-arrow-shell";
  cursorArrow.className = "rolling-scroll-cursor-arrow";
  cursorArrow.src = rollingCursorAsset;
  cursorArrow.alt = "";
  cursorArrow.decoding = "async";

  cursorArrowShell.append(cursorArrow);
  cursorInner.append(cursorArrowShell);
  rollingScrollCursor.append(cursorInner);
  document.body.append(rollingScrollCursor);
}

function syncRollingScrollCursorPosition() {
  if (!rollingScrollCursor) {
    return;
  }

  rollingScrollCursor.style.setProperty("--cursor-x", `${rollingScrollCursorX}px`);
  rollingScrollCursor.style.setProperty("--cursor-y", `${rollingScrollCursorY}px`);
}

function getRollingEmbedScrollState(wheelLayer) {
  const project = wheelLayer?.closest(".rolling-project");
  const embedFrame = project?.querySelector(".rolling-image-embed-frame");

  try {
    const viewportState = embedFrame?.contentWindow?.projectViewport?.getScrollState?.();

    if (viewportState) {
      return viewportState;
    }

    const projectPage = embedFrame?.contentDocument?.querySelector(".project-page");

    if (!projectPage) {
      return {
        isAtBottom: true,
        isReady: false,
      };
    }

    const maxScrollTop = Math.max(0, projectPage.scrollHeight - projectPage.clientHeight);

    return {
      isAtBottom: projectPage.scrollTop >= maxScrollTop - 2,
      isReady: true,
      maxScrollTop,
      scrollTop: projectPage.scrollTop,
    };
  } catch (error) {
    return {
      isAtBottom: true,
      isReady: false,
    };
  }
}

function refreshRollingScrollCursor(wheelLayer = rollingScrollCursorLayer) {
  if (
    !wheelLayer?.closest(".rolling-project.is-detail-expanded") ||
    getRollingEmbedScrollState(wheelLayer).isAtBottom
  ) {
    hideRollingScrollCursor();
    return;
  }

  buildRollingScrollCursor();
  rollingScrollCursorLayer = wheelLayer;
  syncRollingScrollCursorPosition();
  document.body.classList.add("is-rolling-scroll-cursor-active");
}

function showRollingScrollCursor(event) {
  rollingScrollCursorX = event.clientX;
  rollingScrollCursorY = event.clientY;
  syncRollingScrollCursorPosition();
  refreshRollingScrollCursor(event.target.closest(".rolling-image-wheel-layer"));
}

function moveRollingScrollCursor(event) {
  rollingScrollCursorX = event.clientX;
  rollingScrollCursorY = event.clientY;
  syncRollingScrollCursorPosition();
  refreshRollingScrollCursor(event.target.closest(".rolling-image-wheel-layer"));
}

function hideRollingScrollCursor() {
  document.body.classList.remove("is-rolling-scroll-cursor-active");
  rollingScrollCursorLayer = null;
}

function postScrollToRollingEmbeddedProject(project, deltaY) {
  const embedFrame = project?.querySelector(".rolling-image-embed-frame");

  if (!embedFrame?.contentWindow) {
    return false;
  }

  try {
    embedFrame.contentWindow.postMessage(
      {
        type: "project-scroll-by",
        deltaY,
      },
      "*",
    );
    return true;
  } catch (error) {
    return false;
  }
}

function loadFocusBandTopRatio() {
  if (isPanelEmbed) {
    focusBandTopRatio = 0.5 - FOCUS_BAND_HEIGHT_RATIO * 0.5;
    return;
  }

  const storedValue = Number.parseFloat(window.localStorage.getItem(FOCUS_BAND_STORAGE_KEY) || "");

  if (Number.isFinite(storedValue)) {
    focusBandTopRatio = clamp(storedValue, 0, 1 - FOCUS_BAND_HEIGHT_RATIO);
  }
}

function syncFocusBandVisual() {
  if (!focusBandElement) {
    return;
  }

  focusBandElement.style.top = `${(focusBandTopRatio * 100).toFixed(2)}vh`;
  focusBandElement.style.height = `${(FOCUS_BAND_HEIGHT_RATIO * 100).toFixed(2)}vh`;

  if (focusBandHandle) {
    const topPercent = Math.round(focusBandTopRatio * 100);
    const bottomPercent = Math.round((focusBandTopRatio + FOCUS_BAND_HEIGHT_RATIO) * 100);
    focusBandHandle.textContent = `FOCUS BAND ${topPercent}-${bottomPercent}`;
  }
}

function setFocusBandTopRatio(nextRatio) {
  focusBandTopRatio = clamp(nextRatio, 0, 1 - FOCUS_BAND_HEIGHT_RATIO);
  window.localStorage.setItem(FOCUS_BAND_STORAGE_KEY, String(focusBandTopRatio));
  syncFocusBandVisual();
}

function getFocusBand() {
  const top = window.innerHeight * focusBandTopRatio;
  const bottom = window.innerHeight * (focusBandTopRatio + FOCUS_BAND_HEIGHT_RATIO);

  return {
    top,
    bottom,
    center: (top + bottom) * 0.5,
  };
}

function syncCoverflowCenter() {
  const centerY = getCoverflowCenterY();

  projectsRoot.style.setProperty("--cover-center-y", `${centerY.toFixed(2)}px`);
}

function getCoverflowCenterY() {
  const focusBand = getFocusBand();
  const rootRect = projectsRoot.getBoundingClientRect();

  return focusBand.center - rootRect.top;
}

function getSegmentColumnWidth() {
  const value = Number.parseFloat(
    window.getComputedStyle(projectsRoot).getPropertyValue("--rolling-segment-column"),
  );

  return Number.isFinite(value) ? value : 0;
}

function getActiveSegmentRange(position = activeProjectIndex) {
  return segmentRanges.find((range, index) => {
    const nextRange = segmentRanges[index + 1];
    const endBoundary = nextRange ? nextRange.start : range.end + 1;

    return position >= range.start && position < endBoundary;
  }) || segmentRanges[0];
}

function getSegmentLastProjectBottom(range) {
  const lastProject = projectsList[range?.end];
  const lastProjectCard = lastProject?.querySelector(".rolling-project-card");

  if (!lastProjectCard) {
    return Number.NEGATIVE_INFINITY;
  }

  const rootRect = projectsRoot.getBoundingClientRect();
  const projectRect = lastProjectCard.getBoundingClientRect();

  return projectRect.bottom - rootRect.top;
}

function getSegmentFirstProjectTop(range) {
  const firstProject = projectsList[range?.start];

  if (!firstProject) {
    return Number.POSITIVE_INFINITY;
  }

  const rootRect = projectsRoot.getBoundingClientRect();
  const projectRect = firstProject.getBoundingClientRect();

  return projectRect.top - rootRect.top;
}

function getSegmentDividerY(range) {
  const rangeIndex = segmentRanges.indexOf(range);

  if (rangeIndex <= 0) {
    return Number.NEGATIVE_INFINITY;
  }

  const firstTop = getSegmentFirstProjectTop(range);

  return Number.isFinite(firstTop)
    ? firstTop - SEGMENT_DIVIDER_BOTTOM_GAP
    : Number.POSITIVE_INFINITY;
}

function getSegmentGroupTop(range) {
  const firstTop = getSegmentFirstProjectTop(range);

  return Number.isFinite(firstTop)
    ? firstTop
    : Number.POSITIVE_INFINITY;
}

function getSegmentGroupBottom(range) {
  return getSegmentLastProjectBottom(range);
}

function getSegmentLabelHeight(label) {
  const rect = label.getBoundingClientRect();

  return rect.height || 54;
}

function syncSegmentDividers() {
  if (!segmentDividers.length) {
    return;
  }

  segmentDividers.forEach((divider) => {
    const dividerRange = segmentRanges.find((range) => range.id === divider.dataset.segmentDivider);
    const y = getSegmentDividerY(dividerRange);
    const isReady = Number.isFinite(y);

    if (isReady) {
      divider.style.setProperty("--divider-y", `${y.toFixed(2)}px`);
    }

    divider.style.setProperty("--divider-opacity", isReady ? "1" : "0");
  });
}

function syncSegmentRail() {
  if (!segmentGroups.length || !segmentRanges.length) {
    return;
  }

  segmentGroups.forEach((group) => {
    const groupRange = segmentRanges.find((range) => range.id === group.dataset.segmentGroup);
    const label = group.querySelector(".rolling-segment-label");

    if (!groupRange || !label) {
      return;
    }

    const groupTop = getSegmentGroupTop(groupRange);
    const groupBottom = getSegmentGroupBottom(groupRange);

    if (!Number.isFinite(groupTop) || !Number.isFinite(groupBottom)) {
      group.style.setProperty("--segment-group-y", "0px");
      group.style.setProperty("--segment-group-height", "0px");
      group.style.setProperty("--segment-group-opacity", "0");
      label.style.setProperty("--segment-label-y", "0px");
      label.classList.remove("is-active");
      return;
    }

    const groupHeight = Math.max(0, groupBottom - groupTop);
    const labelHeight = getSegmentLabelHeight(label);
    const labelBottomLimit = groupHeight - labelHeight;
    const labelY = groupTop > SEGMENT_STICKY_TOP
      ? 0
      : Math.min(SEGMENT_STICKY_TOP - groupTop, labelBottomLimit);
    const isVisible = groupBottom > SEGMENT_STICKY_TOP && groupTop < window.innerHeight;
    const isStuck = isVisible && groupTop <= SEGMENT_STICKY_TOP && groupBottom > labelHeight;
    group.style.setProperty("--segment-group-y", `${groupTop.toFixed(2)}px`);
    group.style.setProperty("--segment-group-height", `${groupHeight.toFixed(2)}px`);
    group.style.setProperty("--segment-group-opacity", isVisible ? "1" : "0");
    label.style.setProperty("--segment-label-y", `${labelY.toFixed(2)}px`);
    label.classList.toggle("is-active", isStuck);
  });

  syncSegmentDividers();
}

function getCoverflowSpacing() {
  return CARD_COLLAPSED_HEIGHT + EXPANDED_PROJECT_GAP;
}

function getSegmentBoundaryCount(fromIndex, toIndex) {
  const minIndex = Math.min(fromIndex, toIndex);
  const maxIndex = Math.max(fromIndex, toIndex);

  return segmentRanges.filter((range) => range.start > minIndex && range.start <= maxIndex).length;
}

function getCoverflowY(offset, boundaryCount = 0) {
  const direction = Math.sign(offset);
  const distance = Math.abs(offset);
  const compactGap = getCoverflowSpacing();
  const expandedDownGap = cardExpandedHeight + EXPANDED_PROJECT_GAP;

  if (distance === 0) {
    return 0;
  }

  if (direction > 0) {
    return (
      expandedDownGap +
      Math.max(0, distance - 1) * compactGap +
      boundaryCount * SEGMENT_BOUNDARY_GAP
    );
  }

  return -(
    distance * compactGap +
    boundaryCount * SEGMENT_BOUNDARY_GAP
  );
}

function getProjectExpandedTop() {
  return -CARD_COLLAPSED_HEIGHT * 0.5;
}

function getProjectExpandedActiveTop(activeIndex) {
  if (isPanelEmbed) {
    return -getCoverflowCenterY();
  }

  if (!isPanelEmbed) {
    return getProjectExpandedTop();
  }

  return Math.max(
    -cardExpandedHeight * 0.5,
    -getCoverflowCenterY(),
  );
}

function getProjectCurrentSurfaceHeight(index, target) {
  const project = projectsList[index];
  const state = project ? projectStates.get(project) : null;
  const progress = state ? clamp(state.progress, 0, 1) : clamp(target?.progress ?? 0, 0, 1);
  const expandedHeight = getResolvedExpandedHeight(Boolean(target?.isDetailExpanded));

  return lerp(CARD_COLLAPSED_HEIGHT, expandedHeight, progress);
}

function getAvailableStreamWidth(isDetailExpanded = false) {
  const rootWidth = projectsRoot.getBoundingClientRect().width || window.innerWidth;
  const segmentWidth = isDetailExpanded ? 0 : getSegmentColumnWidth();
  const cardWidth = isDetailExpanded ? detailCardWidth : CARD_EXPANDED_WIDTH;
  const detailWidth = isDetailExpanded ? DETAIL_SIDE_WIDTH + DETAIL_SIDE_GAP : 0;
  const reservedWidth = segmentWidth + cardWidth + PROJECT_COLUMN_GAP + detailWidth;

  return Math.max(CARD_COLLAPSED_HEIGHT * 1.5, rootWidth - reservedWidth);
}

function getResolvedExpandedHeight(isDetailExpanded = false) {
  if (isDetailExpanded) {
    return Math.max(CARD_COLLAPSED_HEIGHT, getDetailFrameHeight() * detailMediaScale);
  }

  const maxHeight = getAvailableStreamWidth(false) / 1.5;

  return Math.max(CARD_COLLAPSED_HEIGHT, Math.min(cardExpandedHeight, maxHeight));
}

function getProjectGapAfter(index) {
  const hasSegmentBoundary = segmentRanges.some((range) => range.start === index + 1);

  return EXPANDED_PROJECT_GAP + (hasSegmentBoundary ? SEGMENT_BOUNDARY_GAP : 0);
}

function getProjectAnchorLayoutTop() {
  return activeProjectIndex === settledProjectIndex
    ? getProjectExpandedActiveTop(activeProjectIndex)
    : getProjectExpandedTop();
}

function getProjectCoverYForTop(top) {
  return top + CARD_COLLAPSED_HEIGHT * 0.5;
}

function buildLiveLayoutCoverYs(targets) {
  const coverYs = new Array(projectsList.length).fill(0);

  if (!projectsList.length) {
    return coverYs;
  }

  if (expandedProjectIndex >= 0) {
    const detailState = projectStates.get(projectsList[expandedProjectIndex]);
    const desiredDetailCoverY = getProjectCoverYForTop(-getCoverflowCenterY());
    const currentCoverY = detailState ? detailState.coverY : desiredDetailCoverY;

    projectsList.forEach((project, index) => {
      if (index !== expandedProjectIndex) {
        coverYs[index] = projectStates.get(project)?.coverY ?? 0;
      }
    });

    coverYs[expandedProjectIndex] = lerp(currentCoverY, desiredDetailCoverY, motionFollow);
    return coverYs;
  }

  const anchorIndex = activeProjectIndex;
  const anchorState = projectStates.get(projectsList[anchorIndex]);
  const desiredAnchorCoverY = getProjectCoverYForTop(getProjectAnchorLayoutTop());
  const anchorCoverY = anchorState
    ? lerp(anchorState.coverY, desiredAnchorCoverY, motionFollow)
    : desiredAnchorCoverY;
  const heights = projectsList.map((project, index) => getProjectCurrentSurfaceHeight(index, targets[index]));
  const tops = new Array(projectsList.length).fill(0);

  tops[anchorIndex] = anchorCoverY - CARD_COLLAPSED_HEIGHT * 0.5;

  for (let index = anchorIndex + 1; index < projectsList.length; index += 1) {
    tops[index] = tops[index - 1] + heights[index - 1] + getProjectGapAfter(index - 1);
  }

  for (let index = anchorIndex - 1; index >= 0; index -= 1) {
    tops[index] = tops[index + 1] - heights[index] - getProjectGapAfter(index);
  }

  tops.forEach((top, index) => {
    coverYs[index] = getProjectCoverYForTop(top);
  });

  return coverYs;
}

function syncSettleTransition() {
  if (expandedProjectIndex >= 0) {
    settledProjectIndex = activeProjectIndex;
    return;
  }

  const now = performance.now();

  if (
    activeProjectIndex !== settledProjectIndex &&
    now - lastCoverflowWheelTime >= selectedTransitionDelayMs &&
    now - activeProjectSelectedAt >= selectedTransitionDelayMs
  ) {
    settledProjectIndex = activeProjectIndex;
  }
}

function getDetailFrameHeight() {
  const viewportOffset = isPanelEmbed ? 0 : DETAIL_FRAME_VIEWPORT_OFFSET;

  return Math.max(360, window.innerHeight - viewportOffset - DETAIL_MEDIA_BOTTOM_GAP);
}

function getProjectTarget(index) {
  const isDetailExpanded = index === expandedProjectIndex;
  const isSelected = index === activeProjectIndex;
  const isExpanded = isDetailExpanded || (
    isSelected &&
    activeProjectIndex === settledProjectIndex &&
    performance.now() - activeProjectSelectedAt >= selectedTransitionDelayMs
  );
  const visualProgress = isExpanded ? 1 : 0;
  const rawOffset = index - activeProjectIndex;
  const distance = Math.abs(rawOffset);
  const opacity = expandedProjectIndex >= 0
    ? (isDetailExpanded ? 1 : 0)
    : clamp(1 - Math.max(0, distance - 2.15) * 0.55, 0, 1);

  return {
    anchorOffset: CARD_COLLAPSED_HEIGHT * 0.5,
    progress: visualProgress,
    scale: 1,
    lift: 0,
    glow: lerp(0.08, 1.05, visualProgress),
    coverY: 0,
    coverScale: lerp(0.9, 1, visualProgress),
    isDetailExpanded,
    isExpanded,
    isSelected,
    isAwaitingSettle: isSelected && !isExpanded && expandedProjectIndex < 0,
    opacity,
    detailProgress: isDetailExpanded ? 1 : 0,
  };
}

function syncProjectSizeState(state, target) {
  state.progress += (target.progress - state.progress) * motionFollow;
  state.scale += (target.scale - state.scale) * motionFollow;
  state.lift += (target.lift - state.lift) * motionFollow;
  state.glow += (target.glow - state.glow) * motionFollow;
  state.coverScale += (target.coverScale - state.coverScale) * motionFollow;
  state.detailProgress += (target.detailProgress - state.detailProgress) * motionFollow;
}

function syncProjectMotionState(project, target) {
  const state = projectStates.get(project);

  syncProjectSizeState(state, target);
  state.opacity += (target.opacity - state.opacity) * motionFollow;
  state.indexSlide += (
    (target.isExpanded && state.progress > 0.985 ? 1 : 0) - state.indexSlide
  ) * INDEX_SLIDE_FOLLOW;
}

function paintProject(project, target, index) {
  const state = projectStates.get(project);

  const visualProgress = clamp(state.progress, 0, 1);
  const detailProgress = easeInOutCubic(state.detailProgress);
  const mediaExpandProgress = detailProgress;
  const indexSlideProgress = steepenProgress(state.indexSlide);
  const normalExpandedHeight = getResolvedExpandedHeight(false);
  const detailExpandedHeight = getResolvedExpandedHeight(true);
  const normalHeight = lerp(CARD_COLLAPSED_HEIGHT, normalExpandedHeight, visualProgress);
  const height = Math.round(lerp(normalHeight, detailExpandedHeight, mediaExpandProgress));
  const cardHeight = Math.round(lerp(normalHeight, detailCardHeight, mediaExpandProgress));
  const normalCardWidth = lerp(CARD_COLLAPSED_WIDTH, CARD_EXPANDED_WIDTH, visualProgress);
  const cardWidth = lerp(normalCardWidth, detailCardWidth, mediaExpandProgress);
  const indexShift = (cardWidth - CARD_COLLAPSED_WIDTH) * (1 - indexSlideProgress);
  const rootWidth = projectsRoot.getBoundingClientRect().width || window.innerWidth;
  const segmentWidth = getSegmentColumnWidth();
  const normalProjectWidth = Math.max(0, rootWidth - segmentWidth);
  const projectLeft = lerp(segmentWidth, 0, detailProgress);
  const projectWidth = lerp(normalProjectWidth, rootWidth, detailProgress);
  const normalStreamWidth = height * 1.5;
  const detailGapWidth = DETAIL_SIDE_GAP * detailProgress;
  const detailCopyWidth = DETAIL_SIDE_WIDTH * detailProgress;
  const detailStreamWidth = Math.max(
    1,
    projectWidth - cardWidth - PROJECT_COLUMN_GAP - detailGapWidth - detailCopyWidth,
  );
  const targetStreamWidth = lerp(normalStreamWidth, detailStreamWidth, detailProgress);
  const normalSpacerWidth = Math.max(
    0,
    normalProjectWidth - normalCardWidth - PROJECT_COLUMN_GAP - normalStreamWidth,
  );
  const layoutSpacerWidth = lerp(normalSpacerWidth, 0, detailProgress);
  const coverAnchorOffset = target.anchorOffset ?? (
    target.isSelected ? CARD_COLLAPSED_HEIGHT * 0.5 : height * 0.5
  );

  project.style.setProperty("--detail-progress", detailProgress.toFixed(4));
  project.style.setProperty("--media-expand-progress", mediaExpandProgress.toFixed(4));
  project.style.setProperty("--band-progress", state.progress.toFixed(4));
  project.style.setProperty("--cover-opacity", state.opacity.toFixed(4));
  project.style.setProperty("--cover-scale", state.coverScale.toFixed(4));
  project.style.setProperty("--cover-y", `${state.coverY.toFixed(2)}px`);
  project.style.setProperty("--cover-anchor-offset", `${coverAnchorOffset.toFixed(2)}px`);
  project.style.setProperty("--surface-height", `${height}px`);
  project.style.setProperty("--card-height", `${cardHeight}px`);
  project.style.setProperty("--card-width", `${cardWidth.toFixed(2)}px`);
  project.style.setProperty("--stream-width", `${targetStreamWidth.toFixed(2)}px`);
  project.style.setProperty("--layout-spacer-width", `${layoutSpacerWidth.toFixed(2)}px`);
  project.style.setProperty("--detail-gap-width", `${detailGapWidth.toFixed(2)}px`);
  project.style.setProperty("--detail-copy-space", `${detailCopyWidth.toFixed(2)}px`);
  project.style.setProperty("--project-left", `${projectLeft.toFixed(2)}px`);
  project.style.setProperty("--project-width", `${projectWidth.toFixed(2)}px`);
  project.style.setProperty("--image-scale", state.scale.toFixed(4));
  project.style.setProperty("--image-lift", `${state.lift.toFixed(2)}px`);
  project.style.setProperty("--glow", state.glow.toFixed(4));
  project.style.setProperty("--index-shift", `${indexShift.toFixed(2)}px`);
  project.style.zIndex = String(100 - Math.round(Math.abs(index - activeProjectIndex) * 10));
  project.classList.toggle("is-index-sliding", state.indexSlide > 0.001);
  project.classList.toggle("is-card-expanded", state.indexSlide > 0.985);
  project.classList.toggle(
    "is-copy-ready",
    target.isExpanded &&
      state.progress > 0.998 &&
      state.indexSlide > 0.998 &&
      state.detailProgress < 0.001,
  );
}

function updateProject(project, target, index) {
  syncProjectMotionState(project, target);
  paintProject(project, target, index);
}

function buildTargets() {
  return projectsList.map((project, index) => getProjectTarget(index));
}

function syncActiveProjectClass() {
  const now = performance.now();
  const isDetailMode = expandedProjectIndex >= 0;

  rollingApp?.classList.toggle("is-detail-expanded", isDetailMode);
  document.body.classList.toggle("is-rolling-detail", isDetailMode);

  projectsList.forEach((project, index) => {
    const isActive = index === activeProjectIndex;
    const isDetailExpanded = index === expandedProjectIndex;
    const isColorReady = isActive && now - activeProjectSelectedAt >= selectedTransitionDelayMs;

    project.classList.toggle("is-active", isActive);
    project.classList.toggle("is-color-ready", isColorReady);
    project.classList.toggle("is-detail-expanded", isDetailExpanded);
    project.classList.toggle("is-detail-hidden", isDetailMode && !isDetailExpanded);
    project.setAttribute("aria-current", isActive ? "true" : "false");
    project.querySelector(".rolling-detail-copy")?.setAttribute(
      "aria-hidden",
      isDetailExpanded ? "false" : "true",
    );
  });
}

function primeProjectStates() {
  const targets = buildTargets();

  projectsList.forEach((project, index) => {
    const state = projectStates.get(project);
    const target = targets[index];

    state.progress = target.progress;
    state.scale = target.scale;
    state.lift = target.lift;
    state.glow = target.glow;
    state.coverScale = target.coverScale;
    state.opacity = target.opacity;
    state.indexSlide = target.isExpanded ? 1 : 0;
    state.detailProgress = target.detailProgress;
  });

  const coverYs = buildLiveLayoutCoverYs(targets);

  projectsList.forEach((project, index) => {
    const state = projectStates.get(project);

    state.coverY = coverYs[index];
    paintProject(project, targets[index], index);
  });
}

function selectCoverflowProject(nextIndex, selectedAt = performance.now()) {
  const clampedIndex = clamp(nextIndex, 0, projectsList.length - 1);

  if (clampedIndex === activeProjectIndex) {
    activeProjectSelectedAt = selectedAt;
    return;
  }

  activeProjectIndex = clampedIndex;
  activeProjectSelectedAt = selectedAt;
  notifyParentActiveProject();
}

function moveActiveProject(direction) {
  selectCoverflowProject(activeProjectIndex + direction);
}

function selectProject(index) {
  selectCoverflowProject(index);
}

function notifyParentDetailState() {
  if (window.parent === window) {
    return;
  }

  const activeProject = projectsList[expandedProjectIndex];

  window.parent.postMessage(
    {
      type: "rolling-detail-state",
      active: expandedProjectIndex >= 0,
      projectId: activeProject?.dataset.project || "",
    },
    window.location.origin,
  );
}

function notifyParentActiveProject() {
  if (window.parent === window) {
    return;
  }

  const activeProject = projectsList[activeProjectIndex];
  const projectId = activeProject?.dataset.project || "";

  if (!projectId || projectId === lastNotifiedActiveProjectId) {
    return;
  }

  lastNotifiedActiveProjectId = projectId;

  window.parent.postMessage(
    {
      type: "rolling-active-project",
      projectId,
    },
    window.location.origin,
  );
}

function animateElementScrollToTop(element, durationMs, frameWindow = window) {
  if (!element) {
    return;
  }

  const startTop = element.scrollTop || 0;
  const startLeft = element.scrollLeft || 0;
  const duration = Math.max(0, durationMs);

  if (duration === 0 || (startTop === 0 && startLeft === 0)) {
    element.scrollTop = 0;
    element.scrollLeft = 0;
    return;
  }

  const frame = frameWindow || window;
  const requestFrame = frame.requestAnimationFrame?.bind(frame) || window.requestAnimationFrame.bind(window);
  const startTime = frame.performance?.now?.() ?? performance.now();

  const tick = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = clamp(elapsed / duration, 0, 1);
    const easedProgress = easeInOutCubic(progress);

    element.scrollTop = lerp(startTop, 0, easedProgress);
    element.scrollLeft = lerp(startLeft, 0, easedProgress);

    if (progress < 1) {
      requestFrame(tick);
    }
  };

  requestFrame(tick);
}

function animateWindowScrollToTop(frameWindow, durationMs) {
  if (!frameWindow) {
    return;
  }

  const frameDocument = frameWindow.document;
  const startTop =
    frameWindow.scrollY ||
    frameDocument?.documentElement?.scrollTop ||
    frameDocument?.body?.scrollTop ||
    0;
  const startLeft =
    frameWindow.scrollX ||
    frameDocument?.documentElement?.scrollLeft ||
    frameDocument?.body?.scrollLeft ||
    0;
  const duration = Math.max(0, durationMs);

  if (duration === 0 || (startTop === 0 && startLeft === 0)) {
    frameWindow.scrollTo(0, 0);
    return;
  }

  const requestFrame =
    frameWindow.requestAnimationFrame?.bind(frameWindow) ||
    window.requestAnimationFrame.bind(window);
  const startTime = frameWindow.performance?.now?.() ?? performance.now();

  const tick = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = clamp(elapsed / duration, 0, 1);
    const easedProgress = easeInOutCubic(progress);

    frameWindow.scrollTo(
      lerp(startLeft, 0, easedProgress),
      lerp(startTop, 0, easedProgress),
    );

    if (progress < 1) {
      requestFrame(tick);
    }
  };

  requestFrame(tick);
}

function resetProjectMediaScroll(index) {
  const project = projectsList[index];
  const frame = project?.querySelector(".rolling-image-embed-frame");

  if (!frame?.contentWindow) {
    return;
  }

  try {
    const frameDocument = frame.contentDocument;
    const scrollRoot = frameDocument?.querySelector(".project-page");

    if (scrollRoot) {
      animateElementScrollToTop(scrollRoot, returnScrollDurationMs, frame.contentWindow);
      return;
    }

    animateWindowScrollToTop(frame.contentWindow, returnScrollDurationMs);
    animateElementScrollToTop(frameDocument?.documentElement, returnScrollDurationMs, frame.contentWindow);
    animateElementScrollToTop(frameDocument?.body, returnScrollDurationMs, frame.contentWindow);
  } catch (error) {
    // The embed is same-origin in this project; keep close behavior intact if that ever changes.
  }
}

function prepareProjectReturnScroll(index) {
  if (index < 0 || index >= projectsList.length) {
    return;
  }

  resetProjectMediaScroll(index);
  returnScrollProjectIndex = index;
}

function openProjectDetail(index) {
  const nextIndex = clamp(index, 0, projectsList.length - 1);

  hideRollingFrameCursor();
  hideRollingScrollCursor();
  returnScrollProjectIndex = -1;
  activeProjectIndex = nextIndex;
  settledProjectIndex = nextIndex;
  expandedProjectIndex = nextIndex;
  activeProjectSelectedAt = performance.now() - selectedTransitionDelayMs;
  coverflowWheelProgress = 0;
  notifyParentDetailState();
}

function closeProjectDetail() {
  if (expandedProjectIndex < 0) {
    return;
  }

  const closingProjectIndex = expandedProjectIndex;

  if (returnScrollProjectIndex !== closingProjectIndex) {
    resetProjectMediaScroll(closingProjectIndex);
  }

  returnScrollProjectIndex = -1;
  hideRollingScrollCursor();
  expandedProjectIndex = -1;
  settledProjectIndex = activeProjectIndex;
  activeProjectSelectedAt = performance.now();
  coverflowWheelProgress = 0;
  notifyParentDetailState();
}

function syncCoverflowWheelProgress() {
  const now = performance.now();

  if (now - lastCoverflowWheelTime < COVERFLOW_IDLE_DECAY_DELAY_MS) {
    return;
  }

  coverflowWheelProgress *= COVERFLOW_TUG_DECAY;

  if (Math.abs(coverflowWheelProgress) < 0.001) {
    coverflowWheelProgress = 0;
  }
}

function animateProjects() {
  syncSettleTransition();
  syncCoverflowCenter();
  syncCoverflowWheelProgress();
  syncActiveProjectClass();

  const targets = buildTargets();

  projectsList.forEach((project, index) => {
    syncProjectMotionState(project, targets[index]);
  });

  const coverYs = buildLiveLayoutCoverYs(targets);

  projectsList.forEach((project, index) => {
    const state = projectStates.get(project);

    state.coverY = coverYs[index];
    paintProject(project, targets[index], index);
  });

  syncSegmentRail();
  requestAnimationFrame(animateProjects);
}

debugToggle?.addEventListener("click", () => {
  document.body.classList.toggle("debug-outlines");
  syncDebugToggle();
});

labelToggle?.addEventListener("click", () => {
  applyDebugLabels();
  document.body.classList.toggle("debug-labels");
  syncDebugLabelOverlay();
  syncLabelToggle();
});

sizeSlider?.addEventListener("input", (event) => {
  const nextHeight = Number.parseFloat(event.currentTarget.value);

  if (!Number.isFinite(nextHeight)) {
    return;
  }

  setCardExpandedHeight(nextHeight);
});

detailMediaSlider?.addEventListener("input", (event) => {
  const nextScale = Number.parseFloat(event.currentTarget.value) / 100;

  if (!Number.isFinite(nextScale)) {
    return;
  }

  setDetailMediaScale(nextScale);
});

detailCardSlider?.addEventListener("input", (event) => {
  const nextHeight = Number.parseFloat(event.currentTarget.value);

  if (!Number.isFinite(nextHeight)) {
    return;
  }

  setDetailCardHeight(nextHeight);
});

detailCardWidthSlider?.addEventListener("input", (event) => {
  const nextWidth = Number.parseFloat(event.currentTarget.value);

  if (!Number.isFinite(nextWidth)) {
    return;
  }

  setDetailCardWidth(nextWidth);
});

followSlider?.addEventListener("input", (event) => {
  const nextFollow = Number.parseFloat(event.currentTarget.value);

  if (!Number.isFinite(nextFollow)) {
    return;
  }

  setMotionFollow(nextFollow);
});

wheelSlider?.addEventListener("input", (event) => {
  const nextSensitivity = Number.parseFloat(event.currentTarget.value);

  if (!Number.isFinite(nextSensitivity)) {
    return;
  }

  setWheelSensitivity(nextSensitivity);
});

delaySlider?.addEventListener("input", (event) => {
  const nextDelay = Number.parseFloat(event.currentTarget.value);

  if (!Number.isFinite(nextDelay)) {
    return;
  }

  setSelectedTransitionDelay(nextDelay);
});

returnScrollSlider?.addEventListener("input", (event) => {
  const nextDuration = Number.parseFloat(event.currentTarget.value);

  if (!Number.isFinite(nextDuration)) {
    return;
  }

  setReturnScrollDuration(nextDuration);
});

parametersToggle?.addEventListener("click", () => {
  setParametersOpen(!parametersOpen);
});

window.setRollingParametersOpen = setParametersOpen;
window.getRollingParametersOpen = getParametersOpen;

focusBandHandle?.addEventListener("pointerdown", (event) => {
  focusBandDragOffset = event.clientY - window.innerHeight * focusBandTopRatio;
  focusBandHandle.setPointerCapture(event.pointerId);
});

focusBandHandle?.addEventListener("pointermove", (event) => {
  if (!focusBandHandle.hasPointerCapture(event.pointerId)) {
    return;
  }

  const nextTopPx = event.clientY - focusBandDragOffset;
  const nextRatio = nextTopPx / window.innerHeight;
  setFocusBandTopRatio(nextRatio);
});

focusBandHandle?.addEventListener("pointerup", (event) => {
  if (focusBandHandle.hasPointerCapture(event.pointerId)) {
    focusBandHandle.releasePointerCapture(event.pointerId);
  }
});

focusBandHandle?.addEventListener("pointercancel", (event) => {
  if (focusBandHandle.hasPointerCapture(event.pointerId)) {
    focusBandHandle.releasePointerCapture(event.pointerId);
  }
});

projectsRoot.addEventListener("click", (event) => {
  const projectCard = event.target.closest(".rolling-project-card");
  const cardProject = projectCard?.closest(".rolling-project");

  if (cardProject && projectsList.indexOf(cardProject) === expandedProjectIndex) {
    closeProjectDetail();
    return;
  }

  const imageMedia = event.target.closest(".rolling-image-media");
  const project = imageMedia?.closest(".rolling-project");

  if (!project) {
    return;
  }

  openProjectDetail(projectsList.indexOf(project));
});

projectsRoot.addEventListener("pointerover", showRollingFrameCursor);
projectsRoot.addEventListener("pointermove", moveRollingFrameCursor);
projectsRoot.addEventListener("pointerout", (event) => {
  if (
    event.relatedTarget instanceof Element &&
    event.relatedTarget.closest(".rolling-image-media")
  ) {
    return;
  }

  hideRollingFrameCursor();
});
projectsRoot.addEventListener("pointerleave", hideRollingFrameCursor);

projectsRoot.addEventListener("pointerover", showRollingScrollCursor);
projectsRoot.addEventListener("pointermove", moveRollingScrollCursor);
projectsRoot.addEventListener("pointerout", (event) => {
  if (
    event.relatedTarget instanceof Element &&
    event.relatedTarget.closest(".rolling-image-wheel-layer")
  ) {
    return;
  }

  hideRollingScrollCursor();
});
projectsRoot.addEventListener("pointerleave", hideRollingScrollCursor);

projectsRoot.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) {
    return;
  }

  const projectCard = event.target.closest(".rolling-project-card");
  const cardProject = projectCard?.closest(".rolling-project");
  const cardProjectIndex = projectsList.indexOf(cardProject);

  if (cardProjectIndex === expandedProjectIndex) {
    prepareProjectReturnScroll(cardProjectIndex);
  }
});

projectsRoot.addEventListener(
  "wheel",
  (event) => {
    const wheelLayer = event.target instanceof Element
      ? event.target.closest(".rolling-image-wheel-layer")
      : null;
    const project = wheelLayer?.closest(".rolling-project");

    if (!project?.classList.contains("is-detail-expanded")) {
      return;
    }

    const didPost = postScrollToRollingEmbeddedProject(project, event.deltaY);

    if (!didPost) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    rollingScrollCursorX = event.clientX;
    rollingScrollCursorY = event.clientY;
    window.setTimeout(() => refreshRollingScrollCursor(wheelLayer), 40);
  },
  { passive: false },
);

projectsRoot.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const imageMedia = event.target.closest(".rolling-image-media");
  const project = imageMedia?.closest(".rolling-project");

  if (!project) {
    return;
  }

  event.preventDefault();
  openProjectDetail(projectsList.indexOf(project));
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProjectDetail();
  }
});

window.addEventListener("message", (event) => {
  const message = event.data;

  if (!message || message.type !== "rolling-select-project") {
    return;
  }

  const projectIndex = projectsList.findIndex((project) => (
    project.dataset.project === String(message.projectId || "")
  ));

  if (projectIndex < 0) {
    return;
  }

  closeProjectDetail();
  selectProject(projectIndex);
});

function handleCoverflowWheel(event) {
    if (event.defaultPrevented) {
      return;
    }

    const eventTarget = event.target instanceof Element ? event.target : null;

    if (eventTarget && focusBandHandle?.contains(eventTarget)) {
      return;
    }

    if (expandedProjectIndex >= 0) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    const rawDelta =
      event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? event.deltaY * 18
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? event.deltaY * window.innerHeight
          : event.deltaY;
    const normalizedDelta = clamp(rawDelta, -COVERFLOW_WHEEL_DELTA_LIMIT, COVERFLOW_WHEEL_DELTA_LIMIT);
    const adjustedDelta = normalizedDelta * wheelSensitivity;
    const now = performance.now();
    lastCoverflowWheelTime = now;
    activeProjectSelectedAt = now;
    coverflowWheelProgress += adjustedDelta / COVERFLOW_WHEEL_THRESHOLD;

    if (Math.abs(coverflowWheelProgress) >= 1) {
      const stepCount = Math.trunc(coverflowWheelProgress);
      selectCoverflowProject(activeProjectIndex + stepCount, now);
      coverflowWheelProgress -= stepCount;
    }
}

loadCardExpandedHeight();
syncSizeControl();
loadDetailMediaScale();
syncDetailMediaControl();
loadDetailCardHeight();
syncDetailCardControl();
loadDetailCardWidth();
syncDetailCardWidthControl();
loadMotionFollow();
syncFollowControl();
loadWheelSensitivity();
syncWheelControl();
loadSelectedTransitionDelay();
syncDelayControl();
loadReturnScrollDuration();
syncReturnScrollControl();
loadParametersOpen();
syncParametersToggle();

window.addEventListener("wheel", handleCoverflowWheel, { passive: false });
projectsRoot.addEventListener("wheel", handleCoverflowWheel, { passive: false });

loadFocusBandTopRatio();
window.scrollTo({
  top: 0,
  left: 0,
  behavior: "auto",
});
syncFocusBandVisual();
syncDebugToggle();
syncLabelToggle();
syncCoverflowCenter();
syncSegmentRail();
syncActiveProjectClass();
primeProjectStates();
notifyParentActiveProject();
notifyParentDetailState();
animateProjects();
