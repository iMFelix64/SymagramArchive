const root = document.documentElement;
const projectPage = document.querySelector(".project-page");
const projectStream = document.querySelector("[data-project-stream]");
const archiveData = window.TDG_ARCHIVE || { groups: [], projects: [] };
const isEmbedded =
  window.self !== window.top || new URLSearchParams(window.location.search).get("embed") === "1";
const PROJECT_RESET_ANIMATION_MS = 420;

function getProjectIdFromSearch() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("project") || params.get("projectId") || params.get("id") || "";
  const normalizedId = projectId.match(/\d+/)?.[0] || projectId;

  return normalizedId ? normalizedId.padStart(2, "0") : "";
}

function getProjectIdFromPath() {
  const match = window.location.pathname.match(/project-(\d+)/);

  return match ? match[1].padStart(2, "0") : "";
}

function getCurrentProject() {
  const projectId = projectPage?.dataset.projectId || getProjectIdFromSearch() || getProjectIdFromPath();

  return (archiveData.projects || []).find((project) => project.id === projectId) || null;
}

function getArchiveRootUrl() {
  return new URL("../../", window.location.href);
}

function getProjectImages(project) {
  return project.images?.length
    ? project.images
    : [project.coverImage].filter(Boolean);
}

function encodeArchivePath(path) {
  return String(path || "")
    .trim()
    .split("/")
    .map((segment) => {
      if (!segment || segment === "." || segment === "..") {
        return segment;
      }

      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch (error) {
        return encodeURIComponent(segment);
      }
    })
    .join("/");
}

function resolveArchivePath(path) {
  return new URL(encodeArchivePath(path), getArchiveRootUrl()).href;
}

function createProjectImage(project, src, index) {
  const image = document.createElement("img");
  const imageNumber = String(index + 1).padStart(2, "0");

  image.className = "project-image";
  image.src = resolveArchivePath(src);
  image.alt = index === 0
    ? `${project.title}项目主图 ${imageNumber}`
    : `${project.title}项目图片 ${imageNumber}`;
  image.loading = index === 0 ? "eager" : "lazy";

  return image;
}

function createProjectTextElement(tagName, className, textContent = "") {
  const element = document.createElement(tagName);

  element.className = className;
  element.textContent = textContent;

  return element;
}

function createProjectArticleFigure(project, entry, className = "project-article-figure") {
  const figure = document.createElement("figure");
  const image = document.createElement("img");
  const source = typeof entry === "string" ? entry : entry.src;

  figure.className = className;
  image.className = "project-article-image";
  image.src = resolveArchivePath(source);
  image.alt = typeof entry === "string" ? `${project.title}文章插图` : entry.alt || `${project.title}文章插图`;
  image.loading = className.includes("cover") ? "eager" : "lazy";

  figure.append(image);

  if (typeof entry !== "string" && entry.caption) {
    figure.append(createProjectTextElement("figcaption", "project-article-caption", entry.caption));
  }

  return figure;
}

function createProjectArticleAside(entry) {
  const aside = document.createElement("aside");
  const title = createProjectTextElement("h3", "project-article-aside-title", entry.title || "Notes");
  const list = document.createElement("ul");

  aside.className = "project-article-aside";

  (entry.items || []).forEach((itemText) => {
    const item = document.createElement("li");

    item.textContent = itemText;
    list.append(item);
  });

  aside.append(title, list);
  return aside;
}

function createProjectArticleBlock(project, entry) {
  if (!entry || !entry.type) {
    return null;
  }

  switch (entry.type) {
    case "lead":
      return createProjectTextElement("p", "project-article-lead", entry.text || "");
    case "paragraph":
      return createProjectTextElement("p", "project-article-paragraph", entry.text || "");
    case "heading":
      return createProjectTextElement("h2", "project-article-heading", entry.text || "");
    case "image":
      return createProjectArticleFigure(project, entry);
    case "quote":
      return createProjectTextElement("blockquote", "project-article-quote", entry.text || "");
    case "aside":
      return createProjectArticleAside(entry);
    default:
      return null;
  }
}

function renderProjectArticle(project) {
  const article = project.article || {};
  const shell = document.createElement("article");
  const hero = document.createElement("header");
  const meta = document.createElement("div");
  const titleBlock = document.createElement("div");
  const body = document.createElement("div");
  const coverSource = article.coverImage || project.coverImage || project.images?.[0];

  shell.className = "project-article";
  hero.className = "project-article-hero";
  meta.className = "project-article-meta";
  titleBlock.className = "project-article-title-block";
  body.className = "project-article-body";

  meta.append(
    createProjectTextElement("span", "project-article-eyebrow", article.eyebrow || project.category || "ARTICLE"),
    createProjectTextElement("span", "project-article-reading-time", article.readingTime || project.year || ""),
  );

  titleBlock.append(
    createProjectTextElement("h1", "project-article-title", project.title),
    createProjectTextElement("p", "project-article-subtitle", article.subtitle || project.description || ""),
  );

  hero.append(meta, titleBlock);

  if (coverSource) {
    hero.append(createProjectArticleFigure(
      project,
      {
        src: coverSource,
        alt: `${project.title}文章封面`,
        caption: article.coverCaption,
      },
      "project-article-cover",
    ));
  }

  (article.body || [])
    .map((entry) => createProjectArticleBlock(project, entry))
    .filter(Boolean)
    .forEach((block) => body.append(block));

  shell.append(hero, body);
  projectStream.replaceChildren(shell);
}

function renderProjectStream() {
  const project = getCurrentProject();

  if (!project || !projectStream) {
    return;
  }

  const images = getProjectImages(project);

  document.title = `Project ${project.id} / ${project.title}`;
  projectPage?.setAttribute("aria-label", `${project.title}项目页面`);
  projectPage?.setAttribute("data-project-id", project.id);
  projectPage?.querySelector(".project-stream-shell")?.setAttribute(
    "aria-label",
    `${project.title}内容流`,
  );

  if (project.contentType === "article") {
    projectPage?.classList.add("project-page--article");
    renderProjectArticle(project);
    return;
  }

  projectPage?.classList.remove("project-page--article");

  const imageNodes = images.map((src, index) => {
    const image = createProjectImage(project, src, index);

    if (index !== 0) {
      return image;
    }

    const hero = document.createElement("figure");

    hero.className = "project-hero";
    hero.append(image);
    return hero;
  });

  projectStream.replaceChildren(...imageNodes);
}

function syncViewportHeight() {
  root.style.setProperty("--project-vh", `${window.innerHeight}px`);
}

function scrollProjectToTop() {
  projectPage?.scrollTo({ top: 0, behavior: "auto" });
}

function animateProjectToTop(duration = PROJECT_RESET_ANIMATION_MS) {
  if (!projectPage) {
    return Promise.resolve(false);
  }

  const start = projectPage.scrollTop;

  if (start <= 1) {
    scrollProjectToTop();
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const startTime = window.performance.now();

    const tick = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      projectPage.scrollTop = start * (1 - eased);

      if (progress < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      projectPage.scrollTop = 0;
      resolve(true);
    };

    window.requestAnimationFrame(tick);
  });
}

function getProjectScrollState() {
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
}

window.projectViewport = {
  getScrollState() {
    return getProjectScrollState();
  },
  scrollToTop(options = {}) {
    if (options?.behavior === "smooth") {
      return animateProjectToTop(options.duration);
    }

    scrollProjectToTop();
    return Promise.resolve(false);
  },
  animateToTop(duration = PROJECT_RESET_ANIMATION_MS) {
    return animateProjectToTop(duration);
  },
};

window.addEventListener("message", (event) => {
  if (event.data?.type === "project-scroll-to-top") {
    if (event.data.behavior === "smooth") {
      animateProjectToTop(Number(event.data.duration) || PROJECT_RESET_ANIMATION_MS);
      return;
    }

    scrollProjectToTop();
    return;
  }

  if (event.data?.type !== "project-scroll-by") {
    return;
  }

  projectPage?.scrollBy({
    top: Number(event.data.deltaY) || 0,
    behavior: "auto",
  });
});

renderProjectStream();
document.body.classList.toggle("is-embedded", isEmbedded);
window.addEventListener("resize", syncViewportHeight);
syncViewportHeight();
