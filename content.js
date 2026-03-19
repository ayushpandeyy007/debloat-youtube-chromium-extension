const defaults = {
  hideShorts: true,
  hideSuggested: true,
  hideHomeChips: true,
  hideSidebarExtras: true,
};

function hide(el) {
  if (el) {
    el.style.display = "none";
  }
}

function removeNode(el) {
  if (el && el.parentNode) {
    el.remove();
  }
}

function textOf(el) {
  return (el?.textContent || "").trim().toLowerCase();
}

function matchesTitle(el, title) {
  return textOf(el) === title.toLowerCase();
}

function getGuideEntryTitle(entry) {
  const titleEl = entry.querySelector(
    "yt-formatted-string.title, #guide-section-title, yt-formatted-string",
  );
  return textOf(titleEl);
}

function isShortsEntry(entry) {
  const endpoint =
    entry.querySelector('a[href="/shorts"]') ||
    entry.querySelector('a[href^="/shorts/"]');

  if (endpoint) return true;

  const title = getGuideEntryTitle(entry);
  return title === "shorts";
}

function removeShortsGuideEntries() {
  const entries = document.querySelectorAll("ytd-guide-entry-renderer");

  entries.forEach((entry) => {
    if (isShortsEntry(entry)) {
      hide(entry);
      const paperItem = entry.querySelector("tp-yt-paper-item");
      hide(paperItem);
    }
  });

  const miniGuideEntries = document.querySelectorAll(
    "ytd-mini-guide-entry-renderer",
  );

  miniGuideEntries.forEach((entry) => {
    const endpoint =
      entry.querySelector('a[href="/shorts"]') ||
      entry.querySelector('a[href^="/shorts/"]');
    const title = textOf(entry);

    if (endpoint || title.includes("shorts")) {
      hide(entry);
    }
  });
}

function removeShortsContentCards() {
  const shortsLinks = document.querySelectorAll('a[href^="/shorts"]');

  shortsLinks.forEach((link) => {
    const container =
      link.closest("ytd-rich-item-renderer") ||
      link.closest("ytd-video-renderer") ||
      link.closest("ytd-grid-video-renderer") ||
      link.closest("ytd-compact-video-renderer") ||
      link.closest("ytd-rich-shelf-renderer") ||
      link.closest("ytd-reel-shelf-renderer") ||
      link.closest("ytd-item-section-renderer") ||
      link.closest("ytd-search") ||
      link.closest("ytd-guide-entry-renderer") ||
      link.closest("ytd-mini-guide-entry-renderer");

    hide(container || link);
  });
}

function removeShortsShelves() {
  const shelves = document.querySelectorAll(
    "ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer",
  );
  shelves.forEach((el) => hide(el));
}

function redirectIfOnShortsPage() {
  const path = window.location.pathname;
  if (path.startsWith("/shorts/")) {
    const videoId = path.split("/")[2];
    if (videoId) {
      window.location.replace(`/watch?v=${videoId}`);
    }
  }
}

function applyShorts() {
  removeShortsGuideEntries();
  removeShortsContentCards();
  removeShortsShelves();
  redirectIfOnShortsPage();
}

function applySuggestedVideos() {
  if (!window.location.pathname.startsWith("/watch")) {
    document.documentElement.classList.remove("ytc-hide-suggested");
    return;
  }

  document.documentElement.classList.add("ytc-hide-suggested");

  hide(document.getElementById("secondary"));
  hide(document.getElementById("secondary-inner"));
  hide(document.querySelector("ytd-watch-next-secondary-results-renderer"));
}

function applyHomeChips() {
  if (window.location.pathname !== "/") {
    document.documentElement.classList.remove("ytc-hide-home-chips");
    return;
  }

  document.documentElement.classList.add("ytc-hide-home-chips");

  const chipBars = document.querySelectorAll(
    "ytd-feed-filter-chip-bar-renderer, iron-selector#chips",
  );

  chipBars.forEach((el) => {
    const wrapper =
      el.closest("ytd-feed-filter-chip-bar-renderer") || el.parentElement;
    hide(wrapper || el);
  });
}

function removeSidebarSectionByHeading(sectionTitle) {
  const sections = document.querySelectorAll("ytd-guide-section-renderer");

  sections.forEach((section) => {
    const titleEl = section.querySelector("#guide-section-title");
    const title = textOf(titleEl);

    if (title === sectionTitle.toLowerCase()) {
      hide(section);
    }
  });
}

function removeSubscriptionsCollapsibleSection() {
  const sections = document.querySelectorAll("ytd-guide-section-renderer");

  sections.forEach((section) => {
    const headerEntry = section.querySelector(
      "ytd-guide-collapsible-section-entry-renderer #header-entry",
    );

    if (!headerEntry) return;

    const title = getGuideEntryTitle(headerEntry);

    if (title === "subscriptions") {
      hide(section);
    }
  });
}

function applySidebarExtras() {
  removeSubscriptionsCollapsibleSection();
  removeSidebarSectionByHeading("Explore");
}

function clearFeatureClasses(settings) {
  if (!settings.hideSuggested) {
    document.documentElement.classList.remove("ytc-hide-suggested");
  }

  if (!settings.hideHomeChips) {
    document.documentElement.classList.remove("ytc-hide-home-chips");
  }
}

function applyAll(settings) {
  clearFeatureClasses(settings);

  if (settings.hideShorts) {
    applyShorts();
  }

  if (settings.hideSuggested) {
    applySuggestedVideos();
  }

  if (settings.hideHomeChips) {
    applyHomeChips();
  }

  if (settings.hideSidebarExtras) {
    applySidebarExtras();
  }
}

async function start() {
  const settings = await chrome.storage.sync.get(defaults);

  const run = () => applyAll(settings);

  run();

  const observer = new MutationObserver(() => {
    run();
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;

    for (const key in changes) {
      settings[key] = changes[key].newValue;
    }

    run();
  });
}

start();
