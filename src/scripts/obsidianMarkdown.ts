/**
 * obsidianMarkdown.ts
 * Enhances standard Markdown/MDX content with Obsidian-compatible features:
 * 1. Obsidian Callouts (> [!NOTE], > [!TIP], > [!WARNING], > [!DANGER], etc.)
 * 2. Highlights (==text==)
 * 3. External link indicators (target="_blank" + ↗ icon)
 * 4. Image Lightbox with zoom and captions
 * 5. Code block headers (Mac dots, language badge, copy button)
 * 6. TOC active heading scroll tracking
 */

interface CalloutConfig {
  icon: string;
  title: string;
  color: string;
  bgRgb: string;
}

const CALLOUT_TYPES: Record<string, CalloutConfig> = {
  note: {
    title: "Note",
    color: "#3b82f6",
    bgRgb: "59, 130, 246",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  },
  info: {
    title: "Info",
    color: "#0ea5e9",
    bgRgb: "14, 165, 233",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  },
  todo: {
    title: "Todo",
    color: "#0284c7",
    bgRgb: "2, 132, 199",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
  },
  tip: {
    title: "Tip",
    color: "#10b981",
    bgRgb: "16, 185, 129",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v1"></path><path d="M12 21v1"></path><path d="M4.93 4.93l.7.7"></path><path d="M18.36 18.36l.7.7"></path><path d="M2 12h1"></path><path d="M21 12h1"></path><path d="M4.93 19.07l.7-.7"></path><path d="M18.36 5.64l.7-.7"></path><path d="M9 16a5 5 0 1 1 6 0"></path><path d="M9 19h6"></path><path d="M10 22h4"></path></svg>`,
  },
  hint: {
    title: "Hint",
    color: "#10b981",
    bgRgb: "16, 185, 129",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v1"></path><path d="M12 21v1"></path><path d="M9 16a5 5 0 1 1 6 0"></path><path d="M9 19h6"></path><path d="M10 22h4"></path></svg>`,
  },
  important: {
    title: "Important",
    color: "#8b5cf6",
    bgRgb: "139, 92, 246",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  },
  success: {
    title: "Success",
    color: "#22c55e",
    bgRgb: "34, 197, 94",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  },
  check: {
    title: "Check",
    color: "#22c55e",
    bgRgb: "34, 197, 94",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  },
  done: {
    title: "Done",
    color: "#22c55e",
    bgRgb: "34, 197, 94",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  },
  question: {
    title: "Question",
    color: "#a855f7",
    bgRgb: "168, 85, 247",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  },
  help: {
    title: "Help",
    color: "#a855f7",
    bgRgb: "168, 85, 247",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  },
  faq: {
    title: "FAQ",
    color: "#a855f7",
    bgRgb: "168, 85, 247",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  },
  warning: {
    title: "Warning",
    color: "#f59e0b",
    bgRgb: "245, 158, 11",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  },
  caution: {
    title: "Caution",
    color: "#f59e0b",
    bgRgb: "245, 158, 11",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  },
  attention: {
    title: "Attention",
    color: "#f59e0b",
    bgRgb: "245, 158, 11",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  },
  failure: {
    title: "Failure",
    color: "#ef4444",
    bgRgb: "239, 68, 68",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
  },
  fail: {
    title: "Fail",
    color: "#ef4444",
    bgRgb: "239, 68, 68",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
  },
  missing: {
    title: "Missing",
    color: "#ef4444",
    bgRgb: "239, 68, 68",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
  },
  danger: {
    title: "Danger",
    color: "#ef4444",
    bgRgb: "239, 68, 68",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  },
  error: {
    title: "Error",
    color: "#ef4444",
    bgRgb: "239, 68, 68",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
  },
  bug: {
    title: "Bug",
    color: "#f43f5e",
    bgRgb: "244, 63, 94",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="14" x="8" y="6" rx="4"></rect><path d="m19 7-3 2"></path><path d="m5 7 3 2"></path><path d="m19 19-3-2"></path><path d="m5 19 3-2"></path><path d="M20 13h-4"></path><path d="M4 13h4"></path><path d="m10 4 1 2"></path><path d="m14 4-1 2"></path></svg>`,
  },
  example: {
    title: "Example",
    color: "#06b6d4",
    bgRgb: "6, 182, 212",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
  },
  quote: {
    title: "Quote",
    color: "#64748b",
    bgRgb: "100, 116, 139",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path></svg>`,
  },
};

/**
 * 1. Transform blockquotes into Obsidian Callouts
 */
export function initObsidianCallouts(): void {
  const blockquotes = document.querySelectorAll<HTMLElement>("article .article-body blockquote");

  blockquotes.forEach((blockquote) => {
    if (blockquote.dataset.calloutTransformed === "true") return;

    const firstP = blockquote.querySelector("p");
    if (!firstP) return;

    const text = firstP.innerHTML.trim();
    const calloutMatch = text.match(/^\[!([a-zA-Z_-]+)\]([+-]?)(.*)$/m);

    if (calloutMatch) {
      blockquote.dataset.calloutTransformed = "true";
      const rawType = calloutMatch[1].toLowerCase();
      const collapseSign = calloutMatch[2]; // + or - or none
      const customTitle = calloutMatch[3]?.trim();

      const config = CALLOUT_TYPES[rawType] || {
        title: rawType.charAt(0).toUpperCase() + rawType.slice(1),
        color: "#6366f1",
        bgRgb: "99, 102, 241",
        icon: CALLOUT_TYPES.note.icon,
      };

      const title = customTitle || config.title;

      // Remove the [!TYPE] line from the first paragraph
      const remainingHtml = firstP.innerHTML
        .replace(/^\[!([a-zA-Z_-]+)\]([+-]?)(.*)(<br\s*\/?>|\n)?/im, "")
        .trim();

      if (remainingHtml) {
        firstP.innerHTML = remainingHtml;
      } else {
        firstP.remove();
      }

      const isCollapsible = collapseSign === "+" || collapseSign === "-";
      const isDefaultClosed = collapseSign === "-";

      const calloutEl = document.createElement(isCollapsible ? "details" : "div");
      calloutEl.className = `callout callout-${rawType} not-prose`;
      calloutEl.style.setProperty("--callout-color", config.color);
      calloutEl.style.setProperty("--callout-color-rgb", config.bgRgb);

      if (isCollapsible && !isDefaultClosed) {
        (calloutEl as HTMLDetailsElement).open = true;
      }

      const titleEl = document.createElement(isCollapsible ? "summary" : "div");
      titleEl.className = "callout-title cursor-pointer";
      titleEl.innerHTML = `
        <span class="callout-icon">${config.icon}</span>
        <span class="callout-title-text">${title}</span>
        ${
          isCollapsible
            ? `<span class="callout-fold ml-auto text-xs opacity-60">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform details-arrow"><polyline points="6 9 12 15 18 9"></polyline></svg>
               </span>`
            : ""
        }
      `;

      const contentEl = document.createElement("div");
      contentEl.className = "callout-content";
      while (blockquote.firstChild) {
        contentEl.appendChild(blockquote.firstChild);
      }

      calloutEl.appendChild(titleEl);
      calloutEl.appendChild(contentEl);

      blockquote.replaceWith(calloutEl);
    }
  });
}

/**
 * 2. Transform Obsidian ==highlight== syntax
 */
export function initObsidianHighlights(): void {
  const articleBody = document.querySelector<HTMLElement>("article .article-body");
  if (!articleBody) return;

  const walker = document.createTreeWalker(articleBody, NodeFilter.SHOW_TEXT);
  const nodesToReplace: { node: Text; html: string }[] = [];

  let node = walker.nextNode() as Text | null;
  while (node) {
    if (
      node.parentElement &&
      !["PRE", "CODE", "SCRIPT", "STYLE"].includes(node.parentElement.tagName) &&
      node.textContent &&
      /==([^=\n]+)==/.test(node.textContent)
    ) {
      const html = node.textContent.replace(
        /==([^=\n]+)==/g,
        '<mark class="obsidian-highlight">$1</mark>'
      );
      nodesToReplace.push({ node, html });
    }
    node = walker.nextNode() as Text | null;
  }

  nodesToReplace.forEach(({ node, html }) => {
    const span = document.createElement("span");
    span.innerHTML = html;
    node.replaceWith(...Array.from(span.childNodes));
  });
}

/**
 * 3. External Links (open in new tab + add ↗ icon)
 */
export function initExternalLinks(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>("article .article-body a");
  const currentHost = window.location.host;

  links.forEach((link) => {
    if (link.dataset.extProcessed === "true") return;
    link.dataset.extProcessed = "true";

    const href = link.getAttribute("href") || "";
    if (href.startsWith("http://") || href.startsWith("https://")) {
      try {
        const url = new URL(href);
        if (url.host !== currentHost) {
          link.setAttribute("target", "_blank");
          link.setAttribute("rel", "noopener noreferrer");
          link.classList.add("external-link");

          if (!link.querySelector(".external-icon") && !link.querySelector("img")) {
            const icon = document.createElement("span");
            icon.className = "external-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>`;
            link.appendChild(icon);
          }
        }
      } catch {}
    }
  });
}

/**
 * 4. Code Block Mac-style Headers & Language Badges
 */
export function initCodeBlockHeaders(): void {
  document.querySelectorAll<HTMLElement>("article pre").forEach((pre) => {
    if (pre.querySelector(".code-header")) return;

    const code = pre.querySelector("code");
    let lang = "code";

    if (code) {
      const classList = Array.from(code.classList);
      const langClass = classList.find((c) => c.startsWith("language-"));
      if (langClass) {
        lang = langClass.replace("language-", "");
      }
    }

    const header = document.createElement("div");
    header.className = "code-header";
    header.innerHTML = `
      <div class="code-dots">
        <span class="code-dot bg-error/80"></span>
        <span class="code-dot bg-warning/80"></span>
        <span class="code-dot bg-success/80"></span>
      </div>
      <span class="code-lang-badge">${lang}</span>
    `;

    pre.prepend(header);
  });
}

/**
 * 5. Image Lightbox Modal
 */
export function initImageLightbox(): void {
  let lightbox = document.getElementById("image-lightbox");

  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.id = "image-lightbox";
    lightbox.className =
      "fixed inset-0 z-[100] hidden flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-opacity duration-300 opacity-0 cursor-zoom-out";
    lightbox.innerHTML = `
      <div class="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center pointer-events-auto">
        <img id="lightbox-img" class="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl transition-transform duration-300 scale-95" src="" alt="" />
        <p id="lightbox-caption" class="text-sm text-white/80 mt-3 text-center font-medium max-w-lg"></p>
      </div>
      <button type="button" id="lightbox-close" class="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Close image preview">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;
    document.body.appendChild(lightbox);

    const closeLightbox = () => {
      lightbox?.classList.remove("opacity-100");
      lightbox?.classList.add("opacity-0");
      const img = lightbox?.querySelector("#lightbox-img");
      img?.classList.remove("scale-100");
      img?.classList.add("scale-95");
      setTimeout(() => {
        lightbox?.classList.add("hidden");
        lightbox?.classList.remove("flex");
      }, 200);
    };

    lightbox.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).id !== "lightbox-img") {
        closeLightbox();
      }
    });

    document.getElementById("lightbox-close")?.addEventListener("click", closeLightbox);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !lightbox?.classList.contains("hidden")) {
        closeLightbox();
      }
    });
  }

  // Attach click to article images
  const images = document.querySelectorAll<HTMLImageElement>("article .article-body img");
  images.forEach((img) => {
    if (img.dataset.lightboxBound === "true") return;
    img.dataset.lightboxBound = "true";
    img.classList.add("cursor-zoom-in", "hover:opacity-95", "transition-opacity");

    img.addEventListener("click", () => {
      const lightboxImg = document.getElementById("lightbox-img") as HTMLImageElement;
      const lightboxCaption = document.getElementById("lightbox-caption");

      if (lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || "";
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = img.alt || "";
      }

      lightbox?.classList.remove("hidden");
      lightbox?.classList.add("flex");
      requestAnimationFrame(() => {
        lightbox?.classList.remove("opacity-0");
        lightbox?.classList.add("opacity-100");
        lightboxImg?.classList.remove("scale-95");
        lightboxImg?.classList.add("scale-100");
      });
    });
  });
}

/**
 * 6. Active Heading Scroll Spy for TOC
 */
export function initTocScrollSpy(): void {
  const tocLinks = document.querySelectorAll<HTMLAnchorElement>("[data-toc-link]");
  if (tocLinks.length === 0) return;

  const headings = Array.from(document.querySelectorAll<HTMLElement>("article h1, article h2, article h3, article h4")).filter(
    (h) => h.id
  );

  if (headings.length === 0) return;

  const onScroll = () => {
    const scrollPosition = window.scrollY + 120;
    let currentId = "";

    for (let i = headings.length - 1; i >= 0; i--) {
      if (headings[i].offsetTop <= scrollPosition) {
        currentId = headings[i].id;
        break;
      }
    }

    if (!currentId && headings.length > 0) {
      currentId = headings[0].id;
    }

    tocLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const isActive = href === `#${currentId}`;
      link.dataset.active = String(isActive);
      link.classList.toggle("text-primary", isActive);
      link.classList.toggle("font-bold", isActive);
      link.classList.toggle("opacity-100", isActive);
      link.classList.toggle("opacity-60", !isActive);
      link.classList.toggle("border-l-primary", isActive);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/**
 * Run all initializers
 */
export function setupAllMarkdownEnhancements(): void {
  initObsidianCallouts();
  initObsidianHighlights();
  initExternalLinks();
  initCodeBlockHeaders();
  initImageLightbox();
  initTocScrollSpy();
}

setupAllMarkdownEnhancements();
document.addEventListener("astro:page-load", setupAllMarkdownEnhancements);
