const detailScroll = document.getElementById("detail-scroll");
const archiveApp = document.querySelector(".archive-app");
const archiveData = window.TDG_ARCHIVE || { groups: [], projects: [] };
const archiveProjectById = new Map((archiveData.projects || []).map((project) => [project.id, project]));
const archiveProjectDisplayNumberById = new Map();
const archiveProjectGroups = (archiveData.groups || [])
  .map((group) => {
    const projects = (group.projectIds || [])
      .map((projectId) => archiveProjectById.get(projectId))
      .filter((project) => project && project.visible !== false)
      .map((project, projectIndex) => {
        const displayNumber = String(projectIndex + 1).padStart(2, "0");
        archiveProjectDisplayNumberById.set(project.id, displayNumber);
        return {
          ...project,
          displayNumber,
        };
      });

    return {
      ...group,
      projects,
    };
  })
  .filter((group) => group.projects.length > 0);
const orderedArchiveProjects = archiveProjectGroups.flatMap((group) => group.projects);

function buildIndexList() {
  const indexList = document.querySelector(".index-list");

  if (!indexList) {
    return;
  }

  const segments = archiveProjectGroups.map((group) => {
    const segment = document.createElement("li");
    const segmentTitle = document.createElement("span");
    const segmentItems = document.createElement("ol");

    segment.className = "index-segment";
    segment.dataset.segment = group.id;
    segment.dataset.debugLabel = `li.index-segment[${group.id}]`;
    segment.style.display = "grid";
    segment.style.gridTemplateColumns = "116px minmax(0, 1fr)";

    segmentTitle.className = "index-segment-title";
    segmentTitle.textContent = group.title;
    segmentTitle.style.minWidth = "104px";
    segmentTitle.style.overflowWrap = "normal";
    segmentTitle.style.whiteSpace = "nowrap";
    segmentTitle.style.wordBreak = "keep-all";

    segmentItems.className = "index-segment-items";
    segmentItems.setAttribute("aria-label", group.title);

    group.projects.forEach((project) => {
      const item = document.createElement("li");
      const number = document.createElement("span");
      const title = document.createElement("span");
      const dot = document.createElement("span");

      item.className = "index-item";
      item.dataset.project = project.id;
      item.dataset.segment = group.id;
      item.setAttribute("aria-label", `项目 ${project.displayNumber} ${project.title}`);
      item.dataset.debugLabel = `li.index-item[${project.id}]`;

      number.className = "index-item-number";
      number.textContent = project.displayNumber;

      title.className = "index-item-title";
      title.textContent = project.title;

      dot.className = "index-item-dot";
      dot.setAttribute("aria-hidden", "true");

      item.append(number, title, dot);
      segmentItems.append(item);
    });

    segment.append(segmentTitle, segmentItems);
    return segment;
  });

  indexList.replaceChildren(...segments);
}

buildIndexList();

function getProjectDisplayValue(project, key, fallback = "") {
  const value = project[key];

  return value === undefined || value === null || value === "" ? fallback : String(value);
}

function getProjectDetailTitle(project) {
  return getProjectDisplayValue(
    project,
    "detailTitle",
    getProjectDisplayValue(project, "sideTitle", project.title),
  );
}

function getProjectCardTitle(project) {
  return getProjectDisplayValue(project, "title").replace(/\s+/g, " ").trim();
}

function createProjectEmbedSrc(projectId, { priority = "auto" } = {}) {
  const params = new URLSearchParams({
    project: projectId,
    embed: "1",
    v: "20260623-loading-priority-4",
  });

  if (priority === "high") {
    params.set("priority", "high");
  }

  return `./projects/project-panel-mark-1/?${params.toString()}`;
}

function createElementWithClass(tagName, className, textContent = "") {
  const element = document.createElement(tagName);

  element.className = className;

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}

function createProjectEmbed(project, projectIndex = 0) {
  const embed = createElementWithClass("div", "panel-project-embed");
  const wheelLayer = createElementWithClass("div", "panel-project-embed-wheel-layer");
  const shouldLoadImmediately = projectIndex === 0;
  const embedSrc = createProjectEmbedSrc(project.id, {
    priority: shouldLoadImmediately ? "high" : "auto",
  });

  embed.setAttribute("aria-label", `${project.title}独立项目容器`);
  embed.dataset.debugLabel = "div.panel-project-embed";
  wheelLayer.setAttribute("aria-hidden", "true");

  if (!project.placeholder) {
    const frame = document.createElement("iframe");

    frame.className = "panel-project-embed-frame";
    frame.title = `${project.title}项目页面`;
    frame.loading = shouldLoadImmediately ? "eager" : "lazy";
    frame.fetchPriority = shouldLoadImmediately ? "high" : "low";
    frame.dataset.src = embedSrc;

    if (shouldLoadImmediately) {
      frame.src = embedSrc;
    }

    embed.append(frame, wheelLayer);
    return embed;
  }

  const placeholder = createElementWithClass("div", "panel-project-embed-placeholder");

  placeholder.textContent = project.placeholder ? "PLACEHOLDER" : project.title;
  embed.classList.add("panel-project-embed--placeholder");
  embed.append(placeholder, wheelLayer);
  return embed;
}

function createProjectPanel(project, projectIndex) {
  const displayNumber = project.displayNumber || String(projectIndex + 1).padStart(2, "0");
  const panel = document.createElement("article");
  const content = createElementWithClass("div", "panel-content");
  const meta = createElementWithClass("div", "panel-meta");
  const body = createElementWithClass("div", "panel-body");
  const numberColumn = createElementWithClass("div", "panel-number-column");
  const highlightCard = createElementWithClass("button", "panel-highlight-card panel-expand-toggle");
  const bandNumber = createElementWithClass("p", "band-number", `${displayNumber}.`);
  const panelCopy = createElementWithClass("div", "panel-copy");
  const title = document.createElement("h2");
  const description = document.createElement("p");
  const arrow = createElementWithClass("span", "panel-highlight-arrow");
  const frameShell = createElementWithClass("div", "panel-frame-shell panel-frame-shell--project-embed");
  const panelFrame = createElementWithClass("div", "panel-frame panel-frame--project-embed");
  const frameScroll = createElementWithClass("div", "panel-frame-scroll panel-frame-scroll--project-embed");
  const sideCopy = createElementWithClass("aside", "panel-side-copy");
  const sideKicker = createElementWithClass("p", "panel-side-copy-kicker", `PROJECT ${displayNumber}`);
  const sideTitle = createElementWithClass(
    "h3",
    "panel-side-copy-title",
    getProjectDetailTitle(project),
  );
  const sideDescription = createElementWithClass(
    "p",
    "panel-side-copy-description",
    getProjectDisplayValue(project, "sideDescription", project.description),
  );
  const sideYear = createElementWithClass("p", "panel-side-copy-year", getProjectDisplayValue(project, "year", "TBD"));
  const directionSpec = createProjectSideSpec(
    "方向",
    getProjectDisplayValue(project, "direction", getProjectDisplayValue(project, "tagline")),
  );
  const keywordSpec = createProjectSideSpec(
    "关键词",
    getProjectDisplayValue(project, "keywords", getProjectDisplayValue(project, "tagline")),
  );

  panel.className = `project-panel project-panel--hero${projectIndex === 0 ? " is-active" : ""}`;
  panel.dataset.project = project.id;
  panel.dataset.debugLabel = `article.project-panel[${project.id}]`;
  panel.setAttribute("aria-label", project.title);

  content.dataset.debugLabel = "div.panel-content";
  meta.dataset.debugLabel = "div.panel-meta";
  body.dataset.debugLabel = "div.panel-body";
  numberColumn.dataset.debugLabel = "div.panel-number-column";
  highlightCard.type = "button";
  highlightCard.setAttribute("aria-expanded", "false");
  highlightCard.dataset.debugLabel = "button.panel-highlight-card";
  frameShell.dataset.debugLabel = "div.panel-frame-shell";
  panelFrame.dataset.debugLabel = "div.panel-frame";
  frameScroll.dataset.debugLabel = "div.panel-frame-scroll";
  sideCopy.setAttribute("aria-hidden", "true");
  sideCopy.dataset.debugLabel = "aside.panel-side-copy";
  arrow.setAttribute("aria-hidden", "true");

  meta.append(
    createElementWithClass("span", "", getProjectDisplayValue(project, "metaTitle", project.title)),
    createElementWithClass("span", "", getProjectDisplayValue(project, "metaSubtitle", `${project.tagline || "PROJECT"} / ${project.year || "TBD"}`)),
  );

  title.textContent = getProjectCardTitle(project);
  description.textContent = project.description || "";
  panelCopy.append(title, description);
  highlightCard.append(bandNumber, panelCopy, arrow);
  numberColumn.append(highlightCard);
  frameScroll.append(createProjectEmbed(project, projectIndex));
  panelFrame.append(frameScroll);
  frameShell.append(panelFrame);
  sideCopy.append(
    sideKicker,
    sideTitle,
    sideDescription,
    createElementWithClass("span", "panel-side-copy-rule"),
    sideYear,
    createElementWithClass("span", "panel-side-copy-rule"),
    directionSpec,
    keywordSpec,
  );
  sideCopy.querySelectorAll(".panel-side-copy-rule").forEach((rule) => {
    rule.setAttribute("aria-hidden", "true");
  });
  body.append(numberColumn, frameShell, sideCopy);
  content.append(meta, body);
  panel.append(content);

  return panel;
}

function createProjectSideSpec(labelText, valueText) {
  const spec = createElementWithClass("div", "panel-side-copy-spec");
  const label = createElementWithClass("p", "panel-side-copy-label", labelText);
  const value = createElementWithClass("p", "panel-side-copy-value", valueText);

  spec.append(label, value);
  return spec;
}

function buildProjectPanels() {
  const detailTrack = document.getElementById("detail-track");

  if (!detailTrack) {
    return;
  }

  if (orderedArchiveProjects.length === 0) {
    detailTrack.replaceChildren();
    return;
  }

  detailTrack.replaceChildren(...orderedArchiveProjects.map(createProjectPanel));
}

buildProjectPanels();

function createMobileProjectDetailGallery(project, projectIndex) {
  const gallery = createElementWithClass("div", "mobile-project-detail-gallery");
  const detailImages = Array.isArray(project.images) ? project.images.slice(1) : [];

  gallery.setAttribute("aria-label", `${project.title.replace(/\s+/g, " ")} 项目图片`);

  detailImages.forEach((imageSrc, imageIndex) => {
    const frame = createElementWithClass("figure", "mobile-project-detail-frame");
    const image = document.createElement("img");

    image.src = imageSrc;
    image.alt = `${project.title} ${String(imageIndex + 2).padStart(2, "0")}`;
    image.loading = projectIndex === 0 && imageIndex < 2 ? "eager" : "lazy";
    image.decoding = "async";
    frame.append(image);
    gallery.append(frame);
  });

  return gallery;
}

function buildMobileProjectList() {
  const archiveDetail = document.querySelector(".archive-detail");

  if (!archiveDetail || archiveDetail.querySelector(".mobile-project-list")) {
    return;
  }

  const list = createElementWithClass("div", "mobile-project-list");

  list.setAttribute("aria-label", "移动端项目列表");

  orderedArchiveProjects.forEach((project, projectIndex) => {
    const displayNumber = project.displayNumber || String(projectIndex + 1).padStart(2, "0");
    const card = createElementWithClass("article", "mobile-project-card");
    const header = createElementWithClass("div", "mobile-project-card-header");
    const number = createElementWithClass("p", "mobile-project-number", `${displayNumber}.`);
    const text = createElementWithClass("div", "mobile-project-text");
    const title = createElementWithClass("h2", "mobile-project-title", getProjectCardTitle(project));
    const description = createElementWithClass("p", "mobile-project-description", project.description || "");
    const arrow = createElementWithClass("button", "mobile-project-arrow");
    const media = createElementWithClass("div", "mobile-project-media");
    const image = document.createElement("img");
    const gallery = createMobileProjectDetailGallery(project, projectIndex);

    card.dataset.project = project.id;
    card.classList.toggle("is-featured", projectIndex === 0);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-expanded", "false");
    card.setAttribute("aria-label", `展开项目：${project.title.replace(/\s+/g, " ")}`);
    arrow.type = "button";
    arrow.setAttribute("aria-label", `展开项目：${project.title.replace(/\s+/g, " ")}`);
    image.src = project.coverImage || project.images?.[0] || "";
    image.alt = project.title;
    image.loading = projectIndex < 2 ? "eager" : "lazy";
    image.decoding = "async";

    text.append(title, description);
    header.append(number, text, arrow);
    media.append(image);
    card.append(header, media, gallery);
    list.append(card);
  });

  archiveDetail.append(list);
}

buildMobileProjectList();

const projectPanels = Array.from(document.querySelectorAll(".project-panel"));
const indexItems = Array.from(document.querySelectorAll(".index-item"));
const mobileProjectList = document.querySelector(".mobile-project-list");
const mobileProjectCards = Array.from(document.querySelectorAll(".mobile-project-card"));
const currentProject = document.getElementById("current-project");
const debugToggle = document.getElementById("debug-toggle");
const labelToggle = document.getElementById("label-toggle");
const parametersToggle = document.getElementById("parameters-toggle");
const rollingFrame = document.querySelector(".archive-rolling-frame");
const homeTransitionStage = document.getElementById("home-transition-stage");
const homeIntro = document.getElementById("home-intro");
const homeIntroLetters = Array.from(document.querySelectorAll(".home-intro-letter"));
const homeNavButtons = Array.from(document.querySelectorAll(".home-nav-button"));
const homeTopLogo = document.querySelector(".index-header, .home-top-logo");
const homeCursorAsset = "./Assets/Icons/Arrow.svg";
const homeButton = document.getElementById("index-home-button");
const aboutButton = document.getElementById("index-about-button");
const projectGroup = document.getElementById("index-project-group");
const ABOUT_WORK_ARROW_WHITE_CLASS = "about-work-tile--arrow-white";
const ABOUT_WORK_HOVER_ANIMATION_CLASS = "is-desktop-hover-animating";
const ABOUT_WORK_HOVER_ANIMATION_MS = 560;
const ABOUT_PROJECT_MOBILE_EXIT_DELAY = 220;
const PROJECT_DIRECTORY_PRE_ENTER_CLASS = "is-project-directory-pre-enter";
const PROJECT_DIRECTORY_ENTERING_CLASS = "is-project-directory-entering";
const PROJECT_PANELS_PRE_ENTER_CLASS = "is-project-panels-pre-enter";
const PROJECT_PANELS_ENTERING_CLASS = "is-project-panels-entering";
const PROJECT_DIRECTORY_ENTER_MS = 1800;
const PROJECT_ENTER_START_DELAY_MS = 380;
const PROJECT_DIRECTORY_LIST_DELAY_MS = 50;
const ABOUT_PANELS_PRE_ENTER_CLASS = "is-about-panels-pre-enter";
const ABOUT_PANELS_ENTERING_CLASS = "is-about-panels-entering";
const ABOUT_PANELS_ENTER_START_DELAY_MS = 200;
const ABOUT_PANELS_ENTER_MS = 1500;
let mobileExpandedProjectId = "";
let mobileProjectRestoreScrollTop = 0;
let mobileProjectTransitionTimer = 0;
let mobileProjectActiveAnimation = null;
let mobileAboutWorkHighlightFrame = 0;
let projectDirectoryEnterTimer = 0;
let projectDirectoryEnterElements = [];
let aboutPanelsEnterTimer = 0;
const aboutWorkHoverAnimationTimers = new WeakMap();
const MOBILE_PROJECT_EXPAND_DURATION = 920;
const MOBILE_PROJECT_COLLAPSE_DURATION = 780;
const MOBILE_PROJECT_MOTION_EASING = "cubic-bezier(0.19, 1, 0.22, 1)";

function getNumericCssValue(element, propertyName, fallback = 0) {
  const value = Number.parseFloat(window.getComputedStyle(element).getPropertyValue(propertyName));
  return Number.isFinite(value) ? value : fallback;
}

function syncAboutWorkTileArrow(tile) {
  if (tile.dataset.arrowTone === "white") {
    tile.classList.add(ABOUT_WORK_ARROW_WHITE_CLASS);
    return;
  }

  const image = tile.querySelector("img");
  const tileWidth = Math.round(tile.clientWidth);
  const tileHeight = Math.round(tile.clientHeight);

  if (!image || !image.complete || !image.naturalWidth || !tileWidth || !tileHeight) {
    return;
  }

  const inset = getNumericCssValue(tile, "--about-work-arrow-inset", 10);
  const arrowWidth = getNumericCssValue(tile, "--about-work-arrow-width", 26);
  const arrowHeight = getNumericCssValue(tile, "--about-work-arrow-height", 26);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return;
  }

  canvas.width = tileWidth;
  canvas.height = tileHeight;

  const scale = Math.max(tileWidth / image.naturalWidth, tileHeight / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const drawX = (tileWidth - drawWidth) / 2;
  const drawY = (tileHeight - drawHeight) / 2;

  try {
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

    const sampleX = Math.max(0, Math.round(tileWidth - inset - arrowWidth));
    const sampleY = Math.max(0, Math.round(inset));
    const sampleWidth = Math.max(1, Math.min(tileWidth - sampleX, Math.round(arrowWidth)));
    const sampleHeight = Math.max(1, Math.min(tileHeight - sampleY, Math.round(arrowHeight)));
    const pixels = context.getImageData(sampleX, sampleY, sampleWidth, sampleHeight).data;
    let luminance = 0;

    for (let index = 0; index < pixels.length; index += 4) {
      luminance += pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722;
    }

    const averageLuminance = luminance / (pixels.length / 4);
    tile.classList.toggle(ABOUT_WORK_ARROW_WHITE_CLASS, averageLuminance < 145);
  } catch {
    tile.classList.remove(ABOUT_WORK_ARROW_WHITE_CLASS);
  }
}

function syncAboutWorkTileArrows() {
  document.querySelectorAll(".about-work-tile").forEach((tile) => {
    const image = tile.querySelector("img");

    if (!image) {
      return;
    }

    if (image.complete && image.naturalWidth) {
      syncAboutWorkTileArrow(tile);
      return;
    }

    image.addEventListener("load", () => syncAboutWorkTileArrow(tile), { once: true });
  });
}

function playDesktopAboutWorkHoverAnimation(tile) {
  if (window.matchMedia("(max-width: 700px)").matches) {
    return;
  }

  const existingTimer = aboutWorkHoverAnimationTimers.get(tile);

  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  tile.classList.remove(ABOUT_WORK_HOVER_ANIMATION_CLASS);
  void tile.offsetWidth;
  tile.classList.add(ABOUT_WORK_HOVER_ANIMATION_CLASS);

  const timer = window.setTimeout(() => {
    tile.classList.remove(ABOUT_WORK_HOVER_ANIMATION_CLASS);
    aboutWorkHoverAnimationTimers.delete(tile);
  }, ABOUT_WORK_HOVER_ANIMATION_MS);

  aboutWorkHoverAnimationTimers.set(tile, timer);
}

function syncAboutSheetScale() {
  if (!aboutSheet || aboutView?.hidden || window.matchMedia("(max-width: 1180px)").matches) {
    aboutSheet?.style.setProperty("--about-sheet-scale", "1");
    aboutSheet?.style.setProperty("--about-sheet-scale-inverse", "1");
    return;
  }

  const paddingTop = getNumericCssValue(aboutSheet, "padding-top");
  const paddingBottom = getNumericCssValue(aboutSheet, "padding-bottom");
  const availableHeight = aboutSheet.clientHeight - paddingTop - paddingBottom;
  const scale = Math.min(1, Math.max(0.5, availableHeight / ABOUT_DESIGN_CONTENT_HEIGHT));
  const inverseScale = 1 / scale;

  aboutSheet.style.setProperty("--about-sheet-scale", scale.toFixed(4));
  aboutSheet.style.setProperty("--about-sheet-scale-inverse", inverseScale.toFixed(4));
}

function syncStaticProjectPanelNumbers() {
  projectPanels.forEach((panel) => {
    const displayNumber = archiveProjectDisplayNumberById.get(panel.dataset.project);

    if (!displayNumber) {
      return;
    }

    const bandNumber = panel.querySelector(".band-number");
    const sideKicker = panel.querySelector(".panel-side-copy-kicker");

    if (bandNumber) {
      bandNumber.textContent = `${displayNumber}.`;
    }

    if (sideKicker) {
      sideKicker.textContent = `PROJECT ${displayNumber}`;
    }
  });
}

syncStaticProjectPanelNumbers();

function setProjectDirectoryExpanded() {
  projectGroup?.classList.remove("is-collapsed");
  projectToggle?.setAttribute("aria-expanded", "true");
}

function clearProjectDirectoryEnter() {
  window.clearTimeout(projectDirectoryEnterTimer);
  projectDirectoryEnterTimer = 0;
  projectDirectoryEnterElements.forEach((element) => {
    element.style.removeProperty("opacity");
    element.style.removeProperty("transform");
    element.style.removeProperty("transition");
    element.style.removeProperty("will-change");
  });
  projectDirectoryEnterElements = [];
  projectGroup?.classList.remove(PROJECT_DIRECTORY_PRE_ENTER_CLASS);
  projectGroup?.classList.remove(PROJECT_DIRECTORY_ENTERING_CLASS);
  archiveDetail?.classList.remove(PROJECT_PANELS_PRE_ENTER_CLASS);
  archiveDetail?.classList.remove(PROJECT_PANELS_ENTERING_CLASS);
}

function getProjectDirectoryEnterItems() {
  if (!projectGroup) {
    return [];
  }

  return [
    projectGroup.querySelector(".index-panel-title"),
    ...projectGroup.querySelectorAll(".index-segment-title, .index-item"),
  ].filter(Boolean);
}

function getProjectPanelEnterItems() {
  return [document.querySelector(".archive-rolling-panel") || detailScroll || archiveDetail].filter(Boolean);
}

function shouldSkipProjectDirectoryEnter(force = false) {
  if (
    !projectGroup ||
    window.matchMedia("(max-width: 700px)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return true;
  }

  return false;
}

function prepareProjectDirectoryEnter({ force = false } = {}) {
  if (shouldSkipProjectDirectoryEnter(force)) {
    return false;
  }

  const enterItems = getProjectDirectoryEnterItems();
  const panelEnterItems = getProjectPanelEnterItems();

  projectGroup.style.setProperty("--project-directory-rule-delay", `${PROJECT_DIRECTORY_LIST_DELAY_MS}ms`);
  enterItems.forEach((item, index) => {
    item.style.setProperty("--project-directory-enter-delay", `${PROJECT_DIRECTORY_LIST_DELAY_MS + index * 60}ms`);
  });
  projectPanels.forEach((panel, index) => {
    panel.style.setProperty("--project-panel-enter-delay", `${index * 28}ms`);
  });

  clearProjectDirectoryEnter();
  projectDirectoryEnterElements = [...enterItems, ...panelEnterItems];
  enterItems.forEach((item) => {
    item.style.transition = "none";
    item.style.opacity = "0";
    item.style.transform = "translate3d(-42px, 0, 0)";
    item.style.willChange = "opacity, transform";
  });
  panelEnterItems.forEach((panelContent) => {
    panelContent.style.willChange = "opacity, transform";
  });

  projectGroup.classList.add(PROJECT_DIRECTORY_PRE_ENTER_CLASS);
  archiveDetail?.classList.add(PROJECT_PANELS_PRE_ENTER_CLASS);
  projectGroup.classList.remove(PROJECT_DIRECTORY_ENTERING_CLASS);
  archiveDetail?.classList.remove(PROJECT_PANELS_ENTERING_CLASS);

  return true;
}

function startProjectDirectoryEnter() {
  if (!projectGroup || projectDirectoryEnterElements.length === 0) {
    return;
  }

  const enterItems = getProjectDirectoryEnterItems();
  const panelEnterItems = getProjectPanelEnterItems();

  enterItems.forEach((item, index) => {
    const delay = PROJECT_DIRECTORY_LIST_DELAY_MS + index * 60;

    item.style.transition = `opacity 660ms cubic-bezier(0.16, 1, 0.32, 1) ${delay}ms, transform 660ms cubic-bezier(0.16, 1, 0.32, 1) ${delay}ms`;
  });
  projectDirectoryEnterElements.forEach((element) => {
    void element.offsetWidth;
  });

  window.requestAnimationFrame(() => {
    projectGroup.classList.add(PROJECT_DIRECTORY_ENTERING_CLASS);
    archiveDetail?.classList.add(PROJECT_PANELS_ENTERING_CLASS);
    rollingFrame?.contentWindow?.postMessage({ type: "rolling-enter-projects" }, "*");
    enterItems.forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "translate3d(0, 0, 0)";
    });
  });

  projectDirectoryEnterTimer = window.setTimeout(() => {
    projectDirectoryEnterElements.forEach((element) => {
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
      element.style.removeProperty("transition");
      element.style.removeProperty("will-change");
    });
    projectDirectoryEnterElements = [];
    projectGroup.classList.remove(PROJECT_DIRECTORY_PRE_ENTER_CLASS);
    projectGroup.classList.remove(PROJECT_DIRECTORY_ENTERING_CLASS);
    archiveDetail?.classList.remove(PROJECT_PANELS_PRE_ENTER_CLASS);
    archiveDetail?.classList.remove(PROJECT_PANELS_ENTERING_CLASS);
    projectDirectoryEnterTimer = 0;
  }, PROJECT_DIRECTORY_ENTER_MS);
}

function getAboutPanelEnterItems() {
  if (!aboutView) {
    return [];
  }

  return [
    aboutView.querySelector(".about-profile-panel"),
    aboutView.querySelector(".about-keyword-panel"),
    ...aboutView.querySelectorAll(".about-core-panel .about-compact-section"),
    aboutView.querySelector(".about-experience-panel"),
  ].filter(Boolean);
}

function clearAboutPanelsEnter() {
  window.clearTimeout(aboutPanelsEnterTimer);
  aboutPanelsEnterTimer = 0;
  aboutView?.classList.remove(ABOUT_PANELS_PRE_ENTER_CLASS, ABOUT_PANELS_ENTERING_CLASS);

  getAboutPanelEnterItems().forEach((item) => {
    item.style.removeProperty("--about-panel-enter-delay");
  });
}

function prepareAboutPanelsEnter() {
  if (
    !aboutView ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return false;
  }

  clearAboutPanelsEnter();
  getAboutPanelEnterItems().forEach((item, index) => {
    item.style.setProperty("--about-panel-enter-delay", `${index * 72}ms`);
  });
  aboutView.classList.add(ABOUT_PANELS_PRE_ENTER_CLASS);

  return true;
}

function startAboutPanelsEnter() {
  if (!aboutView?.classList.contains(ABOUT_PANELS_PRE_ENTER_CLASS)) {
    return;
  }

  void aboutView.offsetWidth;
  aboutView.classList.add(ABOUT_PANELS_ENTERING_CLASS);

  aboutPanelsEnterTimer = window.setTimeout(() => {
    aboutView.classList.remove(ABOUT_PANELS_PRE_ENTER_CLASS, ABOUT_PANELS_ENTERING_CLASS);
    aboutPanelsEnterTimer = 0;
  }, ABOUT_PANELS_ENTER_MS);
}

function syncRollingFrameProjectNumbers() {
  const frameDocument = rollingFrame?.contentDocument;

  if (!frameDocument) {
    return false;
  }

  frameDocument.querySelectorAll(".rolling-project").forEach((projectElement) => {
    const displayNumber = archiveProjectDisplayNumberById.get(projectElement.dataset.project);

    if (!displayNumber) {
      return;
    }

    const projectIndex = projectElement.querySelector(".rolling-project-index");
    const detailKicker = projectElement.querySelector(".rolling-detail-kicker");

    if (projectIndex) {
      projectIndex.textContent = `${displayNumber}.`;
    }

    if (detailKicker) {
      detailKicker.textContent = `PROJECT ${displayNumber}`;
    }

    projectElement.querySelectorAll(".rolling-image-placeholder-copy").forEach((placeholder) => {
      placeholder.textContent = `PLACEHOLDER ${displayNumber}`;
    });
  });

  return true;
}

function queueRollingFrameNumberSync() {
  syncRollingFrameProjectNumbers();
  window.setTimeout(syncRollingFrameProjectNumbers, 120);
  window.setTimeout(syncRollingFrameProjectNumbers, 420);
}

rollingFrame?.addEventListener("load", queueRollingFrameNumberSync);
queueRollingFrameNumberSync();

const projectToggle = document.getElementById("index-project-toggle");
const expandToggles = Array.from(document.querySelectorAll(".panel-expand-toggle"));
const panelFrames = Array.from(document.querySelectorAll(".panel-frame"));
const projectEmbedPanelFrames = Array.from(document.querySelectorAll(".panel-frame--project-embed"));
const frameScrolls = Array.from(document.querySelectorAll(".panel-frame-scroll"));
const frameShells = Array.from(document.querySelectorAll(".panel-frame-shell"));
const projectEmbedFrames = Array.from(document.querySelectorAll(".panel-project-embed-frame"));
const projectEmbedWheelLayers = Array.from(document.querySelectorAll(".panel-project-embed-wheel-layer"));
const aboutView = document.getElementById("about-view");
const aboutSheet = document.querySelector(".about-sheet");
const aboutWorkTiles = Array.from(document.querySelectorAll(".about-work-tile"));
const archiveDetail = document.querySelector(".archive-detail");
const panelByProject = new Map(projectPanels.map((panel) => [panel.dataset.project, panel]));
const itemByProject = new Map(indexItems.map((item) => [item.dataset.project, item]));
const PANEL_RESET_ANIMATION_MS = 420;
const HOME_RETURN_SCROLL_MS = 760;
const HOME_RETURN_OVERLAP_MS = 180;
const HOME_PROJECT_RESET_DELAY_MS = HOME_RETURN_SCROLL_MS;
const NAV_ROLL_COOLDOWN_MS = 1000;
const PARAMETERS_OPEN_STORAGE_KEY = "rolling-parameters-open-v1";
const ABOUT_DESIGN_CONTENT_HEIGHT = 772.2574462890625;
const HOME_INTRO_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*+=?<>[]{}\\/|";
const HOME_FLOAT_ASSETS = [
  "./Assets/Home/截屏2026-04-30 11.27.38 1.png",
  "./Assets/Home/截屏2026-04-30 11.27.51 1.png",
  "./Assets/Home/截屏2026-04-30 11.28.06 1.png",
  "./Assets/Home/截屏2026-04-30 11.28.15 1.png",
  "./Assets/Home/截屏2026-04-30 11.28.34 1.png",
  "./Assets/Home/截屏2026-04-30 11.29.14 1.png",
  "./Assets/Home/截屏2026-04-30 11.29.33 1.png",
  "./Assets/Home/截屏2026-06-02 10.03.47 1.png",
  "./Assets/Home/截屏2026-06-02 10.05.15 1.png",
];
const HOME_FLOAT_PROJECT_IDS = [
  "02",
  "02",
  "03",
  "04",
  "05",
  "01",
  "01",
  "05",
  "07",
];
const HOME_FLOAT_ANCHORS = [
  [7, 10],
  [76, 8],
  [12, 30],
  [78, 30],
  [5, 55],
  [84, 54],
  [14, 78],
  [60, 80],
  [88, 76],
];
const HOME_TYPE_START_DELAY = 160;
const HOME_TYPE_LETTER_DELAY = 90;
const HOME_TYPE_SCRAMBLE_DURATION = 230;
const HOME_EXIT_DELAY = 520;

let panelOffsets = [];
let visibleProjectId = "";
let selectedProjectId = "";
let expandedProjectId = "";
let isAboutViewActive = false;
let listNavigationTargetId = "";
let ticking = false;
let isHomeIntroPrepared = false;
const collapseCopyTimers = new Map();
const homeIntroScrambleTimers = new Map();
const homeIntroFlowTimers = new Set();
let homeFloatLayer = null;
let homeCursor = null;
let homeCursorX = window.innerWidth / 2;
let homeCursorY = window.innerHeight / 2;
let isHomeCursorImageHover = false;
let homeCursorTurnTimer = null;
let homeProjectResetTimer = 0;
let isHomeReturnInProgress = false;
let archiveFrameCursor = null;
let archiveFrameCursorX = window.innerWidth / 2;
let archiveFrameCursorY = window.innerHeight / 2;
let archiveFrameCursorPanel = null;
let projectEmbedScrollCursor = null;
let projectEmbedScrollCursorX = window.innerWidth / 2;
let projectEmbedScrollCursorY = window.innerHeight / 2;
let projectEmbedScrollCursorLayer = null;

function ensureProjectPanelEmbedLoaded(panel, priority = "auto") {
  const embedFrame = panel?.querySelector(".panel-project-embed-frame");
  const src = embedFrame?.dataset.src;

  if (!embedFrame || embedFrame.hasAttribute("src") || !src) {
    return false;
  }

  embedFrame.fetchPriority = priority === "high" ? "high" : "low";
  embedFrame.loading = priority === "high" ? "eager" : "lazy";
  embedFrame.src = src;
  return true;
}

function setMobileNavView(viewName) {
  if (!homeTransitionStage) {
    return;
  }

  homeTransitionStage.dataset.mobileView = viewName;
}

function syncMobileCenteredProjectCard() {
  if (!mobileProjectList || mobileProjectCards.length === 0 || !window.matchMedia("(max-width: 700px)").matches) {
    mobileProjectCards.forEach((card) => card.classList.remove("is-mobile-centered"));
    return;
  }

  const viewportCenter = window.innerHeight / 2;
  let closestCard = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  mobileProjectCards.forEach((card) => {
    const rect = card.getBoundingClientRect();

    if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
      return;
    }

    if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
      closestCard = card;
      closestDistance = 0;
      return;
    }

    const cardCenter = rect.top + rect.height / 2;
    const distance = Math.abs(cardCenter - viewportCenter);

    if (closestDistance !== 0 && distance < closestDistance) {
      closestDistance = distance;
      closestCard = card;
    }
  });

  mobileProjectCards.forEach((card) => {
    card.classList.toggle("is-mobile-centered", card === closestCard);
  });
}

function queueMobileCenteredProjectCardSync() {
  window.requestAnimationFrame(syncMobileCenteredProjectCard);
}

function syncMobileAboutWorkTileHighlight() {
  const isMobile = window.matchMedia("(max-width: 700px)").matches;

  if (!aboutSheet || aboutWorkTiles.length === 0 || !isMobile || !isAboutViewActive) {
    aboutWorkTiles.forEach((tile) => tile.classList.remove("is-mobile-scroll-highlighted"));
    return;
  }

  const sheetRect = aboutSheet.getBoundingClientRect();
  const visibleTop = Math.max(0, sheetRect.top);
  const visibleBottom = Math.min(window.innerHeight, sheetRect.bottom);
  const viewportCenter = visibleTop + (visibleBottom - visibleTop) / 2;
  let closestTile = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  aboutWorkTiles.forEach((tile) => {
    const rect = tile.getBoundingClientRect();

    if (rect.bottom <= visibleTop || rect.top >= visibleBottom) {
      return;
    }

    if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
      closestTile = tile;
      closestDistance = 0;
      return;
    }

    const tileCenter = rect.top + rect.height / 2;
    const distance = Math.abs(tileCenter - viewportCenter);

    if (closestDistance !== 0 && distance < closestDistance) {
      closestDistance = distance;
      closestTile = tile;
    }
  });

  aboutWorkTiles.forEach((tile) => {
    tile.classList.toggle("is-mobile-scroll-highlighted", tile === closestTile);
  });
}

function queueMobileAboutWorkTileHighlightSync() {
  if (mobileAboutWorkHighlightFrame) {
    return;
  }

  mobileAboutWorkHighlightFrame = window.requestAnimationFrame(() => {
    mobileAboutWorkHighlightFrame = 0;
    syncMobileAboutWorkTileHighlight();
  });
}

function getMobileProjectHeader(card) {
  return card?.querySelector(".mobile-project-card-header") || null;
}

function getMobileProjectArrow(card) {
  return card?.querySelector(".mobile-project-arrow") || null;
}

function setMobileProjectCardExpandedState(card, expanded) {
  const arrow = getMobileProjectArrow(card);
  const projectTitle = orderedArchiveProjects
    .find((project) => project.id === card?.dataset.project)
    ?.title
    .replace(/\s+/g, " ");
  const actionLabel = expanded ? "返回项目列表" : `展开项目：${projectTitle || ""}`;

  card?.classList.toggle("is-mobile-expanded", expanded);
  card?.setAttribute("aria-expanded", String(expanded));
  card?.setAttribute("aria-label", actionLabel);
  arrow?.setAttribute("aria-label", actionLabel);
}

function runMobileProjectFlip(card, firstRect, duration) {
  if (!card || !firstRect) {
    return null;
  }

  const lastRect = card.getBoundingClientRect();
  const deltaX = firstRect.left - lastRect.left;
  const deltaY = firstRect.top - lastRect.top;

  mobileProjectActiveAnimation?.cancel();

  if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
    mobileProjectActiveAnimation = null;
    return null;
  }

  card.classList.add("is-mobile-motion-target");

  const animation = card.animate(
    [
      { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
      { transform: "translate3d(0, 0, 0)" },
    ],
    {
      duration,
      easing: MOBILE_PROJECT_MOTION_EASING,
      fill: "both",
    },
  );

  mobileProjectActiveAnimation = animation;

  const clearAnimation = () => {
    if (mobileProjectActiveAnimation === animation) {
      mobileProjectActiveAnimation = null;
      card.classList.remove("is-mobile-motion-target");
    }

    animation.cancel();
  };

  animation.addEventListener("finish", clearAnimation, { once: true });
  animation.addEventListener("cancel", () => {
    if (mobileProjectActiveAnimation === animation) {
      mobileProjectActiveAnimation = null;
      card.classList.remove("is-mobile-motion-target");
    }
  }, { once: true });

  return animation;
}

function expandMobileProjectCard(card) {
  if (!card || !mobileProjectList || !archiveApp || !window.matchMedia("(max-width: 700px)").matches) {
    return;
  }

  if (mobileExpandedProjectId === card.dataset.project) {
    return;
  }

  const firstRect = card.getBoundingClientRect();

  mobileProjectRestoreScrollTop = mobileProjectList.scrollTop;
  mobileExpandedProjectId = card.dataset.project || "";
  window.clearTimeout(mobileProjectTransitionTimer);
  archiveApp.classList.remove("is-mobile-project-collapsing");
  archiveApp.classList.add("is-mobile-project-expanded", "is-mobile-project-transitioning", "is-mobile-project-expanding");

  mobileProjectCards.forEach((projectCard) => {
    const isExpandedCard = projectCard === card;

    setMobileProjectCardExpandedState(projectCard, isExpandedCard);
    projectCard.toggleAttribute("aria-hidden", !isExpandedCard);
    projectCard.classList.toggle("is-mobile-centered", isExpandedCard);
  });

  mobileProjectList.scrollTo({ top: 0, behavior: "auto" });
  runMobileProjectFlip(card, firstRect, MOBILE_PROJECT_EXPAND_DURATION);
  mobileProjectTransitionTimer = window.setTimeout(() => {
    archiveApp.classList.remove("is-mobile-project-transitioning", "is-mobile-project-expanding");
  }, MOBILE_PROJECT_EXPAND_DURATION);
}

function collapseMobileProjectCard({ restoreScroll = true } = {}) {
  if (!mobileExpandedProjectId || !mobileProjectList || !archiveApp) {
    return;
  }

  const expandedCard = mobileProjectCards.find((card) => card.dataset.project === mobileExpandedProjectId);
  const firstRect = getMobileProjectHeader(expandedCard)?.getBoundingClientRect() || expandedCard?.getBoundingClientRect();
  const targetScrollTop = mobileProjectRestoreScrollTop;

  window.clearTimeout(mobileProjectTransitionTimer);
  archiveApp.classList.remove("is-mobile-project-expanding");
  archiveApp.classList.add("is-mobile-project-transitioning", "is-mobile-project-collapsing");
  expandedCard?.classList.add("is-mobile-collapse-target");
  mobileExpandedProjectId = "";
  archiveApp.classList.remove("is-mobile-project-expanded");

  mobileProjectCards.forEach((card) => {
    setMobileProjectCardExpandedState(card, false);
    card.removeAttribute("aria-hidden");
  });

  if (restoreScroll) {
    mobileProjectList.scrollTo({ top: targetScrollTop, behavior: "auto" });
  } else {
    mobileProjectList.scrollTo({ top: mobileProjectRestoreScrollTop, behavior: "auto" });
  }

  runMobileProjectFlip(expandedCard, firstRect, MOBILE_PROJECT_COLLAPSE_DURATION);
  queueMobileCenteredProjectCardSync();

  mobileProjectTransitionTimer = window.setTimeout(() => {
    archiveApp.classList.remove("is-mobile-project-transitioning", "is-mobile-project-collapsing");
    expandedCard?.classList.remove("is-mobile-collapse-target");
  }, MOBILE_PROJECT_COLLAPSE_DURATION);
}

function triggerPrimaryNavRoll(button) {
  if (!button) {
    return;
  }

  const now = window.performance.now();
  const nextAllowedAt = Number(button.dataset.nextNavRollAt || 0);

  if (now < nextAllowedAt) {
    return;
  }

  button.dataset.nextNavRollAt = String(now + NAV_ROLL_COOLDOWN_MS);
  button.classList.add("is-nav-resetting");
  button.classList.remove("is-nav-rolling");
  void button.offsetWidth;
  button.classList.remove("is-nav-resetting");
  void button.offsetWidth;
  button.classList.add("is-nav-rolling");
}

document.querySelectorAll(".archive-primary-nav .index-link, .archive-primary-nav .index-group-toggle").forEach((button) => {
  button.addEventListener("pointerenter", () => triggerPrimaryNavRoll(button));
  button.addEventListener("focus", () => triggerPrimaryNavRoll(button));
});

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function shuffledItems(items) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }

  return nextItems;
}

function randomHomeIntroGlyph() {
  return HOME_INTRO_GLYPHS[Math.floor(Math.random() * HOME_INTRO_GLYPHS.length)];
}

function scheduleHomeIntroTimer(callback, delay) {
  const timer = window.setTimeout(() => {
    homeIntroFlowTimers.delete(timer);
    callback();
  }, delay);

  homeIntroFlowTimers.add(timer);
  return timer;
}

function clearHomeIntroFlowTimers() {
  homeIntroFlowTimers.forEach((timer) => {
    window.clearTimeout(timer);
  });
  homeIntroFlowTimers.clear();
}

function startHomeIntroScramble(letter) {
  if (homeIntroScrambleTimers.has(letter)) {
    return;
  }

  letter.classList.add("is-scrambling");
  letter.textContent = randomHomeIntroGlyph();

  const timer = window.setInterval(() => {
    letter.textContent = randomHomeIntroGlyph();
  }, 46);

  homeIntroScrambleTimers.set(letter, timer);
}

function stopHomeIntroScramble(letter) {
  const timer = homeIntroScrambleTimers.get(letter);

  if (timer) {
    window.clearInterval(timer);
    homeIntroScrambleTimers.delete(letter);
  }

  letter.classList.remove("is-scrambling");
  letter.textContent = letter.dataset.letter || "";
  letter.classList.add("is-revealed");
}

function buildHomeFloatLayer() {
  if (!homeIntro || homeFloatLayer) {
    return;
  }

  homeFloatLayer = document.createElement("div");
  homeFloatLayer.className = "home-float-layer";
  homeFloatLayer.setAttribute("aria-hidden", "true");

  HOME_FLOAT_ASSETS.forEach((assetPath, assetIndex) => {
    const item = document.createElement("div");
    const image = document.createElement("img");
    const projectId = HOME_FLOAT_PROJECT_IDS[assetIndex];
    const projectTitle = orderedArchiveProjects
      .find((project) => project.id === projectId)
      ?.title.replace(/\s+/g, " ");

    item.className = "home-float-item";
    item.dataset.project = projectId || "";
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", projectTitle ? `打开项目：${projectTitle}` : "打开项目");
    image.className = "home-float-image";
    image.src = assetPath;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.fetchPriority = "low";

    item.addEventListener("mouseenter", () => {
      homeIntro.classList.add("is-cursor-image-hover");
    });
    item.addEventListener("mouseleave", () => {
      homeIntro.classList.remove("is-cursor-image-hover");
    });
    item.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      navigateToProjectFromHome(projectId);
    });
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      navigateToProjectFromHome(projectId);
    });

    item.append(image);
    homeFloatLayer.append(item);
  });

  homeIntro.prepend(homeFloatLayer);
}

function buildHomeCursor() {
  if (!homeIntro || homeCursor) {
    return;
  }

  homeCursor = document.createElement("div");
  const cursorInner = document.createElement("div");
  const cursorArrowShell = document.createElement("div");
  const cursorArrow = document.createElement("img");

  homeCursor.className = "home-custom-cursor";
  homeCursor.setAttribute("aria-hidden", "true");
  cursorInner.className = "home-custom-cursor-inner";
  cursorArrowShell.className = "home-custom-cursor-arrow-shell";
  cursorArrow.className = "home-custom-cursor-arrow";
  cursorArrow.src = homeCursorAsset;
  cursorArrow.alt = "";
  cursorArrow.decoding = "async";

  cursorArrowShell.append(cursorArrow);
  cursorInner.append(cursorArrowShell);
  homeCursor.append(cursorInner);
  homeIntro.append(homeCursor);
}

function syncHomeCursorPosition() {
  if (!homeCursor) {
    return;
  }

  homeCursor.style.setProperty("--cursor-x", `${homeCursorX}px`);
  homeCursor.style.setProperty("--cursor-y", `${homeCursorY}px`);
}

function syncHomeCursorHoverTarget() {
  if (!homeIntro) {
    return;
  }

  const hoveredElement = document.elementFromPoint(homeCursorX, homeCursorY);
  const isLetterHover = Boolean(hoveredElement?.closest(".home-intro-letter"));
  const isTurnHover = Boolean(hoveredElement?.closest(".home-float-item"));

  homeIntro.classList.toggle("is-cursor-letter-hover", isLetterHover);

  if (isTurnHover === isHomeCursorImageHover) {
    return;
  }

  window.clearTimeout(homeCursorTurnTimer);
  homeIntro.classList.remove("is-cursor-image-hover", "is-cursor-image-unhover");

  if (isTurnHover) {
    homeIntro.classList.add("is-cursor-image-hover");
  } else {
    homeIntro.classList.add("is-cursor-image-unhover");
    homeCursorTurnTimer = window.setTimeout(() => {
      homeIntro.classList.remove("is-cursor-image-unhover");
    }, 360);
  }

  isHomeCursorImageHover = isTurnHover;
}

function buildArchiveFrameCursor() {
  if (archiveFrameCursor) {
    return;
  }

  archiveFrameCursor = document.createElement("div");
  const cursorInner = document.createElement("div");
  const cursorArrowShell = document.createElement("div");
  const cursorArrow = document.createElement("img");

  archiveFrameCursor.className = "archive-frame-cursor";
  archiveFrameCursor.setAttribute("aria-hidden", "true");
  cursorInner.className = "archive-frame-cursor-inner";
  cursorArrowShell.className = "archive-frame-cursor-arrow-shell";
  cursorArrow.className = "archive-frame-cursor-arrow";
  cursorArrow.src = homeCursorAsset;
  cursorArrow.alt = "";
  cursorArrow.decoding = "async";

  cursorArrowShell.append(cursorArrow);
  cursorInner.append(cursorArrowShell);
  archiveFrameCursor.append(cursorInner);
  document.body.append(archiveFrameCursor);
}

function syncArchiveFrameCursorPosition() {
  if (!archiveFrameCursor) {
    return;
  }

  archiveFrameCursor.style.setProperty("--cursor-x", `${archiveFrameCursorX}px`);
  archiveFrameCursor.style.setProperty("--cursor-y", `${archiveFrameCursorY}px`);
}

function syncArchiveFrameCursorPanel(panel) {
  if (archiveFrameCursorPanel === panel) {
    return;
  }

  archiveFrameCursorPanel?.classList.remove("is-frame-cursor-hover");
  archiveFrameCursorPanel = panel;
  archiveFrameCursorPanel?.classList.add("is-frame-cursor-hover");
}

function showArchiveFrameCursor(event) {
  if (!shouldShowArchiveFrameCursor()) {
    hideArchiveFrameCursor();
    return;
  }

  syncArchiveFrameCursorPanel(event.target.closest(".project-panel"));
  buildArchiveFrameCursor();

  archiveFrameCursorX = event.clientX;
  archiveFrameCursorY = event.clientY;
  syncArchiveFrameCursorPosition();

  document.body.classList.add("is-archive-frame-cursor-active");
  archiveFrameCursor.classList.remove("is-bouncing");
  void archiveFrameCursor.offsetWidth;
  archiveFrameCursor.classList.add("is-bouncing");
}

function moveArchiveFrameCursor(event) {
  archiveFrameCursorX = event.clientX;
  archiveFrameCursorY = event.clientY;
  syncArchiveFrameCursorPosition();
}

function hideArchiveFrameCursor() {
  document.body.classList.remove("is-archive-frame-cursor-active");
  archiveFrameCursor?.classList.remove("is-bouncing");
  syncArchiveFrameCursorPanel(null);
}

function shouldShowArchiveFrameCursor() {
  return archiveApp && !archiveApp.classList.contains("is-panel-expanded");
}

function isArchiveFrameCursorTarget(target) {
  return (
    shouldShowArchiveFrameCursor() &&
    target instanceof Element &&
    Boolean(target.closest(".panel-frame--project-embed"))
  );
}

function syncArchiveFrameCursorFromPointer(event) {
  if (!isArchiveFrameCursorTarget(event.target)) {
    hideArchiveFrameCursor();
    return;
  }

  if (!document.body.classList.contains("is-archive-frame-cursor-active")) {
    showArchiveFrameCursor(event);
    return;
  }

  moveArchiveFrameCursor(event);
}

function buildProjectEmbedScrollCursor() {
  if (projectEmbedScrollCursor) {
    return;
  }

  projectEmbedScrollCursor = document.createElement("div");
  const cursorInner = document.createElement("div");
  const cursorArrowShell = document.createElement("div");
  const cursorArrow = document.createElement("img");

  projectEmbedScrollCursor.className = "project-embed-scroll-cursor";
  projectEmbedScrollCursor.setAttribute("aria-hidden", "true");
  cursorInner.className = "project-embed-scroll-cursor-inner";
  cursorArrowShell.className = "project-embed-scroll-cursor-arrow-shell";
  cursorArrow.className = "project-embed-scroll-cursor-arrow";
  cursorArrow.src = homeCursorAsset;
  cursorArrow.alt = "";
  cursorArrow.decoding = "async";

  cursorArrowShell.append(cursorArrow);
  cursorInner.append(cursorArrowShell);
  projectEmbedScrollCursor.append(cursorInner);
  document.body.append(projectEmbedScrollCursor);
}

function syncProjectEmbedScrollCursorPosition() {
  if (!projectEmbedScrollCursor) {
    return;
  }

  projectEmbedScrollCursor.style.setProperty("--cursor-x", `${projectEmbedScrollCursorX}px`);
  projectEmbedScrollCursor.style.setProperty("--cursor-y", `${projectEmbedScrollCursorY}px`);
}

function getProjectEmbedScrollState(wheelLayer) {
  const parentPanel = wheelLayer?.closest(".project-panel");
  const embedFrame = parentPanel?.querySelector(".panel-project-embed-frame");

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

function shouldShowProjectEmbedScrollCursor(target) {
  if (!(target instanceof Element)) {
    return false;
  }

  const wheelLayer = target.closest(".panel-project-embed-wheel-layer");

  if (!wheelLayer?.closest(".project-panel.is-expanded")) {
    return false;
  }

  return !getProjectEmbedScrollState(wheelLayer).isAtBottom;
}

function showProjectEmbedScrollCursor(event) {
  projectEmbedScrollCursorX = event.clientX;
  projectEmbedScrollCursorY = event.clientY;
  syncProjectEmbedScrollCursorPosition();

  refreshProjectEmbedScrollCursor(event.target.closest(".panel-project-embed-wheel-layer"));
}

function moveProjectEmbedScrollCursor(event) {
  projectEmbedScrollCursorX = event.clientX;
  projectEmbedScrollCursorY = event.clientY;
  syncProjectEmbedScrollCursorPosition();
  refreshProjectEmbedScrollCursor(event.target.closest(".panel-project-embed-wheel-layer"));
}

function hideProjectEmbedScrollCursor() {
  document.body.classList.remove("is-project-embed-scroll-cursor-active");
  projectEmbedScrollCursorLayer = null;
}

function blurPanelInteractionFocus(panel) {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement && panel?.contains(activeElement)) {
    activeElement.blur();
  }
}

function refreshProjectEmbedScrollCursor(wheelLayer = projectEmbedScrollCursorLayer) {
  if (
    !wheelLayer?.closest(".project-panel.is-expanded") ||
    getProjectEmbedScrollState(wheelLayer).isAtBottom
  ) {
    hideProjectEmbedScrollCursor();
    return;
  }

  buildProjectEmbedScrollCursor();
  projectEmbedScrollCursorLayer = wheelLayer;
  syncProjectEmbedScrollCursorPosition();
  document.body.classList.add("is-project-embed-scroll-cursor-active");
}

function revealHomeFloatItems() {
  if (!homeFloatLayer) {
    return;
  }

  Array.from(homeFloatLayer.children).forEach((item, index) => {
    item.classList.remove("is-loaded");

    window.setTimeout(
      () => {
        item.classList.add("is-loaded");
      },
      160 + index * 85 + randomBetween(0, 90),
    );
  });
}

function layoutHomeFloatItems() {
  if (!homeFloatLayer) {
    return;
  }

  const anchors = shuffledItems(HOME_FLOAT_ANCHORS);
  const items = Array.from(homeFloatLayer.children);
  const placedAnchors = [];
  const minAnchorDistance = 19;

  items.forEach((item, index) => {
    const [anchorX, anchorY] = anchors[index % anchors.length];
    let left = anchorX;
    let top = anchorY;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidateLeft = Math.max(0, Math.min(88, anchorX + randomBetween(-5, 5)));
      const candidateTop = Math.max(1, Math.min(86, anchorY + randomBetween(-10, 10)));
      const hasEnoughSpace = placedAnchors.every((placedAnchor) => {
        const deltaX = candidateLeft - placedAnchor.left;
        const deltaY = candidateTop - placedAnchor.top;

        return Math.hypot(deltaX, deltaY) >= minAnchorDistance;
      });

      left = candidateLeft;
      top = candidateTop;

      if (hasEnoughSpace) {
        break;
      }
    }

    placedAnchors.push({ left, top });

    item.style.setProperty("--float-left", `${left}%`);
    item.style.setProperty("--float-top", `${top}%`);
    item.style.setProperty(
      "--float-width",
      `clamp(${randomBetween(81, 114).toFixed(1)}px, ${randomBetween(10.8, 16.2).toFixed(2)}vw, ${randomBetween(240, 330).toFixed(1)}px)`,
    );
    item.style.setProperty("--float-x", `${randomBetween(-18, 18)}px`);
    item.style.setProperty("--float-y", `${randomBetween(-16, 16)}px`);
    item.style.setProperty("--float-rotate-start", `${randomBetween(-3, 3)}deg`);
    item.style.setProperty("--float-rotate-end", `${randomBetween(-4, 4)}deg`);
    item.style.setProperty("--float-duration", `${randomBetween(9, 16)}s`);
    item.style.setProperty("--float-delay", `${randomBetween(-10, 0)}s`);
  });

  revealHomeFloatItems();
}

function finishHomeIntro({ immediate = false, playProjectDirectory = true } = {}) {
  if (!homeIntro) {
    return;
  }

  clearScheduledHomeProjectReset();
  clearHomeIntroFlowTimers();
  homeIntro.classList.add("is-exiting");
  setMobileNavView("projects");
  queueMobileCenteredProjectCardSync();
  const shouldPlayProjectDirectoryEnter = playProjectDirectory && prepareProjectDirectoryEnter();

  homeTransitionStage?.classList.add("is-index-visible");

  if (shouldPlayProjectDirectoryEnter) {
    window.setTimeout(() => {
      window.requestAnimationFrame(() => startProjectDirectoryEnter());
    }, PROJECT_ENTER_START_DELAY_MS);
  }

  scheduleHomeIntroTimer(
    () => {
      homeIntro.hidden = true;
      homeIntro.inert = true;
      archiveApp?.removeAttribute("aria-hidden");

      if (archiveApp) {
        archiveApp.inert = false;
      }
    },
    immediate ? 0 : 760,
  );
}

function clearScheduledHomeProjectReset() {
  window.clearTimeout(homeProjectResetTimer);
  homeProjectResetTimer = 0;
  isHomeReturnInProgress = false;
}

function resetProjectStateBehindHome(projectId) {
  if (!projectId || !panelByProject.has(projectId)) {
    return;
  }

  listNavigationTargetId = "";
  syncSelectedProject(projectId);
  syncVisibleProject(projectId);
  selectRollingProject(projectId);
}

function scheduleProjectStateResetBehindHome(projectId) {
  clearScheduledHomeProjectReset();
  isHomeReturnInProgress = true;

  homeProjectResetTimer = window.setTimeout(() => {
    homeProjectResetTimer = 0;
    isHomeReturnInProgress = false;

    if (homeTransitionStage?.classList.contains("is-index-visible") || isAboutViewActive) {
      return;
    }

    resetProjectStateBehindHome(projectId);
  }, HOME_PROJECT_RESET_DELAY_MS);
}

function prepareHomeIntro() {
  if (!homeIntro || homeIntroLetters.length === 0) {
    return false;
  }

  if (isHomeIntroPrepared) {
    return true;
  }

  buildHomeFloatLayer();
  buildHomeCursor();
  syncHomeCursorPosition();

  homeIntroLetters.forEach((letter) => {
    const { width } = letter.getBoundingClientRect();

    if (letter.dataset.letter === "I") {
      const logo = letter.closest(".home-intro-logo");
      const widthReference = logo?.querySelector('.home-intro-letter[data-letter="S"]');
      const scrambleWidth = widthReference?.getBoundingClientRect().width || width;

      letter.style.removeProperty("--letter-width");
      letter.style.setProperty("--i-scramble-width", `${scrambleWidth}px`);
    } else {
      letter.style.setProperty("--letter-width", `${width}px`);
    }

    letter.textContent = "";
    letter.addEventListener("mouseenter", () => startHomeIntroScramble(letter));
    letter.addEventListener("mouseleave", () => stopHomeIntroScramble(letter));
    letter.addEventListener("focus", () => startHomeIntroScramble(letter));
    letter.addEventListener("blur", () => stopHomeIntroScramble(letter));
  });

  isHomeIntroPrepared = true;
  return true;
}

function playHomeIntro({ autoExit = true, immediate = false } = {}) {
  if (!prepareHomeIntro()) {
    return;
  }

  clearHomeIntroFlowTimers();
  layoutHomeFloatItems();

  homeIntro.hidden = false;
  homeIntro.inert = false;
  window.clearTimeout(homeCursorTurnTimer);
  isHomeCursorImageHover = false;
  homeIntro.classList.remove(
    "is-complete",
    "is-exiting",
    "is-cursor-image-hover",
    "is-cursor-image-unhover",
    "is-cursor-letter-hover",
  );
  homeIntro.classList.add("is-intro-ready");
  homeTransitionStage?.classList.remove("is-index-visible");
  setMobileNavView("home");

  if (archiveApp) {
    archiveApp.inert = true;
    archiveApp.setAttribute("aria-hidden", "true");
  }

  homeIntroLetters.forEach((letter) => {
    const timer = homeIntroScrambleTimers.get(letter);

    if (timer) {
      window.clearInterval(timer);
      homeIntroScrambleTimers.delete(letter);
    }

    letter.classList.remove("is-revealed", "is-scrambling");
    letter.textContent = "";
  });

  if (immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    homeIntroLetters.forEach((letter) => stopHomeIntroScramble(letter));
    homeIntro.classList.add("is-complete");
    if (autoExit) {
      finishHomeIntro({ immediate: true });
    }
    return;
  }

  homeIntroLetters.forEach((letter, index) => {
    scheduleHomeIntroTimer(() => {
      startHomeIntroScramble(letter);

      scheduleHomeIntroTimer(() => {
        stopHomeIntroScramble(letter);
      }, HOME_TYPE_SCRAMBLE_DURATION);
    }, HOME_TYPE_START_DELAY + index * HOME_TYPE_LETTER_DELAY);
  });

  const introDuration =
    HOME_TYPE_START_DELAY +
    (homeIntroLetters.length - 1) * HOME_TYPE_LETTER_DELAY +
    HOME_TYPE_SCRAMBLE_DURATION;

  scheduleHomeIntroTimer(() => {
    homeIntro.classList.add("is-complete");
  }, introDuration);

  if (autoExit) {
    scheduleHomeIntroTimer(() => {
      finishHomeIntro();
    }, introDuration + HOME_EXIT_DELAY);
  }
}

function initializeHomeIntro() {
  playHomeIntro();
}

homeIntro?.addEventListener("mousemove", (event) => {
  homeCursorX = event.clientX;
  homeCursorY = event.clientY;
  homeIntro.classList.add("is-cursor-visible");
  syncHomeCursorPosition();
  syncHomeCursorHoverTarget();
});

homeIntro?.addEventListener("mouseenter", () => {
  homeIntro.classList.add("is-cursor-visible");
});

homeIntro?.addEventListener("mouseleave", () => {
  window.clearTimeout(homeCursorTurnTimer);
  isHomeCursorImageHover = false;
  homeIntro.classList.remove(
    "is-cursor-visible",
    "is-cursor-image-hover",
    "is-cursor-image-unhover",
    "is-cursor-letter-hover",
  );
});

homeIntro?.addEventListener("click", () => {
  if (!homeIntro.classList.contains("is-complete")) {
    return;
  }

  finishHomeIntro();
});

async function navigateToProjectFromHome(projectId) {
  if (!projectId || !panelByProject.has(projectId)) {
    return;
  }

  const targetPanel = panelByProject.get(projectId);
  const targetMobileCard = mobileProjectCards.find((card) => card.dataset.project === projectId);
  const isMobileProjectLayout = window.matchMedia("(max-width: 700px)").matches;
  const shouldDeferAboutExit = isAboutViewActive;
  const releaseAboutView = () => {
    if (shouldDeferAboutExit && isAboutViewActive) {
      setAboutViewActive(false, { deferHide: true });
    }
  };

  finishHomeIntro({ immediate: true });
  setMobileNavView("projects");
  listNavigationTargetId = "";
  syncSelectedProject(projectId);
  syncVisibleProject(projectId);

  if (isMobileProjectLayout) {
    await syncExpandedProject("");
    collapseMobileProjectCard({ restoreScroll: false });
    window.requestAnimationFrame(() => {
      if (targetMobileCard) {
        expandMobileProjectCard(targetMobileCard);
      }

      window.setTimeout(releaseAboutView, ABOUT_PROJECT_MOBILE_EXIT_DELAY);
    });
    return;
  }

  collapseMobileProjectCard({ restoreScroll: false });
  await syncExpandedProject("");

  if (selectRollingProject(projectId)) {
    releaseAboutView();
    return;
  }

  if (targetPanel && detailScroll) {
    refreshMeasurements();
    await animateDetailScrollToPanel(targetPanel);
  }

  releaseAboutView();
}

function syncSelectedProject(selectedId) {
  if (selectedProjectId === selectedId) {
    return;
  }

  itemByProject.get(selectedProjectId)?.classList.remove("is-active");
  itemByProject.get(selectedId)?.classList.add("is-active");

  selectedProjectId = selectedId;
}

function syncVisibleProject(visibleId) {
  if (visibleProjectId === visibleId) {
    return;
  }

  panelByProject.get(visibleProjectId)?.classList.remove("is-active");
  panelByProject.get(visibleId)?.classList.add("is-active");

  if (!listNavigationTargetId || listNavigationTargetId === visibleId) {
    listNavigationTargetId = "";
    syncSelectedProject(visibleId);
  }

  if (currentProject && !isAboutViewActive) {
    currentProject.textContent = visibleId;
  }

  visibleProjectId = visibleId;
}

function setAboutViewActive(active, { deferHide = false, targetView = "projects" } = {}) {
  if (isAboutViewActive === active) {
    return;
  }

  isAboutViewActive = active;
  archiveApp?.classList.toggle("is-about-active", active);
  aboutButton?.classList.toggle("is-active", active);
  aboutButton?.setAttribute("aria-pressed", String(active));

  if (active) {
    setMobileNavView("about");
    aboutView?.removeAttribute("hidden");
    aboutView?.removeAttribute("inert");
    const shouldPlayAboutPanelsEnter = prepareAboutPanelsEnter();
    homeTransitionStage?.classList.remove("is-about-leaving");
    homeTransitionStage?.classList.add("is-index-visible", "is-about-visible");
    if (archiveApp) {
      archiveApp.inert = true;
    }
    window.requestAnimationFrame(() => {
      syncAboutSheetScale();
      syncAboutWorkTileArrows();
      queueMobileAboutWorkTileHighlightSync();
      if (shouldPlayAboutPanelsEnter) {
        window.setTimeout(() => {
          window.requestAnimationFrame(() => startAboutPanelsEnter());
        }, ABOUT_PANELS_ENTER_START_DELAY_MS);
      }
    });
  } else {
    clearAboutPanelsEnter();
    setMobileNavView(targetView === "home" ? "home" : "projects");
    if (deferHide) {
      homeTransitionStage?.classList.add("is-about-leaving");
    }
    homeTransitionStage?.classList.remove("is-about-visible");
    homeTransitionStage?.classList.toggle("is-index-visible", targetView !== "home");
    if (archiveApp) {
      archiveApp.inert = false;
    }

    aboutWorkTiles.forEach((tile) => tile.classList.remove("is-mobile-scroll-highlighted"));

    if (deferHide) {
      window.setTimeout(() => {
        if (!isAboutViewActive) {
          aboutView?.setAttribute("hidden", "");
          aboutView?.setAttribute("inert", "");
          homeTransitionStage?.classList.remove("is-about-leaving");
        }
      }, 760);
    } else {
      aboutView?.setAttribute("hidden", "");
      aboutView?.setAttribute("inert", "");
      homeTransitionStage?.classList.remove("is-about-leaving");
    }
  }

  if (currentProject) {
    currentProject.textContent = active ? "ABOUT" : visibleProjectId || selectedProjectId || "01";
  }

  if (active) {
    hideArchiveFrameCursor();
    hideProjectEmbedScrollCursor();
  }
}

function deferPanelCopyUntilCollapseEnds(panel) {
  if (!panel) {
    return;
  }

  const existingTimer = collapseCopyTimers.get(panel);

  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  panel.classList.add("is-copy-deferred");

  const timer = window.setTimeout(() => {
    panel.classList.remove("is-copy-deferred");
    collapseCopyTimers.delete(panel);
  }, 400);

  collapseCopyTimers.set(panel, timer);
}

function cancelDeferredPanelCopy(panel) {
  const existingTimer = collapseCopyTimers.get(panel);

  if (existingTimer) {
    window.clearTimeout(existingTimer);
    collapseCopyTimers.delete(panel);
  }

  panel?.classList.remove("is-copy-deferred");
}

function resetEmbeddedProjectScroll(panel) {
  const embedFrame = panel?.querySelector(".panel-project-embed-frame");

  if (!embedFrame?.contentWindow) {
    return false;
  }

  try {
    embedFrame.contentWindow.postMessage(
      {
        type: "project-scroll-to-top",
      },
      "*",
    );

    if (typeof embedFrame.contentWindow.projectViewport?.scrollToTop === "function") {
      embedFrame.contentWindow.projectViewport.scrollToTop();
    } else {
      embedFrame.contentWindow.scrollTo({ top: 0, behavior: "auto" });
    }

    return true;
  } catch (error) {
    return false;
  }
}

function resetPanelContentScroll(panel) {
  if (resetEmbeddedProjectScroll(panel)) {
    return;
  }

  panel?.querySelector(".panel-frame-scroll")?.scrollTo({ top: 0, behavior: "auto" });
}

function animateElementScrollToTop(element, duration = PANEL_RESET_ANIMATION_MS) {
  if (!element) {
    return Promise.resolve(false);
  }

  const start = element.scrollTop;

  if (start <= 1) {
    element.scrollTo({ top: 0, behavior: "auto" });
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const startTime = window.performance.now();

    const tick = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      element.scrollTop = start * (1 - eased);

      if (progress < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      element.scrollTop = 0;
      resolve(true);
    };

    window.requestAnimationFrame(tick);
  });
}

function animateElementScrollTo(element, target, duration = PANEL_RESET_ANIMATION_MS) {
  if (!element) {
    return Promise.resolve(false);
  }

  const start = element.scrollTop;
  const maxTarget = Math.max(0, element.scrollHeight - element.clientHeight);
  const nextTarget = Math.max(0, Math.min(target, maxTarget));
  const distance = nextTarget - start;

  if (Math.abs(distance) <= 1) {
    element.scrollTo({ top: nextTarget, behavior: "auto" });
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const startTime = window.performance.now();

    const tick = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      element.scrollTop = start + distance * eased;

      if (progress < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      element.scrollTop = nextTarget;
      resolve(true);
    };

    window.requestAnimationFrame(tick);
  });
}

function animateDetailScrollToPanel(panel, duration = PANEL_RESET_ANIMATION_MS) {
  if (!detailScroll || !panel) {
    return Promise.resolve(false);
  }

  const start = detailScroll.scrollTop;
  const target = Math.max(0, panel.offsetTop);
  const distance = target - start;

  if (Math.abs(distance) <= 1) {
    detailScroll.scrollTo({ top: target, behavior: "auto" });
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const startTime = window.performance.now();

    const tick = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      detailScroll.scrollTop = start + distance * eased;

      if (progress < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      detailScroll.scrollTop = target;
      resolve(true);
    };

    window.requestAnimationFrame(tick);
  });
}

async function animateEmbeddedProjectScrollToTop(panel, duration = PANEL_RESET_ANIMATION_MS) {
  const embedFrame = panel?.querySelector(".panel-project-embed-frame");

  if (!embedFrame?.contentWindow) {
    return false;
  }

  try {
    if (typeof embedFrame.contentWindow.projectViewport?.animateToTop === "function") {
      await embedFrame.contentWindow.projectViewport.animateToTop(duration);
      return true;
    }

    embedFrame.contentWindow.postMessage(
      {
        type: "project-scroll-to-top",
        behavior: "smooth",
        duration,
      },
      "*",
    );

    await new Promise((resolve) => {
      window.setTimeout(resolve, duration);
    });

    return true;
  } catch (error) {
    return false;
  }
}

async function animatePanelContentReset(panel, duration = PANEL_RESET_ANIMATION_MS) {
  if (await animateEmbeddedProjectScrollToTop(panel, duration)) {
    return true;
  }

  return animateElementScrollToTop(panel?.querySelector(".panel-frame-scroll"), duration);
}

function schedulePanelContentReset(panel) {
  if (!panel) {
    return;
  }

  window.setTimeout(() => resetPanelContentScroll(panel), PANEL_RESET_ANIMATION_MS + 40);
}

function postScrollToEmbeddedProject(panel, deltaY) {
  const embedFrame = panel?.querySelector(".panel-project-embed-frame");

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

async function syncExpandedProject(projectId = "") {
  if (expandedProjectId === projectId) {
    return;
  }

  hideArchiveFrameCursor();
  hideProjectEmbedScrollCursor();

  if (expandedProjectId) {
    const previousPanel = panelByProject.get(expandedProjectId);

    if (!projectId) {
      animatePanelContentReset(previousPanel);
    }

    previousPanel?.classList.remove("is-expanded");
    previousPanel?.querySelector(".panel-expand-toggle")?.setAttribute("aria-expanded", "false");
    previousPanel?.querySelector(".panel-side-copy")?.setAttribute("aria-hidden", "true");
    if (!projectId) {
      schedulePanelContentReset(previousPanel);
      deferPanelCopyUntilCollapseEnds(previousPanel);
      blurPanelInteractionFocus(previousPanel);
    }
  }

  expandedProjectId = projectId;

  if (expandedProjectId) {
    const nextPanel = panelByProject.get(expandedProjectId);
    ensureProjectPanelEmbedLoaded(nextPanel, "high");
    cancelDeferredPanelCopy(nextPanel);
    nextPanel?.classList.add("is-expanded");
    nextPanel?.querySelector(".panel-expand-toggle")?.setAttribute("aria-expanded", "true");
    nextPanel?.querySelector(".panel-side-copy")?.setAttribute("aria-hidden", "false");
    resetPanelContentScroll(nextPanel);
    nextPanel?.querySelector(".panel-frame-scroll")?.focus();
  }

  archiveApp?.classList.toggle("is-panel-expanded", Boolean(expandedProjectId));
  window.setTimeout(refreshMeasurements, 460);
}

function measureProjectOffsets() {
  panelOffsets = projectPanels.map((panel) => ({
    id: panel.dataset.project,
    top: panel.offsetTop,
  }));
}

function getRollingFrameActiveProjectId() {
  const frameDocument = rollingFrame?.contentDocument;

  return frameDocument?.querySelector(".rolling-project.is-active")?.dataset.project || "";
}

function updateActiveProject() {
  if (isHomeReturnInProgress || isAboutViewActive || !detailScroll || projectPanels.length === 0) {
    return;
  }

  if (archiveDetail?.classList.contains("archive-detail--rolling")) {
    const activeId = getRollingFrameActiveProjectId()
      || selectedProjectId
      || orderedArchiveProjects[0]?.id
      || "";

    if (activeId) {
      syncVisibleProject(activeId);
    }
    return;
  }

  if (expandedProjectId) {
    syncVisibleProject(expandedProjectId);
    return;
  }

  const scrollTop = detailScroll.scrollTop;
  let activeId = panelOffsets[0]?.id || projectPanels[0].dataset.project;

  for (let index = panelOffsets.length - 1; index >= 0; index -= 1) {
    if (panelOffsets[index].top <= scrollTop + 24) {
      activeId = panelOffsets[index].id;
      break;
    }
  }

  syncVisibleProject(activeId);
}

function requestActiveUpdate() {
  if (ticking) {
    return;
  }

  ticking = true;

  window.requestAnimationFrame(() => {
    updateActiveProject();
    ticking = false;
  });
}

function refreshMeasurements() {
  measureProjectOffsets();
  requestActiveUpdate();
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

function getParametersOpenFallback() {
  const storedValue = window.localStorage.getItem(PARAMETERS_OPEN_STORAGE_KEY);

  if (storedValue === "true" || storedValue === "false") {
    return storedValue === "true";
  }

  return true;
}

function getRollingFrameParametersOpen() {
  const frameWindow = getRollingFrameWindow();

  if (typeof frameWindow?.getRollingParametersOpen === "function") {
    return frameWindow.getRollingParametersOpen();
  }

  return getParametersOpenFallback();
}

function syncParametersToggle() {
  if (!parametersToggle) {
    return;
  }

  const parametersOpen = getRollingFrameParametersOpen();

  parametersToggle.setAttribute("aria-pressed", String(parametersOpen));
  parametersToggle.setAttribute("aria-expanded", String(parametersOpen));
}

function getRollingFrameWindow() {
  try {
    return rollingFrame?.contentWindow || null;
  } catch (error) {
    return null;
  }
}

function getRollingFrameDocument() {
  try {
    return rollingFrame?.contentDocument || getRollingFrameWindow()?.document || null;
  } catch (error) {
    return null;
  }
}

function syncRollingFrameDebugState() {
  const frameWindow = getRollingFrameWindow();
  const frameDocument = getRollingFrameDocument();

  if (!frameDocument?.body) {
    return;
  }

  const outlinesActive = document.body.classList.contains("debug-outlines");
  const labelsActive = document.body.classList.contains("debug-labels");

  frameDocument.body.classList.toggle("debug-outlines", outlinesActive);
  frameDocument.body.classList.toggle("debug-labels", labelsActive);

  if (labelsActive && typeof frameWindow?.applyDebugLabels === "function") {
    frameWindow.applyDebugLabels();
  }

  frameDocument.getElementById("debug-toggle")?.setAttribute("aria-pressed", String(outlinesActive));
  frameDocument.getElementById("label-toggle")?.setAttribute("aria-pressed", String(labelsActive));
}

function setParametersOpen(active) {
  const parametersOpen = Boolean(active);
  const frameWindow = getRollingFrameWindow();

  window.localStorage.setItem(PARAMETERS_OPEN_STORAGE_KEY, String(parametersOpen));

  if (typeof frameWindow?.setRollingParametersOpen === "function") {
    frameWindow.setRollingParametersOpen(parametersOpen);
  }

  syncParametersToggle();
}

function setDebugOutlinesActive(active) {
  document.body.classList.toggle("debug-outlines", active);
  syncDebugToggle();
  syncRollingFrameDebugState();
}

function setDebugLabelsActive(active) {
  if (active) {
    applyDebugLabels();
  }

  document.body.classList.toggle("debug-labels", active);
  syncDebugLabelOverlay();
  syncLabelToggle();
  syncRollingFrameDebugState();
}

function syncRollingDetailState(active, projectId = "") {
  archiveApp?.classList.toggle("is-rolling-detail-expanded", active);

  if (active && projectId) {
    syncSelectedProject(projectId);
    syncVisibleProject(projectId);
  }
}

function selectRollingProject(projectId) {
  const frameWindow = getRollingFrameWindow();

  if (!frameWindow) {
    return false;
  }

  frameWindow.postMessage(
    {
      type: "rolling-select-project",
      projectId,
    },
    "*",
  );
  return true;
}

function bindRollingFrameDebugControls() {
  const frameDocument = getRollingFrameDocument();

  if (!frameDocument?.body || frameDocument.body.dataset.parentDebugBound === "true") {
    syncRollingFrameDebugState();
    syncParametersToggle();
    return;
  }

  frameDocument.body.dataset.parentDebugBound = "true";

  frameDocument.getElementById("debug-toggle")?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      setDebugOutlinesActive(!document.body.classList.contains("debug-outlines"));
    },
    true,
  );

  frameDocument.getElementById("label-toggle")?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      setDebugLabelsActive(!document.body.classList.contains("debug-labels"));
    },
    true,
  );

  frameDocument.getElementById("rolling-parameters-toggle")?.addEventListener(
    "click",
    () => {
      window.requestAnimationFrame(syncParametersToggle);
    },
    true,
  );

  syncRollingFrameDebugState();
  syncParametersToggle();
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
    "[data-debug-label], main, aside, section, header, nav, article, div, ol, li, figure, button",
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

function syncExpandedFrameWheel(event) {
  const frameLayer = event.currentTarget;
  const parentPanel = frameLayer.closest(".project-panel");
  const frameScroll = parentPanel?.querySelector(".panel-frame-scroll");

  if (!parentPanel?.classList.contains("is-expanded") || !frameScroll) {
    return;
  }

  if (parentPanel.querySelector(".panel-project-embed-frame")) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  frameScroll.scrollTop += event.deltaY;
}

indexItems.forEach((item) => {
  item.tabIndex = 0;

  const targetPanel = projectPanels.find((panel) => panel.dataset.project === item.dataset.project);

  const scrollToPanel = () => {
    const targetProjectId = item.dataset.project;

    setAboutViewActive(false);
    listNavigationTargetId = targetProjectId === visibleProjectId ? "" : targetProjectId;
    syncSelectedProject(targetProjectId);

    if (selectRollingProject(targetProjectId)) {
      return;
    }

    if (targetPanel && detailScroll) {
      refreshMeasurements();
      const targetTop = (
        targetPanel.getBoundingClientRect().top -
        detailScroll.getBoundingClientRect().top +
        detailScroll.scrollTop
      );

      detailScroll?.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
      return;
    }

    syncVisibleProject(targetProjectId);
  };

  item.addEventListener("click", scrollToPanel);
  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      scrollToPanel();
    }
  });
});

mobileProjectCards.forEach((card) => {
  const arrow = getMobileProjectArrow(card);

  card.addEventListener("click", () => {
    if (mobileExpandedProjectId === card.dataset.project) {
      return;
    }

    expandMobileProjectCard(card);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    if (event.target.closest(".mobile-project-arrow")) {
      return;
    }

    event.preventDefault();

    if (mobileExpandedProjectId === card.dataset.project) {
      return;
    }

    expandMobileProjectCard(card);
  });

  arrow?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (mobileExpandedProjectId === card.dataset.project) {
      collapseMobileProjectCard();
      return;
    }

    expandMobileProjectCard(card);
  });
});

detailScroll?.addEventListener("scroll", requestActiveUpdate, { passive: true });
mobileProjectList?.addEventListener("scroll", queueMobileCenteredProjectCardSync, { passive: true });
aboutSheet?.addEventListener("scroll", queueMobileAboutWorkTileHighlightSync, { passive: true });
document.addEventListener("pointermove", syncArchiveFrameCursorFromPointer, { passive: true });
window.addEventListener("resize", refreshMeasurements);
window.addEventListener("resize", syncAboutSheetScale);
window.addEventListener("resize", syncAboutWorkTileArrows);
window.addEventListener("resize", queueMobileAboutWorkTileHighlightSync);
window.addEventListener("resize", () => {
  if (!window.matchMedia("(max-width: 700px)").matches) {
    collapseMobileProjectCard({ restoreScroll: false });
  }

  queueMobileCenteredProjectCardSync();
});
window.addEventListener("load", refreshMeasurements);
window.addEventListener("load", syncAboutSheetScale);
window.addEventListener("load", syncAboutWorkTileArrows);
window.addEventListener("load", queueMobileCenteredProjectCardSync);
window.addEventListener("load", queueMobileAboutWorkTileHighlightSync);
window.addEventListener("blur", () => {
  hideArchiveFrameCursor();
  hideProjectEmbedScrollCursor();
});

async function showHomeIntroFromNav() {
  const firstProjectId = projectPanels[0]?.dataset.project || "01";
  let hasStartedHome = false;
  isHomeReturnInProgress = true;

  const startHomeReturn = () => {
    if (hasStartedHome) {
      return;
    }

    hasStartedHome = true;
    setMobileNavView("home");
    playHomeIntro({ autoExit: false });
    scheduleProjectStateResetBehindHome(firstProjectId);
  };

  await syncExpandedProject("");
  collapseMobileProjectCard({ restoreScroll: false });

  if (isAboutViewActive) {
    startHomeReturn();
    setAboutViewActive(false, { deferHide: true, targetView: "home" });
    return;
  }

  if (detailScroll && detailScroll.scrollTop > 1) {
    const transitionLeadTime = Math.max(0, HOME_RETURN_SCROLL_MS - HOME_RETURN_OVERLAP_MS);
    const homeReturnTimer = window.setTimeout(startHomeReturn, transitionLeadTime);

    await animateElementScrollToTop(detailScroll, HOME_RETURN_SCROLL_MS);
    window.clearTimeout(homeReturnTimer);
  }

  startHomeReturn();
}

async function showProjectsFromNav() {
  const isAlreadyShowingProjects = !isAboutViewActive && homeTransitionStage?.classList.contains("is-index-visible");

  setMobileNavView("projects");
  setProjectDirectoryExpanded();

  if (isAlreadyShowingProjects) {
    await syncExpandedProject("");
    collapseMobileProjectCard();
    queueMobileCenteredProjectCardSync();
    requestActiveUpdate();
    return;
  }

  await syncExpandedProject("");
  collapseMobileProjectCard();

  if (isAboutViewActive) {
    setAboutViewActive(false, { deferHide: true });
  }

  finishHomeIntro();
  queueMobileCenteredProjectCardSync();
  requestActiveUpdate();
}

async function showAboutFromNav() {
  setMobileNavView("about");
  await syncExpandedProject("");
  collapseMobileProjectCard({ restoreScroll: false });
  finishHomeIntro({ playProjectDirectory: false });

  if (detailScroll) {
    detailScroll.scrollTo({ top: 0, behavior: "auto" });
  }

  setAboutViewActive(true);
}

homeButton?.addEventListener("click", showHomeIntroFromNav);
homeTopLogo?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  showHomeIntroFromNav();
});

aboutButton?.addEventListener("click", showAboutFromNav);
projectToggle?.addEventListener("click", showProjectsFromNav);

homeNavButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const action = button.dataset.homeAction;

    if (action === "home") {
      showHomeIntroFromNav();
    } else if (action === "projects") {
      showProjectsFromNav();
    } else if (action === "about") {
      showAboutFromNav();
    }
  });
});

setProjectDirectoryExpanded();

debugToggle?.addEventListener("click", () => {
  setDebugOutlinesActive(!document.body.classList.contains("debug-outlines"));
});

labelToggle?.addEventListener("click", () => {
  setDebugLabelsActive(!document.body.classList.contains("debug-labels"));
});

rollingFrame?.addEventListener("load", bindRollingFrameDebugControls);

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) {
    return;
  }

  const message = event.data;

  if (!message) {
    return;
  }

  if (message.type === "rolling-active-project") {
    const projectId = String(message.projectId || "");

    if (projectId) {
      syncVisibleProject(projectId);
    }
    return;
  }

  if (message.type === "rolling-detail-state") {
    syncRollingDetailState(Boolean(message.active), String(message.projectId || ""));
  }
});

expandToggles.forEach((toggle) => {
  const parentPanel = toggle.closest(".project-panel");

  if (!parentPanel) {
    return;
  }

  toggle.addEventListener("click", async () => {
    const projectId = parentPanel.dataset.project;
    const nextExpandedId = expandedProjectId === projectId ? "" : projectId;
    const isCollapsingCurrentProject = !nextExpandedId;

    setAboutViewActive(false);
    listNavigationTargetId = "";
    syncSelectedProject(projectId);
    syncVisibleProject(projectId);

    if (nextExpandedId) {
      await animateDetailScrollToPanel(parentPanel);
    }

    await syncExpandedProject(nextExpandedId);

    if (isCollapsingCurrentProject) {
      window.requestAnimationFrame(() => {
        parentPanel.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
      });
    }
  });
});

async function expandPanelFromOverview(parentPanel) {
  if (!parentPanel || archiveApp?.classList.contains("is-panel-expanded")) {
    return;
  }

  const projectId = parentPanel.dataset.project;

  setAboutViewActive(false);
  listNavigationTargetId = "";
  syncSelectedProject(projectId);
  syncVisibleProject(projectId);
  await animateDetailScrollToPanel(parentPanel);
  await syncExpandedProject(projectId);
}

frameScrolls.forEach((frameScroll) => {
  frameScroll.tabIndex = -1;
  frameScroll.addEventListener("wheel", syncExpandedFrameWheel, { passive: false });
});

panelFrames.forEach((panelFrame) => {
  panelFrame.addEventListener("wheel", syncExpandedFrameWheel, { passive: false });
});

frameShells.forEach((frameShell) => {
  frameShell.addEventListener("wheel", syncExpandedFrameWheel, { passive: false });
});

projectEmbedFrames.forEach((embedFrame) => {
  embedFrame.addEventListener("load", () => {
    const parentPanel = embedFrame.closest(".project-panel");

    resetEmbeddedProjectScroll(parentPanel);
  });

  resetEmbeddedProjectScroll(embedFrame.closest(".project-panel"));
});

projectEmbedPanelFrames.forEach((panelFrame) => {
  panelFrame.addEventListener("pointerenter", showArchiveFrameCursor);
  panelFrame.addEventListener("pointermove", moveArchiveFrameCursor);
  panelFrame.addEventListener("pointerleave", hideArchiveFrameCursor);
  panelFrame.addEventListener("click", () => {
    expandPanelFromOverview(panelFrame.closest(".project-panel"));
  });
});

document.querySelectorAll(".about-work-link[data-project]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const projectId = link.dataset.project;

    if (!projectId) {
      return;
    }

    event.preventDefault();
    navigateToProjectFromHome(projectId);
  });
});

aboutWorkTiles.forEach((tile) => {
  tile.addEventListener("pointerenter", () => playDesktopAboutWorkHoverAnimation(tile));
});

projectEmbedWheelLayers.forEach((wheelLayer) => {
  wheelLayer.addEventListener("pointerenter", showProjectEmbedScrollCursor);
  wheelLayer.addEventListener("pointermove", moveProjectEmbedScrollCursor);
  wheelLayer.addEventListener("pointerleave", hideProjectEmbedScrollCursor);
  wheelLayer.addEventListener(
    "wheel",
    (event) => {
      const parentPanel = wheelLayer.closest(".project-panel");

      if (!parentPanel?.classList.contains("is-expanded")) {
        return;
      }

      const didPost = postScrollToEmbeddedProject(parentPanel, event.deltaY);

      if (!didPost) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      projectEmbedScrollCursorX = event.clientX;
      projectEmbedScrollCursorY = event.clientY;
      window.setTimeout(() => refreshProjectEmbedScrollCursor(wheelLayer), 40);
    },
    { passive: false },
  );
});

syncSelectedProject(indexItems[0]?.dataset.project || "01");
syncAboutSheetScale();
syncAboutWorkTileArrows();
initializeHomeIntro();
applyDebugLabels();
refreshMeasurements();
syncDebugToggle();
syncLabelToggle();
bindRollingFrameDebugControls();

const initialProjectParam = new URLSearchParams(window.location.search).get("project");

if (initialProjectParam && panelByProject.has(initialProjectParam)) {
  window.requestAnimationFrame(() => {
    navigateToProjectFromHome(initialProjectParam);
  });
}
