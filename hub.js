/* =========================================
   MANGOHUB - MAIN SCRIPT
========================================= */

const hubItems = [
  // GAMES
  {
    name: "Coolmath Games",
    category: "games",
    icon: "🎮",
    description: "Play puzzles, strategy games, and fun browser games.",
    url: "https://www.coolmathgames.com/"
  },
  {
    name: "DogeUB",
    category: "games",
    icon: "🌐",
    description: "DogeUB.",
    url: "https://unpkg.com/unblocking@1.0.14/index.html?from=https%3A%2F%2Fdogeub.storage.googleapis.com%2Fcourse&mid=u1#/docs"
  },
  {
    name: "Baldi's Basics",
    category: "games",
    icon: "📏",
    description: "Play Baldi's Basics.",
    url: "https://assets.hbmc.net/baldis-basics/index.html"
  },
  {
    name: "Worldle",
    category: "games",
    icon: "🌍",
    description: "Guess a place in the world by its shape.",
    url: "https://worldle.teuteuf.fr/"
  },
  {
    name: "Stickman Hook",
    category: "games",
    icon: "☺",
    description: "Go thru hooks as an amazing stickman!",
    url: "https://joemama34568.github.io/games/stickmanhook/index.html"
  },
  {
    name: "Geometry Dash",
    category: "games",
    icon: "🔷",
    description: "Play Geometry Dash in your browser! (NOW WITH LEVEL EDITOR)",
    url: "https://gd-webport.pages.dev/"
  },
  {
    name: "AquaPark",
    category: "games",
    icon: "🌊",
    description: "Slide into the fun at AquaPark!",
    url: "https://assets.hbmc.net/aquapark-slides/index.html"
  },
  {
    name: "Among Us Single Player",
    category: "games",
    icon: "👨‍🚀",
    description: "Play Among Us in a single-player experience.",
    url: "https://kdata1.com/2020/12/3054073"
  },
  {
    name: "Flappy Bird",
    category: "games",
    icon: "🐦",
    description: "Fly through the pipes in Flappy Bird!",
    url: "https://assets.hbmc.net/flappybird/index.html"
  },
  {
    name: "Happy Wheels",
    category: "games",
    icon: "🛞",
    description: "Play Happy Wheels, the classic physics-based obstacle game.",
    url: "https://games-online.io/game/HappyWheels"
  },
  {
    name: "Bloons TD",
    category: "games",
    icon: "🎈",
    description: "Pop waves of bloons using towers and upgrades.",
    url: "https://assets.hbmc.net/bloonstd/index.html"
  },

  // MOVIES
  {
    name: "PBS",
    category: "movies",
    icon: "📺",
    description: "Watch programs, documentaries, and series.",
    url: "https://www.pbs.org/"
  },
  {
    name: "Atlantic",
    category: "movies",
    icon: "🎥",
    description: "Visit the Atlantic website.",
    url: "https://atlantic.bz/"
  },
  {
    name: "ToonPlay",
    category: "movies",
    icon: "🎨",
    description: "Visit the ToonPlay website.",
    url: "https://toonplay.in/"
  }
];

/* =========================================
   ELEMENTS
========================================= */

const hubGrid = document.getElementById("hub-grid");
const hubSearch = document.getElementById("hub-search");
const resultCount = document.getElementById("result-count");
const noResults = document.getElementById("no-results");
const categoryButtons = document.querySelectorAll(".category-button");

const hubHero = document.getElementById("hub-hero");
const librarySection = document.getElementById("library-section");
const hubInfo = document.getElementById("hub-info");
const playerSection = document.getElementById("player-section");
const categoryNav = document.getElementById("category-nav");

const playerTitle = document.getElementById("player-title");
const playerDescription = document.getElementById("player-description");
const hubPlayer = document.getElementById("hub-player");

const openExternal = document.getElementById("open-external");
const backButton = document.getElementById("back-to-library");
const fullscreenButton = document.getElementById("fullscreen-button");

/* =========================================
   PLAYER MOUSE FOCUS FIX
========================================= */

if (hubPlayer) {
  hubPlayer.setAttribute("tabindex", "0");

  function focusPlayerFrame() {
    try {
      hubPlayer.focus({ preventScroll: true });
      hubPlayer.contentWindow.focus();
    } catch (error) {
      console.warn("Could not focus player:", error);
    }
  }

  hubPlayer.addEventListener("pointerenter", focusPlayerFrame);
  hubPlayer.addEventListener("pointerdown", focusPlayerFrame);
}

/* WEB SEARCH ELEMENTS */

const webSearchForm = document.getElementById("web-search-form");
const webSearchInput = document.getElementById("web-search-input");

/* SETTINGS ELEMENTS */

const settingsButton = document.getElementById("settings-button");
const settingsSection = document.getElementById("settings-section");
const settingsBackButton = document.getElementById("settings-back-button");

const themeButtons = document.querySelectorAll(
  ".theme-option[data-theme]"
);

const backgroundThemeButtons = document.querySelectorAll(
  ".background-theme-option"
);

/* =========================================
   SEARCH CONFIGURATION
========================================= */

const SEARCH_API_URL =
  "https://mangohub-browser.newtwiggymariobros.workers.dev";

/* =========================================
   FAVORITES & RECENTLY PLAYED STORAGE
========================================= */

const FAVORITES_KEY = "mangohub_favorites";
const RECENT_KEY = "mangohub_recently_played";

function loadStoredArray(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error("Could not load " + key + ":", error);
    return [];
  }
}

let favoriteItems = loadStoredArray(FAVORITES_KEY);
let recentlyPlayed = loadStoredArray(RECENT_KEY);

function saveFavorites() {
  try {
    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(favoriteItems)
    );
  } catch (error) {
    console.error("Could not save favorites:", error);
  }
}

function saveRecentlyPlayed() {
  try {
    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify(recentlyPlayed)
    );
  } catch (error) {
    console.error("Could not save recently played:", error);
  }
}

function isFavorite(item) {
  return favoriteItems.includes(item.url);
}

function toggleFavorite(item) {
  if (isFavorite(item)) {
    favoriteItems = favoriteItems.filter(url => url !== item.url);
  } else {
    favoriteItems.push(item.url);
  }

  saveFavorites();
  renderHub();
}

function addToRecentlyPlayed(item) {
  recentlyPlayed = [
    item.url,
    ...recentlyPlayed.filter(url => url !== item.url)
  ].slice(0, 8);

  saveRecentlyPlayed();
  renderRecentlyPlayed();
}

/* =========================================
   CREATE FAVORITES CATEGORY
========================================= */

let activeCategory = "all";
let searchQuery = "";

const favoritesButton = document.createElement("button");
favoritesButton.type = "button";
favoritesButton.className = "category-button";
favoritesButton.dataset.category = "favorites";
favoritesButton.textContent = "⭐ Favorites";

categoryNav.appendChild(favoritesButton);

const allCategoryButtons = [
  ...categoryButtons,
  favoritesButton
];

/* =========================================
   CREATE RECENTLY PLAYED SECTION
========================================= */

const recentSection = document.createElement("section");
recentSection.id = "recently-played-section";
recentSection.innerHTML = `
  <div class="recently-played-heading">
    <h2>🕘 Recently Played</h2>
    <button type="button" id="clear-recently-played">
      Clear History
    </button>
  </div>
  <div id="recently-played-grid" class="recently-played-grid"></div>
`;

const recentStyle = document.createElement("style");

recentStyle.textContent = `
  #recently-played-section {
    width: 100%;
    margin: 0 0 30px;
  }

  .recently-played-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 15px;
  }

  .recently-played-heading h2 {
    margin: 0;
    color: var(--hub-accent);
    font-size: 20px;
  }

  #clear-recently-played {
    padding: 8px 12px;
    color: var(--hub-muted);
    background: var(--hub-card);
    border: 1px solid var(--hub-border);
    border-radius: 8px;
    cursor: pointer;
  }

  #clear-recently-played:hover {
    color: var(--hub-accent);
    border-color: var(--hub-accent);
  }

  .recently-played-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 14px;
  }

  .recent-card {
    position: relative;
    min-width: 0;
    padding: 16px;
    color: white;
    text-align: left;
    background: var(--hub-card);
    border: 1px solid var(--hub-border);
    border-radius: 12px;
    cursor: pointer;
    transition: .2s ease;
  }

  .recent-card:hover {
    border-color: var(--hub-accent);
    transform: translateY(-2px);
  }

  .recent-card strong {
    display: block;
    margin: 8px 0 5px;
  }

  .recent-card small {
    color: var(--hub-muted);
  }

  .hub-card {
    position: relative;
  }

  .hub-favorite-button {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 2;
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    padding: 0;
    color: var(--hub-muted);
    background: var(--hub-card);
    border: 1px solid var(--hub-border);
    border-radius: 9px;
    font-size: 19px;
    cursor: pointer;
  }

  .hub-favorite-button:hover,
  .hub-favorite-button.is-favorite {
    color: var(--hub-accent);
    border-color: var(--hub-accent);
  }

  .hub-card-top {
    padding-right: 35px;
  }

  #recently-played-section[hidden] {
    display: none !important;
  }

  @media (max-width: 500px) {
    .recently-played-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;

document.head.appendChild(recentStyle);

const hubGridParent = hubGrid.parentElement;
hubGridParent.insertBefore(recentSection, hubGrid);

const recentlyPlayedGrid = document.getElementById(
  "recently-played-grid"
);

document.getElementById("clear-recently-played")
  .addEventListener("click", () => {
    recentlyPlayed = [];
    saveRecentlyPlayed();
    renderRecentlyPlayed();
  });

function renderRecentlyPlayed() {
  recentlyPlayedGrid.replaceChildren();

  const recentItems = recentlyPlayed
    .map(url => hubItems.find(item => item.url === url))
    .filter(Boolean);

  recentItems.forEach(item => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "recent-card";

    const icon = document.createElement("span");
    icon.textContent = item.icon;

    const name = document.createElement("strong");
    name.textContent = item.name;

    const category = document.createElement("small");
    category.textContent =
      item.category.charAt(0).toUpperCase() +
      item.category.slice(1);

    card.append(icon, name, category);
    card.addEventListener("click", () => openPlayer(item));

    recentlyPlayedGrid.appendChild(card);
  });

  recentSection.hidden =
    activeCategory === "favorites" ||
    activeCategory !== "all" ||
    searchQuery.length > 0 ||
    recentItems.length === 0;
}

/* =========================================
   CREATE SEARCH RESULTS PANEL
========================================= */

const playerFrameWrap = hubPlayer
  ? hubPlayer.closest(".player-frame-wrap")
  : null;

const searchResultsPanel = document.createElement("div");
searchResultsPanel.id = "web-search-results";
searchResultsPanel.hidden = true;

if (playerFrameWrap) {
  playerFrameWrap.insertAdjacentElement(
    "afterend",
    searchResultsPanel
  );
}

/* SEARCH RESULTS STYLING */

const searchResultsStyle = document.createElement("style");

searchResultsStyle.textContent = `
  #web-search-results {
    width: 100%;
    max-width: 1000px;
    margin: 20px auto;
    padding: 20px;
    box-sizing: border-box;
    color: white;
  }

  #web-search-results[hidden] {
    display: none !important;
  }

  .web-results-heading {
    margin-bottom: 18px;
  }

  .web-results-heading h2 {
    margin: 0 0 8px;
    color: var(--hub-accent);
    font-size: 22px;
  }

  .web-results-heading p {
    margin: 0;
    color: var(--hub-muted);
    font-size: 13px;
  }

  .web-result-card {
    display: block;
    width: 100%;
    margin-bottom: 12px;
    padding: 17px;
    text-align: left;
    color: white;
    background: var(--hub-card);
    border: 1px solid var(--hub-border);
    border-radius: 12px;
    cursor: pointer;
    transition: .2s ease;
  }

  .web-result-card:hover {
    border-color: var(--hub-accent);
    transform: translateY(-2px);
  }

  .web-result-card h3 {
    margin: 0 0 8px;
    color: var(--hub-accent);
    font-size: 16px;
  }

  .web-result-url {
    display: block;
    margin-bottom: 9px;
    color: #82baff;
    font-size: 11px;
    overflow-wrap: anywhere;
  }

  .web-result-description {
    margin: 0;
    color: var(--hub-muted);
    font-size: 13px;
    line-height: 1.6;
  }

  .web-search-message {
    padding: 25px;
    color: var(--hub-muted);
    text-align: center;
    background: var(--hub-card);
    border: 1px solid var(--hub-border);
    border-radius: 12px;
  }
`;

document.head.appendChild(searchResultsStyle);

/* =========================================
   ACCENT COLOR THEMES
========================================= */

const hubThemes = {
  "normal": { name: "Normal", color: "#ECEA98" },
  "light": { name: "Light", color: "#FFFFFF" },
  "deep-ocean": { name: "Deep Ocean", color: "#004080" },
  "lime": { name: "Lime", color: "#DAFACC" },
  "light-blue": { name: "Light Blue", color: "#4EAAFF" },
  "blood": { name: "Blood", color: "#E10000" },
  "ender": { name: "Ender", color: "#8E75CF" },
  "mango": { name: "Mango", color: "#FFBF34" }
};

function applyTheme(themeName, save = true) {
  if (!hubThemes[themeName]) themeName = "normal";

  const selectedTheme = hubThemes[themeName];
  document.body.dataset.theme = themeName;

  document.documentElement.style.setProperty(
    "--hub-accent",
    selectedTheme.color
  );

  themeButtons.forEach(button => {
    const isSelected = button.dataset.theme === themeName;
    button.classList.toggle("active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  if (save) {
    try {
      localStorage.setItem("mangohub_theme", themeName);
    } catch (error) {
      console.error("Could not save accent theme:", error);
    }
  }
}

function loadSavedTheme() {
  let savedTheme = "normal";

  try {
    savedTheme = localStorage.getItem("mangohub_theme") || "normal";
  } catch (error) {
    console.error("Could not load accent theme:", error);
  }

  if (!hubThemes[savedTheme]) savedTheme = "normal";
  applyTheme(savedTheme, false);
}

themeButtons.forEach(button => {
  button.addEventListener("click", () => {
    applyTheme(button.dataset.theme);
  });
});

/* =========================================
   BACKGROUND COLOR THEMES
========================================= */

const backgroundThemes = {
  "normal": { name: "Normal", color: "#000000" },
  "light": { name: "Light", color: "#bbbbbb" },
  "dark-green": { name: "Dark Green", color: "#3b6e25" },
  "deeper-ocean": { name: "Deeper Ocean", color: "#00254b" },
  "mid-blue": { name: "Mid Blue", color: "#478dcd" },
  "dried-blood": { name: "Dried Blood", color: "#990202" },
  "end": { name: "End", color: "#7863af" },
  "rotten-mango": { name: "Rotten Mango", color: "#bd8c22" }
};

function applyBackgroundTheme(themeName, save = true) {
  if (!backgroundThemes[themeName]) themeName = "normal";

  const selectedTheme = backgroundThemes[themeName];

  document.documentElement.style.setProperty(
    "--hub-bg",
    selectedTheme.color
  );

  document.body.dataset.backgroundTheme = themeName;

  backgroundThemeButtons.forEach(button => {
    const isSelected =
      button.dataset.backgroundTheme === themeName;

    button.classList.toggle("active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  if (save) {
    try {
      localStorage.setItem("mangohub_background_theme", themeName);
    } catch (error) {
      console.error("Could not save background theme:", error);
    }
  }
}

function loadSavedBackgroundTheme() {
  let savedTheme = "normal";

  try {
    savedTheme =
      localStorage.getItem("mangohub_background_theme") || "normal";
  } catch (error) {
    console.error("Could not load background theme:", error);
  }

  if (!backgroundThemes[savedTheme]) savedTheme = "normal";
  applyBackgroundTheme(savedTheme, false);
}

backgroundThemeButtons.forEach(button => {
  button.addEventListener("click", () => {
    applyBackgroundTheme(button.dataset.backgroundTheme);
  });
});

/* =========================================
   SETTINGS PAGE
========================================= */

function openSettings() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(error => {
      console.error("Could not exit fullscreen:", error);
    });
  }

  if (hubPlayer) {
    hubPlayer.src = "about:blank";
    hubPlayer.hidden = false;
  }

  if (playerFrameWrap) playerFrameWrap.hidden = false;

  searchResultsPanel.hidden = true;

  hubHero.hidden = true;
  playerSection.hidden = true;
  categoryNav.hidden = true;
  librarySection.hidden = true;
  hubInfo.hidden = true;

  settingsSection.hidden = false;

  settingsSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function closeSettings() {
  settingsSection.hidden = true;

  hubHero.hidden = false;
  categoryNav.hidden = false;
  librarySection.hidden = false;
  hubInfo.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

settingsButton.addEventListener("click", openSettings);
settingsBackButton.addEventListener("click", closeSettings);

/* =========================================
   RENDER LIBRARY
========================================= */

function renderHub() {
  const filteredItems = hubItems.filter(item => {
    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "favorites"
        ? isFavorite(item)
        : item.category === activeCategory);

    const searchText =
      `${item.name} ${item.description} ${item.category}`.toLowerCase();

    return matchesCategory && searchText.includes(searchQuery);
  });

  hubGrid.replaceChildren();

  filteredItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "hub-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", "Open " + item.name);

    card.addEventListener("click", event => {
      if (event.target.closest(".hub-favorite-button")) return;
      openPlayer(item);
    });

    card.addEventListener("keydown", event => {
      if (event.target !== card) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPlayer(item);
      }
    });

    const top = document.createElement("div");
    top.className = "hub-card-top";

    const icon = document.createElement("div");
    icon.className = "hub-card-icon";
    icon.textContent = item.icon;

    const category = document.createElement("span");
    category.className = "hub-card-category";
    category.textContent = item.category;

    top.append(icon, category);

    const favoriteButton = document.createElement("button");
    favoriteButton.type = "button";
    favoriteButton.className = "hub-favorite-button";
    favoriteButton.classList.toggle("is-favorite", isFavorite(item));
    favoriteButton.textContent = isFavorite(item) ? "★" : "☆";
    favoriteButton.title = isFavorite(item)
      ? "Remove from Favorites"
      : "Add to Favorites";
    favoriteButton.setAttribute(
      "aria-label",
      favoriteButton.title
    );

    favoriteButton.addEventListener("click", event => {
      event.stopPropagation();
      toggleFavorite(item);
    });

    const name = document.createElement("h3");
    name.textContent = item.name;

    const description = document.createElement("p");
    description.textContent = item.description;

    const launch = document.createElement("span");
    launch.className = "hub-card-link";
    launch.textContent = "OPEN IN MANGOHUB →";

    card.append(
      top,
      favoriteButton,
      name,
      description,
      launch
    );

    hubGrid.appendChild(card);
  });

  resultCount.textContent = `${filteredItems.length} RESULTS`;
  noResults.hidden = filteredItems.length !== 0;

  renderRecentlyPlayed();
}

/* =========================================
   OPEN PLAYER
========================================= */

function openPlayer(item) {
  const libraryItem = hubItems.find(
    existingItem => existingItem.url === item.url
  );

  if (libraryItem) {
    addToRecentlyPlayed(libraryItem);
  }

  playerTitle.textContent = item.icon + " " + item.name;
  playerDescription.textContent = item.description;

  openExternal.href = item.url;
  openExternal.hidden = false;

  searchResultsPanel.hidden = true;

  if (playerFrameWrap) playerFrameWrap.hidden = false;

  hubPlayer.hidden = false;

  settingsSection.hidden = true;
  playerSection.hidden = false;
  hubHero.hidden = true;
  categoryNav.hidden = true;
  librarySection.hidden = true;
  hubInfo.hidden = true;

  hubPlayer.src = item.url;

  playerSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* =========================================
   SHOW SEARCH RESULTS
========================================= */

function showSearchResults(query, results) {
  playerTitle.textContent = "🌐 Web Search";
  playerDescription.textContent = `Search results for: ${query}`;

  openExternal.hidden = true;

  if (playerFrameWrap) playerFrameWrap.hidden = true;

  hubPlayer.hidden = true;
  searchResultsPanel.hidden = false;

  searchResultsPanel.replaceChildren();

  const heading = document.createElement("div");
  heading.className = "web-results-heading";

  const title = document.createElement("h2");
  title.textContent = "Search Results";

  const subtitle = document.createElement("p");
  subtitle.textContent = `${results.length} results found for "${query}"`;

  heading.append(title, subtitle);
  searchResultsPanel.appendChild(heading);

  if (!results.length) {
    const message = document.createElement("div");
    message.className = "web-search-message";
    message.textContent = "No results found. Try another search.";
    searchResultsPanel.appendChild(message);
  }

  results.forEach(result => {
    let resultURL;

    try {
      resultURL = new URL(result.url);

      if (!["http:", "https:"].includes(resultURL.protocol)) return;
    } catch {
      return;
    }

    const card = document.createElement("button");
    card.type = "button";
    card.className = "web-result-card";

    const resultTitle = document.createElement("h3");
    resultTitle.textContent = result.title || "Untitled result";

    const url = document.createElement("span");
    url.className = "web-result-url";
    url.textContent = resultURL.hostname + resultURL.pathname;

    const description = document.createElement("p");
    description.className = "web-result-description";
    description.textContent = result.content || "No description available.";

    card.append(resultTitle, url, description);

    card.addEventListener("click", () => {
      openPlayer({
        name: result.title || "Search Result",
        icon: "🌐",
        description: resultURL.hostname,
        url: resultURL.href
      });
    });

    searchResultsPanel.appendChild(card);
  });

  settingsSection.hidden = true;
  playerSection.hidden = false;
  hubHero.hidden = true;
  categoryNav.hidden = true;
  librarySection.hidden = true;
  hubInfo.hidden = true;

  playerSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* =========================================
   RETURN TO LIBRARY
========================================= */

function closePlayer() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(error => {
      console.error("Could not exit fullscreen:", error);
    });
  }

  hubPlayer.src = "about:blank";
  hubPlayer.hidden = false;

  if (playerFrameWrap) playerFrameWrap.hidden = false;

  searchResultsPanel.hidden = true;

  playerSection.hidden = true;
  hubHero.hidden = false;
  categoryNav.hidden = false;
  librarySection.hidden = false;
  hubInfo.hidden = false;

  renderRecentlyPlayed();
}

backButton.addEventListener("click", closePlayer);

/* =========================================
   FULLSCREEN PLAYER
========================================= */

if (fullscreenButton && hubPlayer) {
  fullscreenButton.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await hubPlayer.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  });

  document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement
      ? "✕ Exit Fullscreen"
      : "⛶ Fullscreen";
  });
}

/* =========================================
   LIBRARY SEARCH
========================================= */

hubSearch.addEventListener("input", () => {
  searchQuery = hubSearch.value.trim().toLowerCase();
  renderHub();
});

/* =========================================
   WEB SEARCH - TAVILY API
========================================= */

if (webSearchForm && webSearchInput) {
  webSearchForm.addEventListener("submit", async event => {
    event.preventDefault();

    const input = webSearchInput.value.trim();

    if (!input) {
      webSearchInput.focus();
      return;
    }

    const looksLikeWebsite =
      /^(https?:\/\/)?(www\.)?[\w-]+(\.[\w-]+)+(\/[^\s]*)?$/i.test(input);

    if (looksLikeWebsite) {
      try {
        const destination = /^https?:\/\//i.test(input)
          ? input
          : `https://${input}`;

        const parsedURL = new URL(destination);

        if (!["http:", "https:"].includes(parsedURL.protocol)) {
          throw new Error("Unsupported website address.");
        }

        openPlayer({
          name: "Web Browser",
          icon: "🌐",
          description: parsedURL.hostname,
          url: parsedURL.href
        });

      } catch (error) {
        alert("That website address is invalid.");
        console.error("Invalid website address:", error);
      }

      return;
    }

    playerTitle.textContent = "🌐 Searching...";
    playerDescription.textContent = `Looking for: ${input}`;

    hubHero.hidden = true;
    categoryNav.hidden = true;
    librarySection.hidden = true;
    hubInfo.hidden = true;
    settingsSection.hidden = true;

    playerSection.hidden = false;

    if (playerFrameWrap) playerFrameWrap.hidden = true;

    hubPlayer.hidden = true;
    searchResultsPanel.hidden = false;

    openExternal.hidden = true;
    searchResultsPanel.replaceChildren();

    const loading = document.createElement("div");
    loading.className = "web-search-message";
    loading.textContent = "Searching the web...";
    searchResultsPanel.appendChild(loading);

    playerSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    try {
      const controller = new AbortController();

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000);

      let response;

      try {
        response = await fetch(SEARCH_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: input
          }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "The search service returned an error."
        );
      }

      if (!Array.isArray(data.results)) {
        throw new Error("The search service returned an invalid response.");
      }

      showSearchResults(input, data.results);

    } catch (error) {
      console.error("Web search failed:", error);

      searchResultsPanel.replaceChildren();

      const message = document.createElement("div");
      message.className = "web-search-message";

      if (error.name === "AbortError") {
        message.textContent =
          "Search timed out after 15 seconds. The Worker did not respond.";
      } else {
        message.textContent =
          "Search failed: " + (error.message || "Unknown error");
      }

      searchResultsPanel.appendChild(message);

      playerTitle.textContent = "🌐 Search Error";
      playerDescription.textContent =
        `Could not complete your search for: ${input}`;
    }
  });
}

/* =========================================
   CATEGORY FILTERS
========================================= */

allCategoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;

    allCategoryButtons.forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderHub();
  });
});

/* =========================================
   INITIAL LOAD
========================================= */

loadSavedTheme();
loadSavedBackgroundTheme();
renderHub();
