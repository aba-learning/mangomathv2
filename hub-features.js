/* =========================================
   MANGOHUB - GAME OF THE DAY + CUSTOM THEMES
   Loaded after hub.js. Leaves the main script intact.
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

    // UTC date makes the featured game consistent for everyone worldwide.
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

    // Inline body variables override the built-in preset CSS rules.
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
      if (theme.id === activeId) card.classList.add("is-active");

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

  if (accentInput) accentInput.addEventListener("input", updateColorLabels);
  if (backgroundInput) backgroundInput.addEventListener("input", updateColorLabels);

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
   * Built-in preset buttons should cancel a custom override.
   * Wrap the existing functions rather than changing hub.js.
   */
  if (typeof applyTheme === "function") {
    const originalApplyTheme = applyTheme;
    window.applyTheme = function(themeName, save = true) {
      document.body.style.removeProperty("--hub-accent");
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

  // Restore the previously selected custom theme after built-in themes load.
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
})();