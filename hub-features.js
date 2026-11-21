
/* =========================================
   MANGOHUB - GAME OF THE DAY + CUSTOM THEMES
   + KEYBOARD SHORTCUTS + COMPACT MODE
========================================= */

(() => {
  "use strict";

  /* =========================================
     GAME OF THE DAY
  ========================================= */

  const dailyGameName = document.getElementById("game-of-day-name");
  const dailyGameIcon = document.getElementById("game-of-day-icon");
  const dailyGameDate = document.getElementById("game-of-day-date");
  const dailyGameDescription = document.getElementById("game-of-day-description");
  const dailyGameButton = document.getElementById("game-of-day-play");

  function getDailyGame() {
    const games = hubItems.filter(item => item.category === "games");
    if (!games.length) return null;

    const now = new Date();
    const dateKey = [
      now.getUTCFullYear(),
      String(now.getUTCMonth() + 1).padStart(2, "0"),
      String(now.getUTCDate()).padStart(2, "0")
    ].join("-");

    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) {
      hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
    }

    return {
      game: games[hash % games.length],
      dateKey
    };
  }

  const dailySelection = getDailyGame();

  if (dailySelection && dailyGameName && dailyGameButton) {
    const { game, dateKey } = dailySelection;

    dailyGameName.textContent = game.name;
    dailyGameIcon.textContent = game.icon;
    dailyGameDate.textContent = `Featured for ${dateKey} · Changes daily`;
    dailyGameDescription.textContent = game.description;

    dailyGameButton.addEventListener("click", () => {
      openPlayer(game);
    });
  }

  /* =========================================
     CUSTOM THEME STORAGE + ELEMENTS
  ========================================= */

  const CUSTOM_THEMES_KEY = "mangohub_custom_themes";
  const ACTIVE_CUSTOM_THEME_KEY = "mangohub_active_custom_theme";

  const themeNameInput = document.getElementById("custom-theme-name");
  const accentInput = document.getElementById("custom-accent-color");
  const backgroundInput = document.getElementById("custom-background-color");
  const accentValue = document.getElementById("custom-accent-value");
  const backgroundValue = document.getElementById("custom-background-value");
  const previewButton = document.getElementById("preview-custom-theme");
  const saveButton = document.getElementById("save-custom-theme");
  const themeStatus = document.getElementById("custom-theme-status");
  const themeList = document.getElementById("custom-theme-list");

  function readCustomThemes() {
    try {
      const value = JSON.parse(localStorage.getItem(CUSTOM_THEMES_KEY) || "[]");

      return Array.isArray(value)
        ? value.filter(theme =>
            theme &&
            typeof theme.id === "string" &&
            typeof theme.name === "string" &&
            /^#[0-9a-f]{6}$/i.test(theme.accent) &&
            /^#[0-9a-f]{6}$/i.test(theme.background)
          )
        : [];
    } catch (error) {
      console.error("Could not load custom themes:", error);
      return [];
    }
  }

  let customThemes = readCustomThemes();

  function writeCustomThemes() {
    try {
      localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(customThemes));
      return true;
    } catch (error) {
      console.error("Could not save custom themes:", error);
      setStatus("Could not save themes. Browser storage may be full or unavailable.");
      return false;
    }
  }

  function setStatus(message) {
    if (themeStatus) themeStatus.textContent = message;
  }

  function updateColorLabels() {
    if (accentValue && accentInput) {
      accentValue.textContent = accentInput.value.toUpperCase();
    }

    if (backgroundValue && backgroundInput) {
      backgroundValue.textContent = backgroundInput.value.toUpperCase();
    }
  }

  function applyCustomTheme(theme, saveSelection = true) {
    if (!theme) return;

    document.body.style.setProperty("--hub-accent", theme.accent);
    document.body.style.setProperty("--hub-bg", theme.background);

    if (saveSelection) {
      try {
        localStorage.setItem(ACTIVE_CUSTOM_THEME_KEY, theme.id);
      } catch (error) {
        console.error("Could not remember active custom theme:", error);
      }
    }

    renderCustomThemes();
    setStatus(`Applied "${theme.name}".`);
  }

  function previewCurrentTheme() {
    const preview = {
      id: "__preview__",
      name: themeNameInput.value.trim() || "Preview",
      accent: accentInput.value,
      background: backgroundInput.value
    };

    document.body.style.setProperty("--hub-accent", preview.accent);
    document.body.style.setProperty("--hub-bg", preview.background);

    setStatus(`Previewing "${preview.name}". Save it to keep it in your theme list.`);
  }

  function renderCustomThemes() {
    if (!themeList) return;

    themeList.replaceChildren();

    if (!customThemes.length) {
      const empty = document.createElement("p");
      empty.className = "custom-theme-empty";
      empty.textContent = "No custom themes saved yet.";
      themeList.appendChild(empty);
      return;
    }

    let activeId = null;

    try {
      activeId = localStorage.getItem(ACTIVE_CUSTOM_THEME_KEY);
    } catch (error) {
      console.warn("Could not read active custom theme:", error);
    }

    customThemes.forEach(theme => {
      const card = document.createElement("div");
      card.className = "custom-theme-card";

      if (theme.id === activeId) {
        card.classList.add("is-active");
      }

      const top = document.createElement("div");
      top.className = "custom-theme-card-top";

      const swatches = document.createElement("span");
      swatches.className = "custom-theme-swatches";

      const accentSwatch = document.createElement("span");
      accentSwatch.className = "custom-theme-swatch";
      accentSwatch.style.background = theme.accent;

      const backgroundSwatch = document.createElement("span");
      backgroundSwatch.className = "custom-theme-swatch";
      backgroundSwatch.style.background = theme.background;

      swatches.append(accentSwatch, backgroundSwatch);

      const name = document.createElement("strong");
      name.textContent = theme.name;

      top.append(swatches, name);

      const actions = document.createElement("div");
      actions.className = "custom-theme-card-actions";

      const applyButton = document.createElement("button");
      applyButton.type = "button";
      applyButton.textContent = "Apply";
      applyButton.addEventListener("click", () => applyCustomTheme(theme));

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete-custom-theme";
      deleteButton.textContent = "Delete";

      deleteButton.addEventListener("click", () => {
        customThemes = customThemes.filter(item => item.id !== theme.id);

        if (!writeCustomThemes()) {
          customThemes = readCustomThemes();
          return;
        }

        let activeId = null;

        try {
          activeId = localStorage.getItem(ACTIVE_CUSTOM_THEME_KEY);
        } catch (error) {
          console.warn(error);
        }

        if (activeId === theme.id) {
          document.body.style.removeProperty("--hub-accent");
          document.body.style.removeProperty("--hub-bg");

          try {
            localStorage.removeItem(ACTIVE_CUSTOM_THEME_KEY);
          } catch (error) {
            console.warn(error);
          }

          setStatus(`Deleted "${theme.name}". The built-in theme colors are active again.`);
        } else {
          setStatus(`Deleted "${theme.name}".`);
        }

        renderCustomThemes();
      });

      actions.append(applyButton, deleteButton);
      card.append(top, actions);
      themeList.appendChild(card);
    });
  }

  if (accentInput) {
    accentInput.addEventListener("input", updateColorLabels);
  }

  if (backgroundInput) {
    backgroundInput.addEventListener("input", updateColorLabels);
  }

  if (previewButton) {
    previewButton.addEventListener("click", previewCurrentTheme);
  }

  if (saveButton) {
    saveButton.addEventListener("click", () => {
      const name = themeNameInput.value.trim();

      if (!name) {
        setStatus("Enter a name for your theme first.");
        themeNameInput.focus();
        return;
      }

      if (customThemes.length >= 30) {
        setStatus("You can save up to 30 custom themes. Delete one to make room.");
        return;
      }

      const theme = {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        accent: accentInput.value.toUpperCase(),
        background: backgroundInput.value.toUpperCase()
      };

      customThemes.push(theme);

      if (!writeCustomThemes()) {
        customThemes.pop();
        return;
      }

      applyCustomTheme(theme);
      themeNameInput.value = "";
      setStatus(`Saved and applied "${name}".`);
    });
  }

  /*
   * Built-in preset buttons cancel custom overrides.
   */

  if (typeof applyTheme === "function") {
    const originalApplyTheme = applyTheme;

    window.applyTheme = function(themeName, save = true) {
      document.body.style.removeProperty("--hub-accent");
      document.body.style.removeProperty("--hub-bg");

      try {
        localStorage.removeItem(ACTIVE_CUSTOM_THEME_KEY);
      } catch (error) {
        console.warn(error);
      }

      const result = originalApplyTheme(themeName, save);
      renderCustomThemes();
      return result;
    };
  }

  if (typeof applyBackgroundTheme === "function") {
    const originalApplyBackgroundTheme = applyBackgroundTheme;

    window.applyBackgroundTheme = function(themeName, save = true) {
      document.body.style.removeProperty("--hub-accent");
      document.body.style.removeProperty("--hub-bg");

      try {
        localStorage.removeItem(ACTIVE_CUSTOM_THEME_KEY);
      } catch (error) {
        console.warn(error);
      }

      const result = originalApplyBackgroundTheme(themeName, save);
      renderCustomThemes();
      return result;
    };
  }

  updateColorLabels();
  renderCustomThemes();

  // Restore the previously selected custom theme.
  try {
    const activeId = localStorage.getItem(ACTIVE_CUSTOM_THEME_KEY);
    const activeTheme = customThemes.find(theme => theme.id === activeId);

    if (activeTheme) {
      document.body.style.setProperty("--hub-accent", activeTheme.accent);
      document.body.style.setProperty("--hub-bg", activeTheme.background);
      setStatus(`"${activeTheme.name}" is currently active.`);
    }
  } catch (error) {
    console.error("Could not restore custom theme:", error);
  }

  /* =========================================
     COMPACT MODE
  ========================================= */

  const COMPACT_MODE_KEY = "mangohub_compact_mode";

  const compactStyle = document.createElement("style");

  compactStyle.textContent = `
    body.compact-mode .hub-grid {
      grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
      gap: 10px;
    }

    body.compact-mode .hub-card {
      padding: 12px;
      min-height: 0;
    }

    body.compact-mode .hub-card-icon {
      font-size: 25px;
      margin-bottom: 5px;
    }

    body.compact-mode .hub-card h3 {
      font-size: 14px;
      margin: 7px 0 4px;
    }

    body.compact-mode .hub-card p {
      font-size: 11px;
      line-height: 1.4;
      margin: 4px 0 8px;
    }

    body.compact-mode .hub-card-link {
      font-size: 10px;
    }

    body.compact-mode .recently-played-grid {
      grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
      gap: 10px;
    }

    body.compact-mode .recent-card {
      padding: 11px;
    }

    body.compact-mode .hub-section {
      margin-top: 22px;
    }

    @media (max-width: 500px) {
      body.compact-mode .hub-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `;

  document.head.appendChild(compactStyle);

  let compactMode = false;

  try {
    compactMode = localStorage.getItem(COMPACT_MODE_KEY) === "true";
  } catch (error) {
    console.warn("Could not load Compact Mode setting:", error);
  }

  function setCompactMode(enabled) {
    compactMode = Boolean(enabled);

    document.body.classList.toggle("compact-mode", compactMode);

    try {
      localStorage.setItem(COMPACT_MODE_KEY, String(compactMode));
    } catch (error) {
      console.warn("Could not save Compact Mode setting:", error);
    }

    updateCompactModeButton();
  }

  function toggleCompactMode() {
    setCompactMode(!compactMode);
  }

  /* =========================================
     SETTINGS CONTROLS
  ========================================= */

  const settingsSection = document.getElementById("settings-section");

  const settingsControls = document.createElement("section");
  settingsControls.className = "mangohub-extra-settings";

  settingsControls.innerHTML = `
    <div class="section-heading">
      <div>
        <span class="section-eyebrow">DISPLAY</span>
        <h2>Compact Mode</h2>
      </div>
    </div>

    <div class="mangohub-setting-row">
      <div>
        <strong>Smaller Game Cards</strong>
        <p>Fit more games on the screen with less spacing.</p>
      </div>

      <button
        type="button"
        id="compact-mode-toggle"
        aria-pressed="false"
      >
        Enable Compact Mode
      </button>
    </div>

    <div class="mangohub-setting-row">
      <div>
        <strong>Keyboard Shortcuts</strong>
        <p>Use keyboard keys to navigate MangoHub faster.</p>
      </div>

      <button type="button" id="open-shortcuts-guide">
        View Shortcuts
      </button>
    </div>
  `;

  const extraSettingsStyle = document.createElement("style");

  extraSettingsStyle.textContent = `
    .mangohub-extra-settings {
      margin-top: 38px;
      padding: 22px;
      background: var(--hub-card);
      border: 1px solid var(--hub-border);
      border-radius: 14px;
    }

    .mangohub-setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 16px 0;
      border-top: 1px solid var(--hub-border);
    }

    .mangohub-setting-row strong {
      color: white;
      display: block;
      margin-bottom: 5px;
    }

    .mangohub-setting-row p {
      color: var(--hub-muted);
      font-size: 13px;
      margin: 0;
    }

    .mangohub-setting-row button {
      flex-shrink: 0;
      padding: 10px 14px;
      color: #000;
      background: var(--hub-accent);
      border: none;
      border-radius: 8px;
      font-weight: 800;
      cursor: pointer;
    }

    .mangohub-setting-row button:hover {
      filter: brightness(1.1);
    }

    @media (max-width: 500px) {
      .mangohub-setting-row {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `;

  document.head.appendChild(extraSettingsStyle);

  if (settingsSection) {
    settingsSection.appendChild(settingsControls);
  }

  const compactToggle = document.getElementById("compact-mode-toggle");

  function updateCompactModeButton() {
    if (!compactToggle) return;

    compactToggle.textContent = compactMode
      ? "Disable Compact Mode"
      : "Enable Compact Mode";

    compactToggle.setAttribute("aria-pressed", String(compactMode));
  }

  if (compactToggle) {
    compactToggle.addEventListener("click", toggleCompactMode);
  }

  setCompactMode(compactMode);

  /* =========================================
     KEYBOARD SHORTCUT GUIDE
  ========================================= */

  const shortcutOverlay = document.createElement("div");
  shortcutOverlay.id = "mangohub-shortcuts-overlay";
  shortcutOverlay.hidden = true;

  shortcutOverlay.innerHTML = `
    <div
      class="mangohub-shortcuts-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mangohub-shortcuts-title"
    >
      <div class="mangohub-shortcuts-heading">
        <div>
          <span class="section-eyebrow">QUICK NAVIGATION</span>
          <h2 id="mangohub-shortcuts-title">⌨️ Keyboard Shortcuts</h2>
        </div>

        <button
          type="button"
          id="close-shortcuts-guide"
          aria-label="Close keyboard shortcuts"
        >✕</button>
      </div>

      <div class="mangohub-shortcut-list">
        <div><span>Focus Game Search</span><kbd>/</kbd></div>
        <div><span>Open Favorites</span><kbd>F</kbd></div>
        <div><span>Launch Random Game</span><kbd>R</kbd></div>
        <div><span>Exit Player / Close Guide</span><kbd>Esc</kbd></div>
        <div><span>Return Home</span><kbd>H</kbd></div>
        <div><span>Toggle Compact Mode</span><kbd>C</kbd></div>
        <div><span>Show Shortcut Guide</span><kbd>?</kbd></div>
      </div>

      <p class="mangohub-shortcuts-note">
        Shortcuts are paused while you're typing in a text field.
      </p>
    </div>
  `;

  const shortcutStyle = document.createElement("style");

  shortcutStyle.textContent = `
    #mangohub-shortcuts-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(0, 0, 0, .78);
      backdrop-filter: blur(7px);
    }

    #mangohub-shortcuts-overlay[hidden] {
      display: none !important;
    }

    .mangohub-shortcuts-panel {
      width: 100%;
      max-width: 470px;
      padding: 25px;
      color: white;
      background: var(--hub-card, #111);
      border: 1px solid var(--hub-accent, #ECEA98);
      border-radius: 16px;
      box-shadow: 0 20px 70px rgba(0, 0, 0, .5);
    }

    .mangohub-shortcuts-heading {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 15px;
      margin-bottom: 20px;
    }

    .mangohub-shortcuts-heading h2 {
      margin: 7px 0 0;
      color: var(--hub-accent);
      font-size: 22px;
    }

    #close-shortcuts-guide {
      width: 34px;
      height: 34px;
      color: white;
      background: transparent;
      border: 1px solid var(--hub-border);
      border-radius: 8px;
      font-size: 17px;
      cursor: pointer;
    }

    #close-shortcuts-guide:hover {
      color: var(--hub-accent);
      border-color: var(--hub-accent);
    }

    .mangohub-shortcut-list {
      display: grid;
      gap: 8px;
    }

    .mangohub-shortcut-list > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      padding: 11px 13px;
      background: rgba(255, 255, 255, .04);
      border: 1px solid var(--hub-border);
      border-radius: 9px;
      font-size: 14px;
    }

    .mangohub-shortcut-list kbd {
      min-width: 35px;
      padding: 5px 9px;
      color: var(--hub-accent);
      text-align: center;
      background: rgba(255, 255, 255, .08);
      border: 1px solid var(--hub-border);
      border-radius: 6px;
      font-weight: 800;
    }

    .mangohub-shortcuts-note {
      margin: 18px 0 0;
      color: var(--hub-muted);
      font-size: 12px;
      line-height: 1.5;
    }

    @media (max-width: 450px) {
      .mangohub-shortcuts-panel {
        padding: 18px;
      }

      .mangohub-shortcuts-heading h2 {
        font-size: 19px;
      }

      .mangohub-shortcut-list > div {
        font-size: 12px;
      }
    }
  `;

  document.head.appendChild(shortcutStyle);
  document.body.appendChild(shortcutOverlay);

  const closeShortcutButton = document.getElementById(
    "close-shortcuts-guide"
  );

  function openShortcutsGuide() {
    shortcutOverlay.hidden = false;
    closeShortcutButton.focus();
  }

  function closeShortcutsGuide() {
    shortcutOverlay.hidden = true;
  }

  closeShortcutButton.addEventListener("click", closeShortcutsGuide);

  shortcutOverlay.addEventListener("click", event => {
    if (event.target === shortcutOverlay) {
      closeShortcutsGuide();
    }
  });

  document.getElementById("open-shortcuts-guide")
    .addEventListener("click", openShortcutsGuide);

  /* =========================================
     KEYBOARD SHORTCUT ACTIONS
  ========================================= */

  function isTypingTarget(target) {
    if (!target) return false;

    return Boolean(
      target.closest(
        'input, textarea, select, [contenteditable="true"]'
      )
    );
  }

  function openFavorites() {
    const favoritesButton = document.querySelector(
      '.category-button[data-category="favorites"]'
    );

    if (favoritesButton) {
      favoritesButton.click();

      const library = document.getElementById("library-section");

      if (library) {
        library.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }
  }

  function launchRandomGame() {
    const games = hubItems.filter(item => item.category === "games");

    if (!games.length) return;

    const randomGame = games[
      Math.floor(Math.random() * games.length)
    ];

    openPlayer(randomGame);
  }

  function returnHome() {
    if (!document.getElementById("player-section").hidden) {
      closePlayer();
    }

    if (!settingsSection.hidden) {
      closeSettings();
    }

    const allButton = document.querySelector(
      '.category-button[data-category="all"]'
    );

    if (allButton) {
      allButton.click();
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  document.addEventListener("keydown", event => {
    const key = event.key;
    const typing = isTypingTarget(event.target);

    // Escape always closes the guide first.
    if (key === "Escape") {
      if (!shortcutOverlay.hidden) {
        closeShortcutsGuide();
        return;
      }

      if (typing) return;

      const player = document.getElementById("player-section");

      if (player && !player.hidden) {
        closePlayer();
      } else if (settingsSection && !settingsSection.hidden) {
        closeSettings();
      }

      return;
    }

    // Don't run normal shortcuts while the user is typing.
    if (typing || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if (key === "?" || (key === "/" && event.shiftKey)) {
      event.preventDefault();
      openShortcutsGuide();
      return;
    }

    if (shortcutOverlay.hidden === false) return;

    switch (key.toLowerCase()) {
      case "/":
        event.preventDefault();

        if (!settingsSection.hidden) {
          closeSettings();
        }

        if (!document.getElementById("player-section").hidden) {
          closePlayer();
        }

        if (hubSearch) {
          hubSearch.focus();
        }
        break;

      case "f":
        openFavorites();
        break;

      case "r":
        launchRandomGame();
        break;

      case "h":
        returnHome();
        break;

      case "c":
        toggleCompactMode();
        break;
    }
  });

})();
